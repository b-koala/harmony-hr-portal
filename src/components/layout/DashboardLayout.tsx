import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react'; // Import Menu icon

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  requiredRoles?: string[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title, 
  requiredRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed to more semantic name
  const isMobile = useIsMobile();

  // Show loading state
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role access if required
  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      {/* Pass the open state and toggle function to Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        isMobile={isMobile} 
      />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header title={title} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {/* Mobile sidebar toggle button - always visible on mobile */}
          {isMobile && (
            <Button 
              className="md:hidden mb-4 bg-primary text-white px-4 py-2 rounded-md shadow-sm fixed top-4 left-4 z-50"
              onClick={toggleSidebar}
              size="sm"
            >
              <Menu className="mr-2 h-4 w-4" />
              Menu
            </Button>
          )}
          
          {/* Add padding-top on mobile to avoid content being hidden behind the button */}
          <div className={isMobile ? "pt-12" : ""}>
            {children}
          </div>
        </main>
      </div>
      
      {/* Add Toaster for notifications */}
      <Toaster />
    </div>
  );
};

export default DashboardLayout;