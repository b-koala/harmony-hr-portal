
// User Types
export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
}

// Leave Types
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}

export interface LeaveQuota {
  id: string;
  employeeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

// Payslip Types
export interface Payslip {
  id: string;
  employeeId: string;
  month: number; // 1-12
  year: number;
  documentUrl: string;
  uploadedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
}
