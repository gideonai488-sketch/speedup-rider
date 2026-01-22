import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Store, 
  Bike, 
  ArrowLeft,
  Users,
  Settings,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Home' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/admin/stores', icon: Store, label: 'Stores' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const { toggleAdminMode } = useAdmin();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 gradient-glass border-b border-border/50">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAdminMode}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 gradient-glass border-t border-border/50 safe-area-pb">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {adminNavItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;

            return (
              <NavLink
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-300',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    'text-[10px] mt-1 font-medium transition-all duration-300',
                    isActive && 'text-primary font-semibold'
                  )}
                >
                  {label}
                </span>
                {isActive && (
                  <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 gradient-hero rounded-full" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AdminLayout;
