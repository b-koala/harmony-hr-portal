import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const formSchema = z.object({
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface NewPasswordFormProps {
  accessToken: string;
}

const NewPasswordForm: React.FC<NewPasswordFormProps> = ({ accessToken }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Handle the password recovery session
    const handleRecovery = async () => {
      try {
        console.log('Setting up recovery session with token:', accessToken.substring(0, 10) + '...');
        
        // Exchange the recovery token for a session
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: accessToken,
          type: 'recovery'
        });
        
        if (error) {
          console.error('Recovery verification failed:', error);
          setError('Invalid or expired reset link. Please request a new password reset.');
          return;
        }
        
        console.log('Recovery session established');
        setSessionReady(true);
      } catch (error: any) {
        console.error('Failed to setup recovery session:', error);
        setError('Invalid or expired reset link. Please request a new password reset.');
      }
    };

    if (accessToken) {
      handleRecovery();
    }
  }, [accessToken]);
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!sessionReady) {
      setError('Session not ready. Please try again.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    
    try {
      // Update the password (session should be active now)
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password
      });
      
      if (updateError) {
        throw updateError;
      }
      
      setSuccess(true);
      
      // Sign out to clear the recovery session
      await supabase.auth.signOut();
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (error: any) {
      console.error('Password update error:', error);
      let errorMessage = error.message || 'Failed to update password';
      
      if (error.message?.includes('session not found')) {
        errorMessage = 'Reset session expired. Please request a new password reset.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionReady && !error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <p>Setting up password reset...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !sessionReady) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Link 
              to="/reset-password"
              className="text-primary hover:underline"
            >
              Request new password reset
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert className="border-green-500 text-green-800 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Password updated successfully! Redirecting to login...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h2 className="text-xl font-semibold">Reset Password</h2>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
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
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        {...field} 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
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
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm new password"
                        {...field} 
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || !sessionReady}
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center border-t px-6 pt-4">
        <Link 
          to="/login"
          className="text-xs text-center w-full text-muted-foreground hover:text-primary transition-colors"
        >
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
};

export default NewPasswordForm;