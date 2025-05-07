
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import LeaveRequestList from '@/components/leave/LeaveRequestList';
import LeaveCard from '@/components/leave/LeaveCard';
import { useAuth } from '@/context/AuthContext';
import { getLeaveQuota } from '@/data/mockData';
import { LeaveQuota } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const [leaveQuota, setLeaveQuota] = React.useState<LeaveQuota | null>(null);

  React.useEffect(() => {
    if (user) {
      // Get current year
      const currentYear = new Date().getFullYear();
      
      // Get leave quota
      const quota = getLeaveQuota(user.id, currentYear);
      if (quota) {
        setLeaveQuota(quota);
      }
    }
  }, [user]);

  return (
    <DashboardLayout title="Leave Management" requiredRoles={['employee', 'manager', 'admin']}>
      {user?.role === 'employee' && (
        <div className="space-y-6">
          <LeaveCard leaveQuota={leaveQuota} />
          
          <Tabs defaultValue="history">
            <TabsList className="mb-6">
              <TabsTrigger value="history">Leave History</TabsTrigger>
              <TabsTrigger value="request">New Request</TabsTrigger>
            </TabsList>
            <TabsContent value="history">
              <LeaveRequestList />
            </TabsContent>
            <TabsContent value="request">
              <LeaveRequestForm />
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {user?.role === 'manager' && <LeaveRequestList />}
    </DashboardLayout>
  );
};

export default LeaveRequests;
