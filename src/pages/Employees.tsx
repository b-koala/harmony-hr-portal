
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeesList from '@/components/employees/EmployeesList';

const Employees: React.FC = () => {
  return (
    <DashboardLayout title="Employees" requiredRoles={['manager', 'admin']}>
      <EmployeesList />
    </DashboardLayout>
  );
};

export default Employees;
