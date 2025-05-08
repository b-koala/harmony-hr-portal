
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { User, LeaveQuota } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';

const EmployeesList: React.FC = () => {
  const { toast: uiToast } = useToast();
  const [employeeData, setEmployeeData] = useState<User[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quotaData, setQuotaData] = useState<LeaveQuota | null>(null);
  const [totalDays, setTotalDays] = useState<number>(0);
  const [usedDays, setUsedDays] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      // Fetch all employees from Supabase
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'employee');

      if (error) {
        throw error;
      }

      if (profiles) {
        // Map profiles to our User type
        const usersData: User[] = profiles.map(profile => ({
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          role: profile.role as any,
          avatar: `https://ui-avatars.com/api/?name=${profile.first_name || ''}+${profile.last_name || ''}&background=0D8ABC&color=fff`
        }));
        
        setEmployeeData(usersData);
      }
    } catch (error: any) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employees', {
        description: error.message || 'Something went wrong'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigureQuota = async (employee: User) => {
    setSelectedEmployee(employee);
    
    try {
      // Find existing quota data or set defaults
      const { data: existingQuota, error } = await supabase
        .from('leave_quotas')
        .select('*')
        .eq('employee_id', employee.id)
        .eq('year', currentYear)
        .maybeSingle();
      
      if (error) {
        throw error;
      }
      
      if (existingQuota) {
        setQuotaData(existingQuota as any);
        setTotalDays(existingQuota.total_days);
        setUsedDays(existingQuota.used_days);
      } else {
        setQuotaData(null);
        setTotalDays(20); // Default annual leave value
        setUsedDays(0);
      }
      
      setIsDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching quota:', error);
      toast.error('Failed to fetch leave quota', {
        description: error.message || 'Something went wrong'
      });
    }
  };

  const handleSaveQuota = async () => {
    if (!selectedEmployee) return;
    
    try {
      const remainingDays = totalDays - usedDays;
      
      if (quotaData) {
        // Update existing quota
        const { error } = await supabase
          .from('leave_quotas')
          .update({
            total_days: totalDays,
            used_days: usedDays,
            updated_at: new Date().toISOString()
          })
          .eq('id', quotaData.id);
          
        if (error) throw error;
      } else {
        // Create new quota
        const { error } = await supabase
          .from('leave_quotas')
          .insert({
            employee_id: selectedEmployee.id,
            year: currentYear,
            total_days: totalDays,
            used_days: usedDays
          });
          
        if (error) throw error;
      }
      
      uiToast({
        title: "Leave quota updated",
        description: `${selectedEmployee.firstName} ${selectedEmployee.lastName}'s leave quota has been updated.`,
      });
      
      setIsDialogOpen(false);
      
      // Refresh the data
      loadEmployees();
      
    } catch (error: any) {
      console.error('Error saving quota:', error);
      toast.error('Failed to save leave quota', {
        description: error.message || 'Something went wrong'
      });
    }
  };

  const loadLeaveQuota = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('leave_quotas')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('year', currentYear)
        .maybeSingle();
        
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error loading leave quota:', error);
      return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading employees...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>View and manage employee leave quotas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Annual Leave Quota</TableHead>
                <TableHead>Used Days</TableHead>
                <TableHead>Remaining Days</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeeData.length > 0 ? (
                employeeData.map((employee) => (
                  <EmployeeRow 
                    key={employee.id}
                    employee={employee}
                    currentYear={currentYear}
                    loadLeaveQuota={loadLeaveQuota}
                    onConfigureQuota={handleConfigureQuota} 
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Leave Quota</DialogTitle>
            <DialogDescription>
              {selectedEmployee && `Set annual leave quota for ${selectedEmployee.firstName} ${selectedEmployee.lastName} for ${currentYear}.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="totalDays" className="text-right">
                Total Days:
              </label>
              <Input
                id="totalDays"
                type="number"
                value={totalDays}
                onChange={(e) => setTotalDays(Number(e.target.value))}
                className="col-span-3"
                min={0}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="usedDays" className="text-right">
                Used Days:
              </label>
              <Input
                id="usedDays"
                type="number"
                value={usedDays}
                onChange={(e) => setUsedDays(Number(e.target.value))}
                className="col-span-3"
                min={0}
                max={totalDays}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="text-right">
                Remaining Days:
              </label>
              <div className="col-span-3">
                {totalDays - usedDays}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveQuota}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Separate component for each employee row to handle individual loading states
const EmployeeRow: React.FC<{
  employee: User;
  currentYear: number;
  loadLeaveQuota: (employeeId: string) => Promise<any>;
  onConfigureQuota: (employee: User) => void;
}> = ({ employee, currentYear, loadLeaveQuota, onConfigureQuota }) => {
  const [quota, setQuota] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchQuota = async () => {
      setIsLoading(true);
      const quotaData = await loadLeaveQuota(employee.id);
      setQuota(quotaData);
      setIsLoading(false);
    };
    
    fetchQuota();
  }, [employee.id]);
  
  return (
    <TableRow key={employee.id}>
      <TableCell className="font-medium">
        {employee.firstName} {employee.lastName}
      </TableCell>
      <TableCell>{employee.email}</TableCell>
      {isLoading ? (
        <>
          <TableCell>Loading...</TableCell>
          <TableCell>Loading...</TableCell>
          <TableCell>Loading...</TableCell>
        </>
      ) : (
        <>
          <TableCell>{quota?.total_days || '-'}</TableCell>
          <TableCell>{quota?.used_days || '-'}</TableCell>
          <TableCell>{quota?.remaining_days || '-'}</TableCell>
        </>
      )}
      <TableCell className="text-right">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onConfigureQuota(employee)}
        >
          Configure Quota
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default EmployeesList;
