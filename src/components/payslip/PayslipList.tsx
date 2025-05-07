
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPayslipsByFilter, getMonthName } from '@/data/mockData';
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

const years = [2025, 2024, 2023];
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

const PayslipList: React.FC = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = React.useState<Payslip[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>(new Date().getFullYear().toString());

  React.useEffect(() => {
    if (user) {
      loadPayslips();
    }
  }, [user, selectedMonth, selectedYear]);

  const loadPayslips = () => {
    if (!user) return;
    
    setIsLoading(true);
    
    const month = selectedMonth ? parseInt(selectedMonth, 10) : undefined;
    const year = selectedYear ? parseInt(selectedYear, 10) : undefined;
    
    const filteredPayslips = getPayslipsByFilter(user.id, month, year);
    // Sort by date (newest first)
    filteredPayslips.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    setPayslips(filteredPayslips);
    setIsLoading(false);
  };

  const resetFilters = () => {
    setSelectedMonth('');
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
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
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
