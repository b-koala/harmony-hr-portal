import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  email: z.string().email('Please enter a valid email address'),
});

const ResetPasswordForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    
    try {
      console.log('Sending password reset email to:', data.email);
      
      // Using window.location.origin to ensure we get the correct localhost URL
      const redirectTo = `${window.location.origin}/reset-password`;
      console.log('Reset URL:', redirectTo);
      
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectTo,
      });
      
      if (error) {
        console.error('Reset password error:', error);
        throw error;
      }
      
      console.log('Password reset email sent successfully');
      setSuccess(true);
      form.reset();
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = error.message || 'Failed to send password reset email';
      
      // Handle specific error cases
      if (error.message?.includes('Email not found')) {
        errorMessage = 'No account found with this email address.';
      } else if (error.message?.includes('Email rate limit exceeded')) {
        errorMessage = 'Too many reset requests. Please try again later.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <h2 className="text-xl font-semibold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email to receive reset instructions
        </p>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-4 border-green-500 text-green-800 bg-green-50">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              If an account exists with this email, you will receive password reset instructions.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="you@company.com" 
                      autoComplete="email"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ResetPasswordForm;