import React from 'react';
import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import {
  Zap,
  Wallet,
  Clock,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const riderNavItems = [
  { path: '/rider', icon: Zap, label: 'Home' },
  { path: '/rider/earnings', icon: Wallet, label: 'Earnings' },
  { path: '/rider/deliveries', icon: Clock, label: 'History' },
  { path: '/rider/profile', icon: User, label: 'Profile' },
];

type BottomNavProps = React.ComponentPropsWithoutRef<'nav'>;

const BottomNav = React.forwardRef<HTMLElement, BottomNavProps>(({ className, ...props }, ref) => {
  const location = useLocation();

  return (
    <nav
      ref={ref}
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 gradient-glass border-t border-border/50 safe-area-pb',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {riderNavItems.map(({ path, icon: Icon, label }) => {
          const isActive =
            location.pathname === path ||
            (path === '/rider/profile' && location.pathname === '/rider/profile');

          return (
            <RouterNavLink
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full transition-all duration-300 relative',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <div className="relative">
                <Icon
                  className={cn('w-6 h-6 transition-transform duration-300', isActive && 'scale-110')}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  'text-[10px] mt-1 font-medium transition-all duration-300',
                  isActive && 'text-primary font-semibold',
                )}
              >
                {label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 gradient-hero rounded-full" />
              )}
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
});

BottomNav.displayName = 'BottomNav';

export default BottomNav;
