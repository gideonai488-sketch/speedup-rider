import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Package, 
  Bike, 
  CheckCircle2,
  Clock,
  Truck,
  Sparkles
} from 'lucide-react';

interface TrackingStep {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  time?: string;
}

interface OrderTimelineProps {
  currentStatus: string;
  estimatedTime: string;
}

const steps: TrackingStep[] = [
  { id: 'confirmed', label: 'Order Confirmed', description: 'Your order has been received', icon: CheckCircle2 },
  { id: 'processing', label: 'Processing', description: 'Your clothes are being washed', icon: Sparkles },
  { id: 'ready', label: 'Ready for Pickup', description: 'Order is ready for delivery', icon: Package },
  { id: 'out_for_delivery', label: 'Out for Delivery', description: 'Rider is on the way', icon: Bike },
  { id: 'delivered', label: 'Delivered', description: 'Order has been delivered', icon: Truck },
];

const OrderTimeline: React.FC<OrderTimelineProps> = ({ currentStatus, estimatedTime }) => {
  const currentIndex = steps.findIndex(step => step.id === currentStatus);

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Order Status</h3>
        <div className="flex items-center gap-1.5 text-sm text-primary">
          <Clock className="w-4 h-4" />
          <span className="font-medium">{estimatedTime}</span>
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          return (
            <div key={step.id} className="relative flex gap-4">
              {/* Timeline line */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    'absolute left-[19px] top-10 w-0.5 h-[calc(100%-16px)]',
                    isCompleted ? 'bg-success' : 'bg-border'
                  )}
                />
              )}

              {/* Icon */}
              <div 
                className={cn(
                  'relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                  isCompleted && 'bg-success text-success-foreground',
                  isCurrent && 'bg-primary text-primary-foreground animate-pulse',
                  isPending && 'bg-muted text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className={cn(
                'flex-1 pb-6',
                isPending && 'opacity-50'
              )}>
                <p className={cn(
                  'font-medium',
                  isCurrent && 'text-primary'
                )}>
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {(isCompleted || isCurrent) && step.time && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.time}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
