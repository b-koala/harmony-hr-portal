
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/AuthContext';
import { LeaveRequest, LeaveQuota } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { fetchLeaveRequests, fetchLeaveQuota } from '@/services/leaveService';

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [leaveQuota, setLeaveQuota] = React.useState<LeaveQuota | null>(null);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (user) {
      const loadDashboardData = async () => {
        try {
          // Get leave quota
          const quota = await fetchLeaveQuota();
          if (quota) {
            setLeaveQuota(quota);
          }
          
          // Get leave requests
          const requests = await fetchLeaveRequests();
          setLeaveRequests(requests);
          
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast.error('Error', { 
            description: 'Error loading dashboard data - please contact your IT administrator' 
          });
          setIsLoading(false);
        }
      };

      loadDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  const pendingRequests = leaveRequests.filter(request => request.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Leave Balance Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Leave Balance</CardTitle>
          <CardDescription>Your leave balance for {new Date().getFullYear()}</CardDescription>
        </CardHeader>
        <CardContent>
          {leaveQuota ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Annual Leave Quota</p>
                  <p className="text-3xl font-bold">{leaveQuota.totalDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Used</p>
                  <p className="text-3xl font-bold">{leaveQuota.usedDays} days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-3xl font-bold text-primary">{leaveQuota.remainingDays} days</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used ({leaveQuota.usedDays} days)</span>
                  <span>Total ({leaveQuota.totalDays} days)</span>
                </div>
                <Progress value={(leaveQuota.usedDays / leaveQuota.totalDays) * 100} />
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p>No leave quota data available.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
          <CardDescription>Status of your recent leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {leaveRequests.length > 0 ? (
            <div className="space-y-4">
              {leaveRequests.slice(0, 3).map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-muted-foreground" />
                        <span className="font-medium">
                          {format(new Date(request.startDate), 'MMM dd, yyyy')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${request.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </div>
                  </div>
                  {request.reviewComment && (
                    <div className="mt-2 text-sm border-t pt-2">
                      <p className="font-medium">Comment:</p>
                      <p className="text-muted-foreground">{request.reviewComment}</p>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-muted-foreground flex items-center">
                    <Clock size={12} className="mr-1" />
                    Requested on {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p>No leave requests found.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Pending Requests</AlertTitle>
          <AlertDescription>
            You have {pendingRequests.length} pending leave {pendingRequests.length === 1 ? 'request' : 'requests'} awaiting approval.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EmployeeDashboard;
