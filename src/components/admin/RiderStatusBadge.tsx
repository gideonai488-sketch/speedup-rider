import React from 'react';
import { cn } from '@/lib/utils';

interface RiderStatusBadgeProps {
  status: 'available' | 'busy' | 'offline';
}

const statusConfig = {
  available: { label: 'Available', className: 'bg-success/20 text-success' },
  busy: { label: 'Busy', className: 'bg-warning/20 text-warning' },
  offline: { label: 'Offline', className: 'bg-muted text-muted-foreground' },
};

const RiderStatusBadge: React.FC<RiderStatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
      config.className
    )}>
      <span className={cn(
        'w-1.5 h-1.5 rounded-full',
        status === 'available' && 'bg-success animate-pulse',
        status === 'busy' && 'bg-warning',
        status === 'offline' && 'bg-muted-foreground'
      )} />
      {config.label}
    </span>
  );
};

export default RiderStatusBadge;
