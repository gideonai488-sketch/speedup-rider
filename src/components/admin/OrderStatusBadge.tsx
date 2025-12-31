import React from 'react';
import { cn } from '@/lib/utils';
import { AdminOrderStatus } from '@/types/admin';

interface OrderStatusBadgeProps {
  status: AdminOrderStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<AdminOrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-warning/20 text-warning border-warning/30' },
  confirmed: { label: 'Confirmed', className: 'bg-primary/20 text-primary border-primary/30' },
  picked_up: { label: 'Picked Up', className: 'bg-accent/20 text-accent border-accent/30' },
  processing: { label: 'Processing', className: 'bg-primary/20 text-primary border-primary/30' },
  ready: { label: 'Ready', className: 'bg-success/20 text-success border-success/30' },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-coral/20 text-coral border-coral/30' },
  delivered: { label: 'Delivered', className: 'bg-success/20 text-success border-success/30' },
  cancelled: { label: 'Cancelled', className: 'bg-destructive/20 text-destructive border-destructive/30' },
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full border',
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
      config.className
    )}>
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
