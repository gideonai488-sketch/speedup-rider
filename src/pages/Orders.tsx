import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, Sparkles, Droplets, MapPin, ShoppingBag, Gavel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import { useUserOrders } from '@/hooks/useUserStats';
import { useOrderBids } from '@/hooks/useBids';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { key: 'ready_for_pickup', label: 'Ready for Pickup', icon: ShoppingBag },
  { key: 'picked_up', label: 'Picked Up', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2 },
];

// Small component to show bid count badge for an order
const BidCountBadge: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { data: bids = [] } = useOrderBids(orderId);
  if (bids.length === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full animate-pulse">
      <Gavel className="w-3 h-3" />
      {bids.length} bid{bids.length > 1 ? 's' : ''}
    </span>
  );
};

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useUserOrders();

  const activeOrders = orders?.filter(o => !['delivered', 'cancelled'].includes(o.status)) || [];
  const pastOrders = orders?.filter(o => ['delivered', 'cancelled'].includes(o.status)) || [];

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
          <Link to="/customer">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">My Orders</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">Start ordering from your favorite stores!</p>
            <Link to="/customer">
              <Button variant="hero">Browse Stores</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Active Orders ({activeOrders.length})
                </h2>
                
                {activeOrders.map((order) => {
                  const currentStepIndex = getStatusIndex(order.status);
                  
                  return (
                    <div key={order.id} className="rounded-2xl bg-card border border-border/50 shadow-card overflow-hidden">
                      {/* Order header */}
                      <div className="p-4 gradient-hero">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-primary-foreground/70">Order ID</p>
                            <p className="font-bold text-primary-foreground">{order.order_number || order.id.slice(0, 8)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {order.status === 'pending' && !order.rider_id && (
                              <BidCountBadge orderId={order.id} />
                            )}
                            <div className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                              <span className="text-xs font-semibold text-primary-foreground capitalize">
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order items */}
                      <div className="p-4 border-b border-border/50">
                        <div className="flex items-center gap-3 mb-3">
                          {order.stores?.logo_url && (
                            <img 
                              src={order.stores.logo_url} 
                              alt={order.stores.name}
                              className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                            />
                          )}
                          <span className="font-medium">{order.stores?.name || 'Store'}</span>
                        </div>
                        <div className="space-y-2">
                          {order.order_items?.slice(0, 3).map((item: any) => (
                            <div key={item.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{item.product_name}</span>
                              <span className="font-medium">x{item.quantity}</span>
                            </div>
                          ))}
                          {(order.order_items?.length || 0) > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{(order.order_items?.length || 0) - 3} more items
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-primary">GH₵ {Number(order.total).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Status tracker */}
                      <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>
                            {order.estimated_delivery 
                              ? `Est. delivery: ${format(new Date(order.estimated_delivery), 'MMM d, h:mm a')}`
                              : 'Estimating delivery time...'
                            }
                          </span>
                        </div>

                        <div className="space-y-3">
                          {statusSteps.slice(0, 4).map((step, index) => {
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

                        {/* Action Button */}
                        {order.status === 'pending' && !order.rider_id ? (
                          <Button 
                            onClick={() => navigate(`/track/${order.id}`)}
                            className="w-full mt-4 gradient-hero text-white"
                          >
                            <Gavel className="w-4 h-4 mr-2" />
                            View Bids
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => navigate(`/track/${order.id}`)}
                            className="w-full mt-4 gradient-coral text-coral-foreground shadow-coral"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Track Live Location
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {/* Past Orders */}
            {pastOrders.length > 0 && (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Past Orders ({pastOrders.length})
                </h2>
                
                <div className="space-y-2">
                  {pastOrders.map((order) => (
                    <div key={order.id} className="rounded-2xl bg-card border border-border/50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {order.stores?.logo_url && (
                            <img 
                              src={order.stores.logo_url} 
                              alt={order.stores.name}
                              className="w-10 h-10 rounded-lg object-contain bg-white p-1"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-foreground">
                              {order.order_number || order.id.slice(0, 8)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.order_items?.length || 0} items • GH₵ {Number(order.total).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-xs font-medium",
                            order.status === 'delivered' && 'text-success',
                            order.status === 'cancelled' && 'text-destructive'
                          )}>
                            {order.status === 'delivered' ? 'Delivered' : 'Cancelled'}
                          </span>
                          <Button variant="outline" size="sm">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Orders;
