import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  ChevronRight,
  Users,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, isMobile }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  // Close the sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      onToggle();
    }
  }, [location.pathname, isMobile]);

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: <LayoutDashboard size={20} />,
      roles: ['employee', 'manager', 'admin'],
    },
    {
      name: 'Leave Requests',
      path: '/leave-requests',
      icon: <Calendar size={20} />,
      roles: ['employee', 'manager', 'admin'],
    },
    {
      name: 'Payslips',
      path: '/payslips',
      icon: <FileText size={20} />,
      roles: ['employee'],
    },
    {
      name: 'Payslip Management',
      path: '/payslip-management',
      icon: <FileText size={20} />,
      roles: ['manager', 'admin'],
    },
    {
      name: 'Employees',
      path: '/employees',
      icon: <Users size={20} />,
      roles: ['manager', 'admin'],
    },
  ];

  // Filter items based on user role
  const filteredItems = navItems.filter(item => item.roles.includes(user.role));

  // Mobile sidebar
  if (isMobile) {
    return (
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => onToggle()} // Close when clicking outside
      >
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transition-transform transform duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
            <h1 className="text-xl font-bold text-sidebar-foreground">Harmony HR</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X size={20} />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {filteredItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive(item.path)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  )}
                >
                  <span className="flex items-center justify-center">{item.icon}</span>
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div 
      className={cn(
        "bg-sidebar text-sidebar-foreground h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64",
        "hidden md:flex" // Hide on mobile, use overlay instead
      )}
    >
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        <div className={cn("overflow-hidden", collapsed ? "hidden" : "block")}>
          <h1 className="text-xl font-bold text-sidebar-foreground">Harmony HR</h1>
        </div>
        {collapsed && (
          <div className="mx-auto">
            <h1 className="text-xl font-bold">HR</h1>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <ChevronRight size={20} className={cn("transition-transform", collapsed ? "" : "rotate-180")} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors",
                isActive(item.path)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground",
                collapsed ? "justify-center" : "justify-start"
              )}
            >
              <span className="flex items-center justify-center">{item.icon}</span>
              {!collapsed && <span className="ml-3">{item.name}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;