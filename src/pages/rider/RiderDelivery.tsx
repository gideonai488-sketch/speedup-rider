import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Phone, Navigation, MapPin,
  CheckCircle2, Package, Truck, ChevronUp, User
} from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type DeliveryStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

const statusFlow: DeliveryStatus[] = ['picked_up', 'out_for_delivery', 'delivered'];

const RiderDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useOrder(orderId || '');
  const updateStatus = useUpdateOrderStatus();
  const [showDetails, setShowDetails] = useState(false);

  const currentStatus = (order?.status as DeliveryStatus) || 'picked_up';
  
  const getNextStatus = (): DeliveryStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const handleUpdateStatus = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus || !order) return;

    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: nextStatus });
      toast.success(`Status updated to ${nextStatus.replace(/_/g, ' ')}`);
      refetch();
      
      if (nextStatus === 'delivered') {
        toast.success('Delivery completed! GH₵ 15 earned.');
        setTimeout(() => navigate('/rider/dashboard'), 2000);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusButtonText = () => {
    switch (currentStatus) {
      case 'picked_up':
        return 'Start Delivery';
      case 'out_for_delivery':
        return 'Complete Delivery';
      case 'delivered':
        return 'Delivered ✓';
      default:
        return 'Update Status';
    }
  };

  const formatCurrency = (value: number) => `GH₵ ${value?.toFixed(2) || '0.00'}`;

  // Get customer info from order
  const customer = (order as any)?.customer as { full_name?: string; phone?: string } | undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Skeleton className="h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-8" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate('/rider/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="gradient-dark text-white px-4 py-6 safe-area-inset">
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => navigate('/rider/dashboard')} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-lg font-bold">Active Delivery</h1>
            <p className="text-sm text-white/70">{order.order_number}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            currentStatus === 'delivered' ? "bg-success" : "bg-primary"
          )}>
            {currentStatus === 'delivered' ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : currentStatus === 'out_for_delivery' ? (
              <Truck className="w-6 h-6 text-white" />
            ) : (
              <Package className="w-6 h-6 text-white" />
            )}
          </div>
          <div>
            <p className="font-semibold capitalize">
              {currentStatus.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-white/70">
              {currentStatus === 'delivered' 
                ? 'Order delivered successfully' 
                : 'Tap below to update status'}
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Pickup & Dropoff Locations - TEXT DETAILS */}
        <section className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Delivery Details
          </h2>
          
          <div className="space-y-4">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PICKUP LOCATION</p>
                <p className="font-semibold text-foreground text-lg">
                  {(order as any).stores?.name || 'Pickup Point'}
                </p>
                <p className="text-muted-foreground">
                  {order.pickup_address || (order as any).stores?.address || 'Address not specified'}
                </p>
                {/* Navigate to Pickup */}
                {order.pickup_lat && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.pickup_lat},${order.pickup_lng}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate to Pickup
                  </Button>
                )}
              </div>
            </div>

            <div className="border-l-2 border-dashed border-border ml-2 h-8" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 rounded-full bg-success mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">DROPOFF LOCATION</p>
                <p className="font-semibold text-foreground text-lg">
                  {order.delivery_address}
                </p>
                {/* Navigate to Dropoff */}
                {order.delivery_lat && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_lat},${order.delivery_lng}`;
                      window.open(url, '_blank');
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate to Dropoff
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Customer Info */}
        <section className="bg-card rounded-2xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Customer Information
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">{customer?.full_name || 'Customer'}</p>
              {customer?.phone && (
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              )}
            </div>
            {customer?.phone && (
              <a href={`tel:${customer.phone}`}>
                <Button size="icon" className="rounded-full h-12 w-12 bg-primary">
                  <Phone className="w-5 h-5" />
                </Button>
              </a>
            )}
          </div>
        </section>

        {/* Order Notes */}
        {order.notes && (
          <section className="bg-card rounded-2xl border border-border p-5">
            <h2 className="font-semibold text-foreground mb-2">Notes</h2>
            <p className="text-muted-foreground">{order.notes}</p>
          </section>
        )}

        {/* Earning Info */}
        <section className="bg-success/10 rounded-2xl border border-success/20 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Your Earning</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency((Number(order.delivery_fee) || 15) - 5)}
              </p>
              <p className="text-xs text-muted-foreground">After GH₵ 5 platform fee</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Distance</p>
              <p className="font-semibold text-foreground">
                {(order as any).distance_km ? `${Number((order as any).distance_km).toFixed(1)} km` : 'N/A'}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Action */}
      {currentStatus !== 'delivered' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-area-inset">
          <Button
            onClick={handleUpdateStatus}
            disabled={updateStatus.isPending || !getNextStatus()}
            className={cn(
              "w-full h-14 text-lg font-semibold",
              currentStatus === 'out_for_delivery' 
                ? "bg-success hover:bg-success/90 text-white" 
                : "gradient-hero text-white"
            )}
          >
            {updateStatus.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            ) : (
              <>
                {currentStatus === 'out_for_delivery' && <CheckCircle2 className="w-5 h-5 mr-2" />}
                {currentStatus === 'picked_up' && <Truck className="w-5 h-5 mr-2" />}
                {getStatusButtonText()}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RiderDelivery;
