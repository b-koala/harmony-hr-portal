import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, LoginCredentials, AuthContextType } from '../types';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Create the context
export const AuthContext = createContext<AuthContextType | null>(null);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  // Check if user is already logged in and set up auth state listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', { event, session: currentSession?.user?.email || 'No session' });
        setSession(currentSession);
        
        // Handle password recovery
        if (event === 'PASSWORD_RECOVERY') {
          console.log('Password recovery event detected');
          // Don't set user yet, let the password reset flow handle this
          setIsLoading(false);
          return;
        }
        
        if (currentSession?.user) {
          // Instead of directly querying for profile, create a default user
          // with basic information from the auth session
          const defaultUser: User = {
            id: currentSession.user.id,
            email: currentSession.user.email || '',
            firstName: '',
            lastName: '',
            role: 'employee', // Default role
            avatar: `https://ui-avatars.com/api/?name=U+S&background=0D8ABC&color=fff`
          };
          
          setUser(defaultUser);
          
          // Then try to fetch additional profile data
          setTimeout(async () => {
            try {
              console.log('Fetching profile for user:', currentSession.user.id);
              // Get user profile data
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
                
              if (profileError) {
                console.error('Error fetching profile:', profileError);
                return;
              }
              
              if (profileData) {
                console.log('Profile data retrieved:', { 
                  email: profileData.email,
                  role: profileData.role 
                });
                
                // Update user with profile data
                const userProfile: User = {
                  id: currentSession.user.id,
                  email: profileData.email,
                  firstName: profileData.first_name || '',
                  lastName: profileData.last_name || '',
                  role: profileData.role as any,
                  avatar: `https://ui-avatars.com/api/?name=${profileData.first_name}+${profileData.last_name}&background=0D8ABC&color=fff`
                };
                setUser(userProfile);
              } else {
                console.warn('No profile data found for user:', currentSession.user.id);
              }
            } catch (error) {
              console.error('Error processing authenticated user:', error);
            }
          }, 0);
        } else {
          console.log('No active session, clearing user');
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession?.user?.email || 'No session found');
      if (!currentSession?.user) {
        setIsLoading(false);
      }
      // We'll let the onAuthStateChange handler above handle setting the user
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      console.log('Login attempt with email:', credentials.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error('Login failed with error:', error);
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Invalid email or password.",
        });
        throw error;
      }
      
      console.log('Login successful:', data.session?.user?.email);
      // User state will be set by the onAuthStateChange listener
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Login error:', error);
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
  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      // User state will be cleared by the onAuthStateChange listener
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "Something went wrong.",
      });
    }
  };

  // Reset password function
  const resetPassword = async (email: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
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
    isAuthenticated: !!session,
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