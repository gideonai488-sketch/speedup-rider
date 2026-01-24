import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Store, 
  Bike, 
  ArrowLeft,
  Users,
  Settings,
  BarChart3,
  ChevronLeft,
  Menu,
  CreditCard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/admin/stores', icon: Store, label: 'Stores' },
  { path: '/admin/riders', icon: Bike, label: 'Riders' },
  { path: '/admin/rider-approvals', icon: Users, label: 'Approvals' },
  { path: '/admin/subaccounts', icon: CreditCard, label: 'Subaccounts' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminSidebarContent: React.FC = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <>
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🦉</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-sidebar-foreground">SpeedRush</span>
              <span className="text-xs text-sidebar-foreground/60">Admin Portal</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path;
                
                return (
                  <SidebarMenuItem key={path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={label}
                    >
                      <NavLink to={path}>
                        <Icon className="w-5 h-5" />
                        <span>{label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar */}
        <Sidebar collapsible="icon" className="hidden md:flex border-r border-border">
          <AdminSidebarContent />
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-50 gradient-glass border-b border-border/50">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center gap-3">
                {/* Mobile menu trigger */}
                <SidebarTrigger className="md:hidden" />
                
                {/* Desktop sidebar toggle */}
                <SidebarTrigger className="hidden md:flex" />
                
                <button
                  onClick={() => navigate('/customer')}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-foreground">{title || 'Admin'}</h1>
                  <p className="text-xs text-muted-foreground hidden sm:block">Admin Dashboard</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full gradient-hero flex items-center justify-center">
                  <span className="text-sm">🦉</span>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 pb-20 md:pb-6">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 gradient-glass border-t border-border/50 safe-area-pb md:hidden">
          <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
            {adminNavItems.slice(0, 5).map(({ path, icon: Icon, label }) => {
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
    </SidebarProvider>
  );
};

export default AdminLayout;