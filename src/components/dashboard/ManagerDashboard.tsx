
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { leaveRequests, users, mockUpdateLeaveRequest } from '@/data/mockData';
import { LeaveRequest, LeaveStatus } from '@/types';
import { toast } from '@/components/ui/sonner';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const ManagerDashboard: React.FC = () => {
  const [pendingRequests, setPendingRequests] = React.useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedRequest, setSelectedRequest] = React.useState<LeaveRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false);
  const [actionType, setActionType] = React.useState<LeaveStatus | null>(null);
  const [comment, setComment] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    try {
      // Get all pending leave requests
      const pending = leaveRequests.filter(request => request.status === 'pending');
      setPendingRequests(pending);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      toast.error('Error', { 
        description: 'Error - please contact your IT administrator' 
      });
      setIsLoading(false);
    }
  }, []);

  const handleAction = (request: LeaveRequest, action: LeaveStatus) => {
    setSelectedRequest(request);
    setActionType(action);
    setComment('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedRequest || !actionType) return;

    setIsSubmitting(true);
    try {
      // In a real app, you would have the actual manager ID from the authenticated user
      const managerId = 'user2'; // Mock manager ID
      
      // Update the leave request
      await mockUpdateLeaveRequest(selectedRequest.id, actionType, comment, managerId);
      
      // Update the UI
      setPendingRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
      
      // Show success message
      toast.success(`Leave request ${actionType}`, {
        description: `The leave request has been ${actionType} successfully.`
      });
      
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating leave request:', error);
      
      // Show specific manager error message
      toast.error(`Failed to ${actionType} request`, {
        description: `There was an error ${actionType === 'approved' ? 'approving' : 'rejecting'} the leave request. Please try again or contact your IT administrator.`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get employee name from user ID
  const getEmployeeName = (employeeId: string): string => {
    try {
      const employee = users.find(user => user.id === employeeId);
      return employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee';
    } catch (error) {
      console.error('Error fetching employee name:', error);
      return 'Unknown Employee';
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
          <CardDescription>Review and manage employee leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingRequests.length > 0 ? (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{getEmployeeName(request.employeeId)}</h3>
                      <p className="text-sm text-muted-foreground">{request.reason}</p>
                      <div className="mt-2">
                        <Badge variant="outline">
                          {format(new Date(request.startDate), 'MMM dd, yyyy')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAction(request, 'rejected')}
                        className="border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAction(request, 'approved')}
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    Requested on {format(new Date(request.requestedAt), 'MMM dd, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No pending leave requests to review.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approved' ? 'Approve' : 'Reject'} Leave Request
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approved' 
                ? 'Confirm approval of this leave request.'
                : 'Please provide a reason for rejecting this leave request.'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder={actionType === 'approved' 
                ? 'Add any comments (optional)' 
                : 'Please provide a reason for rejection'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
              required={actionType === 'rejected'}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || (actionType === 'rejected' && comment.trim() === '')}
              variant={actionType === 'approved' ? 'default' : 'destructive'}
            >
              {isSubmitting ? 'Processing...' : actionType === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
