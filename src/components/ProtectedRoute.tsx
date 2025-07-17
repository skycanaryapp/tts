import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from './ui/loading-spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="جاري التحقق من المصادقة..." />
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page with return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};