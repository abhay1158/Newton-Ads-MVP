import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Customer } from '@/types/database';
import { customerService } from '@/services/customer.service';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  organisation_name: z.string().min(2, 'Organisation name must be at least 2 characters'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  website_app_link: z.string().url('Must be a valid URL'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileCardProps {
  userId: string;
  userEmail: string;
  onClose: () => void;
}

export function ProfileCard({ userId, userEmail, onClose }: ProfileCardProps) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    loadCustomer();
  }, [userId]);

  const loadCustomer = async () => {
    try {
      const data = await customerService.getCustomer(userId);
      setCustomer(data);
      if (data) {
        reset({
          name: data.name,
          organisation_name: data.organisation_name,
          designation: data.designation,
          website_app_link: data.website_app_link,
        });
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setSubmitting(true);
      await customerService.upsertCustomer({
        user_id: userId,
        email: userEmail,
        ...data,
      });
      await loadCustomer();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Profile</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={userEmail}
            disabled
            className="w-full rounded-md border bg-gray-50 py-2 px-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            {...register('name')}
            type="text"
            className="w-full rounded-md border py-2 px-3"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Organisation Name</label>
          <input
            {...register('organisation_name')}
            type="text"
            className="w-full rounded-md border py-2 px-3"
          />
          {errors.organisation_name && (
            <p className="mt-1 text-sm text-red-500">{errors.organisation_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Designation</label>
          <input
            {...register('designation')}
            type="text"
            className="w-full rounded-md border py-2 px-3"
          />
          {errors.designation && (
            <p className="mt-1 text-sm text-red-500">{errors.designation.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Website/App Link</label>
          <input
            {...register('website_app_link')}
            type="url"
            className="w-full rounded-md border py-2 px-3"
          />
          {errors.website_app_link && (
            <p className="mt-1 text-sm text-red-500">{errors.website_app_link.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Profile'
          )}
        </Button>
      </form>
    </div>
  );
}