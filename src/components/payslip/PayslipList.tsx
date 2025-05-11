import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Payslip } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { fetchUserPayslips, getMonthName } from '@/services/payslipService';

const PayslipList: React.FC = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("all"); // Changed from empty string to "all"
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

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

  useEffect(() => {
    if (user) {
      loadPayslips();
    }
  }, [user, selectedMonth, selectedYear]);

  const loadPayslips = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Converting "all" to undefined for the month filter
      const month = selectedMonth === "all" ? undefined : parseInt(selectedMonth, 10);
      const year = selectedYear ? parseInt(selectedYear, 10) : undefined;
      
      console.log('Fetching payslips with filters:', { month, year });
      const payslipData = await fetchUserPayslips(month, year);
      console.log('Fetched payslips:', payslipData.length);
      setPayslips(payslipData);
    } catch (error) {
      console.error('Error loading payslips:', error);
      toast.error('Failed to load payslips', {
        description: 'Could not retrieve your payslip data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedMonth("all"); // Changed from empty string to "all"
    setSelectedYear(new Date().getFullYear().toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payslips</CardTitle>
        <CardDescription>View and download your payslips</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-1/3">
            <label className="text-sm font-medium mb-2 block">Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="All Months" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem> {/* Changed from empty string to "all" */}
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
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={resetFilters} className="w-full sm:w-auto">
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
                  <TableHead>Period</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payslips.map((payslip) => (
                  <TableRow key={payslip.id}>
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

export default PayslipList;