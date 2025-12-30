import React from 'react';
import { MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Deliver to</span>
          <button className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors">
            <MapPin className="w-4 h-4 text-primary" />
            <span>East Legon, Accra</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-coral rounded-full" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
