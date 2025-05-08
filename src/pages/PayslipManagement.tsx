
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PayslipUploadForm from '@/components/payslip/PayslipUploadForm';
import PayslipBrowseTable from '@/components/payslip/PayslipBrowseTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PayslipManagement: React.FC = () => {
  return (
    <DashboardLayout title="Payslip Management" requiredRoles={['manager', 'admin']}>
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="w-full mb-2 grid grid-cols-2 sm:w-auto sm:inline-flex">
          <TabsTrigger value="upload">Upload Payslips</TabsTrigger>
          <TabsTrigger value="browse">Browse Payslips</TabsTrigger>
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
