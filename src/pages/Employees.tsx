
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EmployeesList from '@/components/employees/EmployeesList';
import UserManagement from '@/components/employees/UserManagement';

const Employees: React.FC = () => {
  return (
    <DashboardLayout title="Employees" requiredRoles={['manager', 'admin']}>
      <div className="space-y-6">
        <UserManagement />
        <EmployeesList />
      </div>
    </DashboardLayout>
  );
};

export default Employees;
