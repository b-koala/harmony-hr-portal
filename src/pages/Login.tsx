
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';

const Login: React.FC = () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Harmony HR Portal</h1>
        <p className="text-muted-foreground mt-2">Sign in to access your HR dashboard</p>
        <p className="text-xs text-muted-foreground mt-2 px-4">
          <strong>Demo credentials:</strong> john.doe@company.com (employee) or jane.smith@company.com (manager) with password "password"
        </p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Login;
