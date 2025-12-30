import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, ClipboardList, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/cart', icon: ShoppingBag, label: 'Cart' },
  { path: '/profile', icon: User, label: 'Profile' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 gradient-glass border-t border-border/50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const isCart = path === '/cart';

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
                {isCart && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 gradient-coral rounded-full text-xs font-bold text-coral-foreground flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
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
