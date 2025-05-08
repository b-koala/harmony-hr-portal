
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [sidebarHidden, setSidebarHidden] = React.useState(true);
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      <Sidebar setSidebarHidden={setSidebarHidden} />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header title={title} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          {/* Mobile sidebar toggle button */}
          {isMobile && sidebarHidden && (
            <button 
              className="md:hidden mb-4 bg-primary text-white px-4 py-2 rounded-md shadow-sm"
              onClick={() => setSidebarHidden(false)}
            >
              Show Menu
            </button>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
