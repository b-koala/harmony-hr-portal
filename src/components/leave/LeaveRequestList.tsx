import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LeaveRequest } from '@/types';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { fetchLeaveRequests, fetchAllLeaveRequests } from '@/services/leaveService';

const LeaveRequestList: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  React.useEffect(() => {
    if (user) {
      const loadLeaveRequests = async () => {
        try {
          console.log('Loading leave requests for user role:', user.role);
          
          // Fetch all requests if user is manager or admin, otherwise just the user's requests
          const requests = user.role === 'manager' || user.role === 'admin' 
            ? await fetchAllLeaveRequests()
            : await fetchLeaveRequests();
            
          console.log('Fetched leave requests:', requests.length);
          setLeaveRequests(requests);
          setIsLoading(false);
        } catch (error) {
          console.error('Error loading leave requests:', error);
          toast.error('Error', { 
            description: 'Error loading leave requests - please contact your IT administrator' 
          });
          setIsLoading(false);
        }
      };
      
      loadLeaveRequests();
    }
  }, [user]);

  const calculateDuration = (startDate: string, endDate: string): number => {
    try {
      return differenceInBusinessDays(
        parseISO(endDate),
        parseISO(startDate)
      ) + 1; // Include the start date
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading leave requests...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Leave Request History</h2>

      {leaveRequests.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {/* Only show Employee column for managers and admins */}
                {(user?.role === 'manager' || user?.role === 'admin') && (
                  <TableHead>Employee</TableHead>
                )}
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  {/* Only show Employee column for managers and admins */}
                  {(user?.role === 'manager' || user?.role === 'admin') && (
                    <TableCell>
                      {request.employeeName && request.employeeName !== 'Unknown' 
                        ? request.employeeName 
                        : <span className="text-muted-foreground italic">Unknown Employee</span>}
                    </TableCell>
                  )}
                  <TableCell>{format(new Date(request.startDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{format(new Date(request.endDate), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{calculateDuration(request.startDate, request.endDate)}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{request.reason}</TableCell>
                  <TableCell>{format(new Date(request.requestedAt), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No leave requests found.</p>
        </div>
      )}
    </div>
  );
};

export default LeaveRequestList;