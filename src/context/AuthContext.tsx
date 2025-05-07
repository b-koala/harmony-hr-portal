
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials, AuthContextType } from '../types';
import { mockLogin, mockResetPassword } from '../data/mockData';
import { useToast } from '@/components/ui/use-toast';

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Check if user is already logged in (from localStorage in this case)
  useEffect(() => {
    const storedUser = localStorage.getItem('harmony_hr_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('harmony_hr_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const loggedInUser = await mockLogin(credentials.email, credentials.password);
      setUser(loggedInUser);
      localStorage.setItem('harmony_hr_user', JSON.stringify(loggedInUser));
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.firstName}!`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Something went wrong.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem('harmony_hr_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      await mockResetPassword(email);
      toast({
        title: "Password reset email sent",
        description: "Check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message || "Something went wrong.",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
