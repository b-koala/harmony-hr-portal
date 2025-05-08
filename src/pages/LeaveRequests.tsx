
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import LeaveRequestForm from '@/components/leave/LeaveRequestForm';
import LeaveRequestList from '@/components/leave/LeaveRequestList';
import LeaveCard from '@/components/leave/LeaveCard';
import { useAuth } from '@/context/AuthContext';
import { LeaveQuota } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/sonner';
import { fetchLeaveQuota } from '@/services/leaveService';

const LeaveRequests: React.FC = () => {
  const { user } = useAuth();
  const [leaveQuota, setLeaveQuota] = React.useState<LeaveQuota | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (user) {
      const loadLeaveQuota = async () => {
        try {
          // Get leave quota
          const quota = await fetchLeaveQuota();
          if (quota) {
            setLeaveQuota(quota);
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading leave quota:', error);
          toast.error('Error', { 
            description: 'Error loading leave data - please contact your IT administrator' 
          });
          setIsLoading(false);
        }
      };
      
      loadLeaveQuota();
    }
  }, [user]);

  if (isLoading && user) {
    return (
      <DashboardLayout title="Leave Management" requiredRoles={['employee', 'manager', 'admin']}>
        <div className="text-center py-10">Loading leave data...</div>
      </DashboardLayout>
    );
  }

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
