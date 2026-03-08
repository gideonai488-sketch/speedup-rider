import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, User, Zap, Wallet, Clock, GraduationCap, Users, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const customerNavItems = [
  { path: '/customer', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const riderNavItems = [
  { path: '/rider', icon: Zap, label: 'Home' },
  { path: '/rider/earnings', icon: Wallet, label: 'Earnings' },
  { path: '/rider/deliveries', icon: Clock, label: 'History' },
  { path: '/rider/profile', icon: User, label: 'Profile' },
];

const ambassadorNavItems = [
  { path: '/ambassador', icon: GraduationCap, label: 'Home' },
  { path: '/ambassador/referrals', icon: Users, label: 'Referrals' },
  { path: '/ambassador/earnings', icon: Wallet, label: 'Earnings' },
  { path: '/ambassador/leaderboard', icon: Trophy, label: 'Ranks' },
  { path: '/ambassador/profile', icon: User, label: 'Profile' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { profile } = useAuth();

  const isAmbassador = profile?.role === 'ambassador' || location.pathname.startsWith('/ambassador');
  const isRider = profile?.role === 'rider' || location.pathname.startsWith('/rider');
  const navItems = isAmbassador ? ambassadorNavItems : isRider ? riderNavItems : customerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 gradient-glass border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path || 
            (path === '/profile' && location.pathname === '/profile') ||
            (path === '/rider/profile' && location.pathname === '/rider/profile');

          return (
            <NavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'w-6 h-6 transition-transform duration-300',
                    isActive && 'scale-110'
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
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
  );
};

export default BottomNav;
