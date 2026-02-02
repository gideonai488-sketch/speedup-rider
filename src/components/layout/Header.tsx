import React from 'react';
import { MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-16 max-w-lg mx-auto">
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-foreground">Speed<span className="text-primary">Rush</span></span>
          </div>
          <span className="text-[9px] text-muted-foreground font-medium leading-tight -mt-0.5">
            by Genesis Holdings Inc. USA
          </span>
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
