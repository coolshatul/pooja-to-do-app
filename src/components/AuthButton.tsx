import React from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthButtonProps {
  disabled?: boolean;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ disabled }) => {
  const { user, signInWithGoogle, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg">
        <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-orange-700">Loading...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-orange-600" />
          )}
          <span className="text-sm text-orange-800 font-medium">
            {user.name || user.email}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      disabled={disabled}
      title={disabled ? "Button is disabled" : undefined}
      className={`flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300 transition-all duration-300 shadow-md hover:shadow-lg ${disabled ? 'cursor-not-allowed opacity-50 hover:bg-white' : ''}`}
    >
      <LogIn className="w-4 h-4" />
      <span className="text-sm font-medium">Sign in with Google</span>
    </button>
  );
};