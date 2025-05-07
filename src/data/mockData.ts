import { User, UserRole, LeaveRequest, LeaveStatus, LeaveQuota, Payslip } from '../types';

// Mock Users
export const users: User[] = [
  {
    id: 'user1',
    email: 'john.doe@company.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
  },
  {
    id: 'user2',
    email: 'jane.smith@company.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'manager',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&background=0D8ABC&color=fff',
  },
  {
    id: 'user3',
    email: 'admin@company.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0D8ABC&color=fff',
  },
];

// Mock Leave Requests
export const leaveRequests: LeaveRequest[] = [
  {
    id: 'leave1',
    employeeId: 'user1',
    startDate: '2025-06-01',
    endDate: '2025-06-05',
    reason: 'Annual vacation',
    status: 'pending',
    requestedAt: '2025-05-01T10:30:00Z',
  },
  {
    id: 'leave2',
    employeeId: 'user1',
    startDate: '2025-07-10',
    endDate: '2025-07-15',
    reason: 'Family event',
    status: 'approved',
    requestedAt: '2025-06-20T14:15:00Z',
    reviewedBy: 'user2',
    reviewedAt: '2025-06-22T09:45:00Z',
    reviewComment: 'Approved. Enjoy your time off.'
  },
  {
    id: 'leave3',
    employeeId: 'user1',
    startDate: '2025-03-03',
    endDate: '2025-03-04',
    reason: 'Medical appointment',
    status: 'rejected',
    requestedAt: '2025-02-15T11:20:00Z',
    reviewedBy: 'user2',
    reviewedAt: '2025-02-16T16:30:00Z',
    reviewComment: 'We have an important client meeting on those days. Please reschedule.'
  },
];

// Mock Leave Quotas
export const leaveQuotas: LeaveQuota[] = [
  {
    id: 'quota1',
    employeeId: 'user1',
    year: 2025,
    totalDays: 20,
    usedDays: 5,
    remainingDays: 15
  },
];

// Mock Payslips
export const payslips: Payslip[] = [
  {
    id: 'payslip1',
    employeeId: 'user1',
    month: 1, // January
    year: 2025,
    documentUrl: '/mockPayslips/jan2025.pdf',
    uploadedAt: '2025-01-31T23:59:59Z'
  },
  {
    id: 'payslip2',
    employeeId: 'user1',
    month: 2, // February
    year: 2025,
    documentUrl: '/mockPayslips/feb2025.pdf',
    uploadedAt: '2025-02-28T23:59:59Z'
  },
  {
    id: 'payslip3',
    employeeId: 'user1',
    month: 3, // March
    year: 2025,
    documentUrl: '/mockPayslips/mar2025.pdf',
    uploadedAt: '2025-03-31T23:59:59Z'
  },
  {
    id: 'payslip4',
    employeeId: 'user1',
    month: 4, // April
    year: 2025,
    documentUrl: '/mockPayslips/apr2025.pdf',
    uploadedAt: '2025-04-30T23:59:59Z'
  },
];

// Helper functions to work with mock data
export const getUser = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getUserByEmail = (email: string): User | undefined => {
  return users.find(user => user.email === email);
};

export const getLeaveRequests = (employeeId: string): LeaveRequest[] => {
  return leaveRequests.filter(request => request.employeeId === employeeId);
};

export const getLeaveRequestById = (id: string): LeaveRequest | undefined => {
  return leaveRequests.find(request => request.id === id);
};

export const getLeaveQuota = (employeeId: string, year: number): LeaveQuota | undefined => {
  return leaveQuotas.find(quota => quota.employeeId === employeeId && quota.year === year);
};

export const getPayslips = (employeeId: string): Payslip[] => {
  return payslips.filter(payslip => payslip.employeeId === employeeId);
};

export const getPayslipsByFilter = (employeeId: string, month?: number, year?: number): Payslip[] => {
  return payslips.filter(payslip => {
    const matchesEmployee = payslip.employeeId === employeeId;
    const matchesMonth = month ? payslip.month === month : true;
    const matchesYear = year ? payslip.year === year : true;
    return matchesEmployee && matchesMonth && matchesYear;
  });
};

export const getMonthName = (monthNumber: number): string => {
  const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August',
    'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
};

// Mock methods to simulate API calls
export const mockLogin = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getUserByEmail(email);
      if (user && password === 'password') { // Mock password check
        resolve(user);
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 500);
  });
};

export const mockResetPassword = (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = getUserByEmail(email);
      if (user) {
        console.log(`Password reset email sent to ${email}`);
        resolve();
      } else {
        reject(new Error('User not found'));
      }
    }, 500);
  });
};

export const mockCreateLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'requestedAt' | 'status'>): Promise<LeaveRequest> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRequest: LeaveRequest = {
        ...request,
        id: `leave${leaveRequests.length + 1}`,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };
      leaveRequests.push(newRequest);
      resolve(newRequest);
    }, 500);
  });
};

export const mockUpdateLeaveRequest = (id: string, status: LeaveStatus, reviewComment?: string, reviewedBy?: string): Promise<LeaveRequest> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = leaveRequests.findIndex(request => request.id === id);
      if (index !== -1) {
        leaveRequests[index] = {
          ...leaveRequests[index],
          status,
          reviewComment,
          reviewedBy,
          reviewedAt: new Date().toISOString(),
        };
        resolve(leaveRequests[index]);
      } else {
        reject(new Error('Leave request not found'));
      }
    }, 500);
  });
};

export const mockUpdateLeaveQuota = (employeeId: string, year: number, totalDays: number, usedDays: number): Promise<LeaveQuota> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Calculate remaining days
      const remainingDays = totalDays - usedDays;
      
      // Find if a quota already exists for this employee and year
      const quotaIndex = leaveQuotas.findIndex(
        quota => quota.employeeId === employeeId && quota.year === year
      );
      
      let updatedQuota: LeaveQuota;
      
      if (quotaIndex !== -1) {
        // Update existing quota
        leaveQuotas[quotaIndex] = {
          ...leaveQuotas[quotaIndex],
          totalDays,
          usedDays,
          remainingDays
        };
        updatedQuota = leaveQuotas[quotaIndex];
      } else {
        // Create new quota
        const newQuota: LeaveQuota = {
          id: `quota${leaveQuotas.length + 1}`,
          employeeId,
          year,
          totalDays,
          usedDays,
          remainingDays
        };
        leaveQuotas.push(newQuota);
        updatedQuota = newQuota;
      }
      
      resolve(updatedQuota);
    }, 500);
  });
};

export const mockUploadPayslip = (payslipData: Omit<Payslip, 'id' | 'uploadedAt'>): Promise<Payslip> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newPayslip: Payslip = {
        ...payslipData,
        id: `payslip${payslips.length + 1}`,
        uploadedAt: new Date().toISOString(),
      };
      payslips.push(newPayslip);
      resolve(newPayslip);
    }, 500);
  });
};
