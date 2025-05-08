
import React, { useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // Log user info for debugging
    console.log('Dashboard - Current user:', user);
    console.log('Dashboard - User role:', user?.role);
  }, [user]);

  return (
    <DashboardLayout title="Dashboard">
      <div className="w-full">
        {!user && (
          <Alert>
            <AlertDescription>
              Loading user data...
            </AlertDescription>
          </Alert>
        )}
        
        {user?.role === 'employee' && <EmployeeDashboard />}
        
        {user?.role === 'manager' && <ManagerDashboard />}
        
        {user?.role === 'admin' && (
          <Alert>
            <AlertDescription>
              Admin dashboard is not implemented in this demo.
            </AlertDescription>
          </Alert>
        )}
        
        {user && !['employee', 'manager', 'admin'].includes(user.role) && (
          <Alert>
            <AlertDescription>
              Unknown user role: {user.role}. Please contact your administrator.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
