
import React from 'react';
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
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  setSidebarHidden: (hidden: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setSidebarHidden }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileHidden, setMobileHidden] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    // By default, hide sidebar on mobile but show on desktop
    setMobileHidden(isMobile);
  }, [isMobile]);

  React.useEffect(() => {
    // Sync the parent component's state with our local state
    setSidebarHidden(mobileHidden);
  }, [mobileHidden, setSidebarHidden]);

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

  return (
    <div 
      className={cn(
        "bg-sidebar text-sidebar-foreground h-screen transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64",
        mobileHidden ? "hidden md:flex" : "flex fixed inset-0 md:relative z-50"
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
        <div className="flex items-center">
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileHidden(true)}
            className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent mr-1"
          >
            <X size={20} />
          </Button>
          
          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hidden md:flex"
          >
            <ChevronRight size={20} className={cn("transition-transform", collapsed ? "" : "rotate-180")} />
          </Button>
        </div>
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
              onClick={() => isMobile && setMobileHidden(true)}
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
