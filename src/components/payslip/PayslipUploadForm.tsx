
import React, { useState } from 'react';
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
import { users, mockUploadPayslip } from '@/data/mockData';
import { useToast } from '@/components/ui/use-toast';

const PayslipUploadForm: React.FC = () => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState<boolean>(false);

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
  
  // Filter out manager and admin users, showing only employees
  const employees = users.filter(user => user.role === 'employee');

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
    if (!isFormValid()) return;

    setIsUploading(true);
    try {
      // In a real app, this would upload the file to a storage service
      // and save the metadata to a database
      const fileUrl = `/mockPayslips/${selectedFile?.name || 'payslip.pdf'}`;
      
      await mockUploadPayslip({
        employeeId: selectedEmployee,
        month: parseInt(selectedMonth, 10),
        year: parseInt(selectedYear, 10),
        documentUrl: fileUrl,
      });

      // Show success toast
      toast({
        title: "Payslip uploaded",
        description: "The payslip has been uploaded successfully.",
      });

      // Reset form
      setSelectedFile(null);
      setSelectedEmployee('');
      setSelectedMonth('');
      setSelectedYear(new Date().getFullYear().toString());
      setIsConfirmDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading the payslip.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (isFormValid()) {
      setIsConfirmDialogOpen(true);
    } else {
      toast({
        variant: "destructive",
        title: "Form incomplete",
        description: "Please fill all required fields.",
      });
    }
  };

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
                        {employee.firstName} {employee.lastName}
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
                      const employee = users.find(u => u.id === selectedEmployee);
                      return employee ? `${employee.firstName} ${employee.lastName}` : '';
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
