import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, Sparkles, Droplets, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';

// Mock order data
const mockOrder = {
  id: 'ORD-2024-001',
  status: 'washing',
  items: [
    { name: 'Wash & Fold', quantity: 3 },
    { name: 'Express Wash', quantity: 1 },
  ],
  total: 95,
  pickupTime: 'Today, 10:00 AM',
  estimatedDelivery: 'Tomorrow, 6:00 PM',
};

const statusSteps = [
  { key: 'received', label: 'Order Received', icon: Package },
  { key: 'rider_pickup', label: 'Rider On The Way', icon: Truck },
  { key: 'picked_up', label: 'Picked Up', icon: CheckCircle2 },
  { key: 'washing', label: 'Washing', icon: Droplets },
  { key: 'drying', label: 'Drying', icon: Sparkles },
  { key: 'ready', label: 'Ready', icon: CheckCircle2 },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const currentStepIndex = statusSteps.findIndex((s) => s.key === mockOrder.status);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">My Orders</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Active Order Card */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Active Order
          </h2>
          
          <div className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
            {/* Order header */}
            <div className="p-4 gradient-hero">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-primary-foreground/70">Order ID</p>
                  <p className="font-bold text-primary-foreground">{mockOrder.id}</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                  <span className="text-xs font-semibold text-primary-foreground">
                    In Progress
                  </span>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="p-4 border-b border-border/50">
              <div className="space-y-2">
                {mockOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="font-medium">x{item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">GH₵ {mockOrder.total}</span>
              </div>
            </div>

            {/* Status tracker */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Est. delivery: {mockOrder.estimatedDelivery}</span>
              </div>

              <div className="space-y-3">
                {statusSteps.slice(0, 5).map((step, index) => {
                  const Icon = step.icon;
                  const isPast = index < currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  const isFuture = index > currentStepIndex;

                  return (
                    <div key={step.key} className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                          isCurrent && 'gradient-hero text-primary-foreground animate-pulse-glow',
                          isPast && 'bg-success/20 text-success',
                          isFuture && 'bg-muted text-muted-foreground'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p
                          className={cn(
                            'font-medium text-sm',
                            isCurrent && 'text-primary',
                            isPast && 'text-success',
                            isFuture && 'text-muted-foreground'
                          )}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <p className="text-xs text-muted-foreground">In progress...</p>
                        )}
                      </div>
                      {isPast && (
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Track Order Button */}
              <Button 
                onClick={() => navigate('/track/ORD-2024-001')}
                className="w-full mt-4 gradient-coral text-coral-foreground shadow-coral"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Track Live Location
              </Button>
            </div>
          </div>
        </section>

        {/* Past Orders */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Past Orders
          </h2>
          
          <div className="rounded-2xl bg-card border border-border/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">ORD-2024-000</p>
                <p className="text-xs text-muted-foreground">3 items • GH₵ 75</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-success font-medium">Delivered</span>
                <Button variant="outline" size="sm">
                  Reorder
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Orders;
