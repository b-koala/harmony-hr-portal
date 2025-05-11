import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { Payslip } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { fetchAllPayslips, getMonthName } from '@/services/payslipService';

const PayslipBrowseTable: React.FC = () => {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all"); // Changed from empty string to "all"
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // Changed from empty string to "all"
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [employees, setEmployees] = useState<{id: string, name: string}[]>([]);

  const years = [2023, 2024, 2025, 2026, 2027].map(year => year.toString());
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        console.log('Fetching employees for payslip browse table');
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role')
          .eq('role', 'employee');
        
        if (error) {
          throw error;
        }

        console.log('Fetched employee profiles:', data?.length || 0);
        const formattedEmployees = data.map(employee => {
          // Use name if available, otherwise use email
          const firstName = employee.first_name || '';
          const lastName = employee.last_name || '';
          const displayName = firstName || lastName ? 
            `${firstName} ${lastName}`.trim() : 
            employee.email || employee.id;
            
          return {
            id: employee.id,
            name: displayName
          };
        });
        
        setEmployees(formattedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees', {
          description: 'Could not retrieve employee list'
        });
      }
    };

    fetchEmployees();
  }, []);

  // Fetch payslips based on filters
  useEffect(() => {
    const loadPayslips = async () => {
      setIsLoading(true);
      try {
        // Convert "all" to undefined for filters
        const employeeId = selectedEmployee === "all" ? undefined : selectedEmployee;
        const month = selectedMonth === "all" ? undefined : parseInt(selectedMonth, 10);
        const year = selectedYear === "all" ? undefined : parseInt(selectedYear, 10);
        
        console.log('Fetching payslips with filters:', { employeeId, month, year });
        const data = await fetchAllPayslips(employeeId, month, year);
        console.log('Fetched payslips:', data?.length || 0);
        
        setPayslips(data);
      } catch (error) {
        console.error('Error fetching payslips:', error);
        toast.error('Error loading payslips', {
          description: 'Failed to load payslip data'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPayslips();
  }, [selectedEmployee, selectedMonth, selectedYear]);

  const resetFilters = () => {
    setSelectedEmployee("all");
    setSelectedMonth("all");
    setSelectedYear(new Date().getFullYear().toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payslip History</CardTitle>
        <CardDescription>Browse and filter all uploaded payslips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/3">
            <label className="text-sm font-medium mb-2 block">Employee</label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger>
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/3">
            <label className="text-sm font-medium mb-2 block">Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-1/3">
            <label className="text-sm font-medium mb-2 block">Year</label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading payslips...</div>
        ) : payslips.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      {payslip.employeeName && payslip.employeeName !== 'Unknown' 
                        ? payslip.employeeName 
                        : <span className="text-muted-foreground italic">Unknown Employee</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-muted-foreground" />
                        <span>
                          {getMonthName(payslip.month)} {payslip.year}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(payslip.uploadedAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={payslip.documentUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <p className="text-muted-foreground">No payslips found for the selected filters.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayslipBrowseTable;