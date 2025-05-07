
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PayslipUploadForm from '@/components/payslip/PayslipUploadForm';

const PayslipManagement: React.FC = () => {
  return (
    <DashboardLayout title="Payslip Management" requiredRoles={['manager', 'admin']}>
      <PayslipUploadForm />
    </DashboardLayout>
  );
};

export default PayslipManagement;
