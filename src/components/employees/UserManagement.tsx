import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const canCreateUsers = user?.role === 'manager' || user?.role === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreateUsers) {
      toast.error('Permission denied', {
        description: 'You do not have permission to create users.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      console.log('Calling Edge Function to create user...');

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password,
          firstName,
          lastName,
          role
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      // Check for Supabase function error first
      if (error) {
        console.error('Edge Function error:', error);
        throw error;
      }

      // Check the response data for success/error
      if (data && !data.success) {
        // Function returned successfully but with an error message
        throw new Error(data.error || 'Unknown error occurred');
      }

      console.log('User created successfully via Edge Function');

      // Success!
      toast.success('User created successfully', {
        description: `${firstName} ${lastName} has been added as a new ${role}.`
      });

      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('employee');

    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = 'An unexpected error occurred.';
      
      // Extract error message
      if (error.message) {
        errorMessage = error.message;
      } else if (error.context?.json?.error) {
        errorMessage = error.context.json.error;
      }
      
      // Handle specific error cases
      if (errorMessage.includes('User already registered') || 
          errorMessage.includes('already exists') ||
          errorMessage.includes('User with this email already exists')) {
        errorMessage = 'A user with this email already exists. Please use a different email.';
      } else if (errorMessage.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (errorMessage.includes('Insufficient permissions')) {
        errorMessage = 'You do not have permission to create users.';
      } else if (errorMessage.includes('Unauthorized')) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (errorMessage.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast.error('Failed to create user', {
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canCreateUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
          <CardDescription>Permission Required</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need manager or admin privileges to create new users.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New User</CardTitle>
        <CardDescription>Create a new user account with the specified role</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input 
                id="firstName" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input 
                id="lastName" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isSubmitting}
                placeholder="Enter last name"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Enter email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isSubmitting}
              placeholder="Enter password (min 6 characters)"
            />
            <p className="text-xs text-muted-foreground">
              Password must be at least 6 characters long.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select 
              value={role} 
              onValueChange={setRole}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create User'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserManagement;