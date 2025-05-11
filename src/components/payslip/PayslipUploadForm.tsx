import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { uploadPayslip } from '@/services/payslipService';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

const PayslipUploadForm: React.FC = () => {
  const { toast: uiToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const years = [2023, 2024, 2025, 2026, 2027].map(year => year.toString());
  
  // Fetch employees from Supabase
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, role')
          .eq('role', 'employee');
        
        if (error) {
          throw error;
        }

        const formattedEmployees = data.map(employee => {
          const firstName = employee.first_name || '';
          const lastName = employee.last_name || '';
          // Create a display name - use name if available, fallback to email
          const displayName = firstName || lastName ? 
            `${firstName} ${lastName}`.trim() : 
            employee.email || employee.id;
            
          return {
            id: employee.id,
            firstName: firstName,
            lastName: lastName,
            displayName: displayName
          };
        });
        
        setEmployees(formattedEmployees);
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error('Failed to load employees', {
          description: 'Could not retrieve employee list'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const isFormValid = () => {
    return (
      selectedFile !== null &&
      selectedEmployee !== '' &&
      selectedMonth !== '' &&
      selectedYear !== ''
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid() || !selectedFile) return;

    setIsUploading(true);
    try {
      await uploadPayslip(
        selectedFile,
        selectedEmployee,
        parseInt(selectedMonth, 10),
        parseInt(selectedYear, 10)
      );

      // Show success toast
      toast.success('Payslip uploaded', {
        description: 'The payslip has been uploaded successfully.'
      });

      // Reset form
      setSelectedFile(null);
      setSelectedEmployee('');
      setSelectedMonth('');
      setSelectedYear(new Date().getFullYear().toString());
      setIsConfirmDialogOpen(false);
    } catch (error: any) {
      toast.error('Upload failed', {
        description: error.message || 'There was an error uploading the payslip.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (isFormValid()) {
      setIsConfirmDialogOpen(true);
    } else {
      toast.error('Form incomplete', {
        description: 'Please fill all required fields.'
      });
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
          <CardTitle>Upload Payslip</CardTitle>
          <CardDescription>Upload payslips for employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="month">Month</Label>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
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
              </div>
              
              <div>
                <Label htmlFor="file">Payslip Document (PDF)</Label>
                <div className="mt-1 flex items-center">
                  <label 
                    htmlFor="file-upload" 
                    className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <span className="flex items-center">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose file
                    </span>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                  <span className="ml-4 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'No file selected'}
                  </span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleUploadClick} 
              className="w-full"
              disabled={!isFormValid()}
            >
              <FileText className="mr-2 h-4 w-4" />
              Upload Payslip
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payslip Upload</DialogTitle>
            <DialogDescription>
              Are you sure you want to upload the payslip for this employee?
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && selectedEmployee && (
            <div className="py-4">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm font-medium">Employee:</p>
                  <p className="text-sm">
                    {(() => {
                      const employee = employees.find(e => e.id === selectedEmployee);
                      return employee ? employee.displayName : '';
                    })()}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm font-medium">Month:</p>
                  <p className="text-sm">
                    {months.find(m => m.value === selectedMonth)?.label}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm font-medium">Year:</p>
                  <p className="text-sm">{selectedYear}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm font-medium">File:</p>
                  <p className="text-sm truncate">{selectedFile.name}</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? "Uploading..." : "Confirm Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PayslipUploadForm;