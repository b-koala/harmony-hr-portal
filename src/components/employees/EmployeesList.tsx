
import React, { useState } from 'react';
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
import { users, leaveQuotas } from '@/data/mockData';
import { User, LeaveQuota } from '@/types';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

const EmployeesList: React.FC = () => {
  const { toast } = useToast();
  const [employeeData, setEmployeeData] = useState(users.filter(user => user.role === 'employee'));
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quotaData, setQuotaData] = useState<LeaveQuota | null>(null);
  const [totalDays, setTotalDays] = useState<number>(0);
  const [usedDays, setUsedDays] = useState<number>(0);
  const currentYear = new Date().getFullYear();

  const handleConfigureQuota = (employee: User) => {
    setSelectedEmployee(employee);
    
    // Find existing quota data or set defaults
    const existingQuota = leaveQuotas.find(
      quota => quota.employeeId === employee.id && quota.year === currentYear
    );
    
    if (existingQuota) {
      setQuotaData(existingQuota);
      setTotalDays(existingQuota.totalDays);
      setUsedDays(existingQuota.usedDays);
    } else {
      setQuotaData(null);
      setTotalDays(20); // Default annual leave value
      setUsedDays(0);
    }
    
    setIsDialogOpen(true);
  };

  const handleSaveQuota = () => {
    if (!selectedEmployee) return;
    
    const remainingDays = totalDays - usedDays;
    
    // In a real application, this would make an API call to update the database
    // For now, we'll just show a success toast
    toast({
      title: "Leave quota updated",
      description: `${selectedEmployee.firstName} ${selectedEmployee.lastName}'s leave quota has been updated.`,
    });
    
    setIsDialogOpen(false);
  };

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
              {employeeData.map((employee) => {
                const quota = leaveQuotas.find(
                  q => q.employeeId === employee.id && q.year === currentYear
                );
                
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{quota?.totalDays || '-'}</TableCell>
                    <TableCell>{quota?.usedDays || '-'}</TableCell>
                    <TableCell>{quota?.remainingDays || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConfigureQuota(employee)}
                      >
                        Configure Quota
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
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

export default EmployeesList;
