import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

import Dashboard from "./pages/Dashboard";
import LeaveRequests from "./pages/LeaveRequests";
import Payslips from "./pages/Payslips";
import Employees from "./pages/Employees";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import PayslipManagement from "./pages/PayslipManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leave-requests" element={<LeaveRequests />} />
            <Route path="/payslips" element={<Payslips />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/payslip-management" element={<PayslipManagement />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;