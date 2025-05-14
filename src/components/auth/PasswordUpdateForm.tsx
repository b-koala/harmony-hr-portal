import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

const formSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const PasswordUpdateForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionSet, setSessionSet] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const setSessionFromUrl = async () => {
      // Check both URL params and hash for tokens
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      const type = urlParams.get('type') || hashParams.get('type');
      
      if (accessToken && refreshToken && type === 'recovery') {
        try {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            setError('Invalid reset link. Please request a new password reset.');
          } else {
            setSessionSet(true);
          }
        } catch (err) {
          console.error('Error setting session:', err);
          setError('Invalid reset link. Please request a new password reset.');
        }
      } else {
        // If no tokens in URL, check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSessionSet(true);
        } else {
          setError('Invalid reset link. Please request a new password reset.');
        }
      }
    };

    setSessionFromUrl();
  }, []);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!sessionSet) {
      setError('Please wait for authentication to complete.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        // Sign out the user so they can log in with new password
        supabase.auth.signOut().then(() => {
          navigate('/login');
        });
      }, 2000);
      
    } catch (error: any) {
      console.error('Password update error:', error);
      if (error.message?.includes('session')) {
        setError('Your session has expired. Please request a new password reset.');
      } else {
        setError(error.message || 'Failed to update password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h2 className="text-xl font-semibold">Password Updated Successfully</h2>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-500 text-green-800 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your password has been updated successfully. You will be redirected to the login page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <h2 className="text-xl font-semibold">Reset Password</h2>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!sessionSet && !error && (
          <Alert className="mb-4">
            <AlertDescription>
              Setting up your session...
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      disabled={!sessionSet}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      disabled={!sessionSet}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90" 
              disabled={isSubmitting || !sessionSet}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t px-6 pt-4">
        <Button 
          variant="link"
          onClick={() => navigate('/login')}
          className="text-xs text-center w-full text-muted-foreground hover:text-primary transition-colors"
        >
          Return to Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PasswordUpdateForm;