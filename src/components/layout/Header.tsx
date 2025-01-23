import { Link, useLocation } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { useAuth } from '@/hooks/useAuth';
import { RazorpayButton } from '@/components/payment/RazorpayButton';
import { Logo } from '@/components/ui/logo';

export function Header() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Logo />
                <h1 className="ml-2 text-2xl font-bold text-gray-900">
                  Newton Ads
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center h-10">
                  <RazorpayButton />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfile(true)}
                  className="h-10 w-10 p-0"
                >
                  <User className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="h-10"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sign out
                </Button>
              </div>
            </div>
            
            <nav className="flex space-x-8">
              <Link
                to="/newton-ai-agent"
                className={`px-3 py-2 text-sm font-medium transition-all relative ${
                  isActive('/newton-ai-agent')
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>Newton AI Agent</span>
                {isActive('/newton-ai-agent') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform animate-slideIn" />
                )}
              </Link>
              <Link
                to="/analytics"
                className={`px-3 py-2 text-sm font-medium transition-all relative ${
                  isActive('/analytics')
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>Analytics</span>
                {isActive('/analytics') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform animate-slideIn" />
                )}
              </Link>
              <Link
                to="/preview"
                className={`px-3 py-2 text-sm font-medium transition-all relative ${
                  isActive('/preview')
                    ? 'text-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>Preview</span>
                {isActive('/preview') && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform transition-transform animate-slideIn" />
                )}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {showProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <ProfileCard
            userId={user.$id}
            userEmail={user.email}
            onClose={() => setShowProfile(false)}
          />
        </div>
      )}
    </>
  );
}