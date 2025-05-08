
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PayslipUploadForm from '@/components/payslip/PayslipUploadForm';
import PayslipBrowseTable from '@/components/payslip/PayslipBrowseTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PayslipManagement: React.FC = () => {
  return (
    <DashboardLayout title="Payslip Management" requiredRoles={['manager', 'admin']}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="upload" className="flex-1 sm:flex-initial">Upload Payslips</TabsTrigger>
          <TabsTrigger value="browse" className="flex-1 sm:flex-initial">Browse Payslips</TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <PayslipUploadForm />
        </TabsContent>
        <TabsContent value="browse">
          <PayslipBrowseTable />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PayslipManagement;
