
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';
import { useAuth } from '@/context/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Dashboard">
      <div className="w-full">
        {user?.role === 'employee' && <EmployeeDashboard />}
        {user?.role === 'manager' && <ManagerDashboard />}
        {user?.role === 'admin' && (
          <Alert>
            <AlertDescription>
              Admin dashboard is not implemented in this demo.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
