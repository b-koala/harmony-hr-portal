import React, { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import NewPasswordForm from '@/components/auth/NewPasswordForm';

const ResetPassword: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  
  // Check if we have access token from email link
  const accessToken = searchParams.get('access_token');
  const token = searchParams.get('token'); // Alternative token parameter
  const type = searchParams.get('type');
  
  useEffect(() => {
    // If we have an access token and type is recovery, show new password form
    const validToken = accessToken || token;
    if (validToken && type === 'recovery') {
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
    }
  }, [accessToken, token, type]);

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
        <p className="text-muted-foreground mt-2">
          {isTokenValid ? 'Create new password' : 'Reset your password'}
        </p>
      </div>
      
      {isTokenValid ? (
        <NewPasswordForm accessToken={accessToken || token!} />
      ) : (
        <ResetPasswordForm />
      )}
    </div>
  );
};

export default ResetPassword;