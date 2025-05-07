
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

const ResetPassword: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Harmony HR Portal</h1>
        <p className="text-muted-foreground mt-2">Reset your password</p>
      </div>
      <ResetPasswordForm />
    </div>
  );
};

export default ResetPassword;
