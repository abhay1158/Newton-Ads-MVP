import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { account, handleAppwriteError } from '@/config/appwrite';
import { customerService } from '@/services/customer.service';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type AuthFormData = z.infer<typeof authSchema>;

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (mode === 'signup') {
        try {
          // Create the user account
          const newUser = await account.create(
            'unique()',
            data.email,
            data.password,
            data.email.split('@')[0]
          );

          // Create initial customer record
          await customerService.upsertCustomer({
            user_id: newUser.$id,
            email: data.email,
            name: '',
            organisation_name: '',
            designation: '',
            website_app_link: ''
          });
        } catch (err: any) {
          const errorMessage = handleAppwriteError(err);
          throw new Error(errorMessage);
        }
      }
      
      try {
        await account.createEmailSession(data.email, data.password);
        navigate('/newton-ai-agent');
        window.location.reload();
      } catch (err: any) {
        const errorMessage = handleAppwriteError(err);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      setError(error?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100 animate-shake">
          {error}
        </div>
      )}

      <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
        <label className="block text-sm font-medium mb-1">Email</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors group-hover:text-primary" />
          <input
            {...register('email')}
            type="email"
            className="pl-10 w-full rounded-md border py-2 px-3 transition-all duration-300
                     focus:ring-2 focus:ring-primary/20 focus:border-primary
                     hover:border-primary/50"
            placeholder="you@example.com"
            autoComplete={mode === 'login' ? 'username' : 'new-username'}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-500 animate-slideIn">{errors.email.message}</p>
        )}
      </div>

      <div className="transform transition-all duration-300 hover:translate-y-[-2px]">
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative group">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 transition-colors group-hover:text-primary" />
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            className="pl-10 pr-10 w-full rounded-md border py-2 px-3 transition-all duration-300
                     focus:ring-2 focus:ring-primary/20 focus:border-primary
                     hover:border-primary/50"
            placeholder="••••••••"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-primary transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-500 animate-slideIn">{errors.password.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full transform transition-all duration-300 hover:translate-y-[-2px]
                 hover:shadow-lg active:translate-y-0 active:shadow-md"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {mode === 'login' ? 'Signing in...' : 'Creating account...'}
          </>
        ) : (
          <span className="relative">
            <span className="block transition-all duration-300 transform group-hover:translate-y-[-2px]">
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </span>
          </span>
        )}
      </Button>
    </form>
  );
}