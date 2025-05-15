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
  // Supabase might send it as 'token', 'access_token', or in hash
  const tokenFromQuery = searchParams.get('access_token') || searchParams.get('token');
  const type = searchParams.get('type');
  
  // Also check hash params (Supabase sometimes puts tokens there)
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  useEffect(() => {
    let foundToken = tokenFromQuery;
    
    // If no token in query params, check hash
    if (!foundToken && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      foundToken = hashParams.get('access_token') || hashParams.get('token');
    }
    
    console.log('ResetPassword - URL params:', { 
      foundToken: !!foundToken, 
      type,
      allParams: Object.fromEntries(searchParams.entries()),
      hash: window.location.hash
    });
    
    if (foundToken) {
      setAccessToken(foundToken);
    }
    
    // If we have an access token and type is recovery, show new password form
    if (foundToken && type === 'recovery') {
      console.log('Valid reset token found');
      setIsTokenValid(true);
    } else {
      console.log('No valid reset token, showing request form');
      setIsTokenValid(false);
    }
  }, [tokenFromQuery, type, searchParams]);

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect if already authenticated and not resetting password
  if (isAuthenticated && !accessToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold text-primary">Harmony HR Portal</h1>
        <p className="text-muted-foreground mt-2">
          {isTokenValid ? 'Create your new password' : 'Reset your password'}
        </p>
      </div>
      
      {isTokenValid && accessToken ? (
        <NewPasswordForm accessToken={accessToken} />
      ) : (
        <ResetPasswordForm />
      )}
    </div>
  );
};

export default ResetPassword;