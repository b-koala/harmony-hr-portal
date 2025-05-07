
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PayslipList from '@/components/payslip/PayslipList';

const Payslips: React.FC = () => {
  return (
    <DashboardLayout title="Payslips" requiredRoles={['employee']}>
      <PayslipList />
    </DashboardLayout>
  );
};

export default Payslips;
