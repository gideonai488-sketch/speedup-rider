import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Phone, Navigation, MapPin,
  CheckCircle2, Package, Truck, User, ChevronDown, ChevronUp
} from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import UberStyleMap from '@/components/tracking/UberStyleMap';

type DeliveryStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

const statusFlow: DeliveryStatus[] = ['picked_up', 'out_for_delivery', 'delivered'];

const RiderDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { data: order, isLoading, refetch } = useOrder(orderId || '');
  const updateStatus = useUpdateOrderStatus();
  const [showDetails, setShowDetails] = useState(false);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);

  const currentStatus = (order?.status as DeliveryStatus) || 'picked_up';

  // Track rider's real-time location
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRiderLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true }
    );

    // Watch position updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setRiderLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);
  
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

  // Determine destination based on current status
  const getDestination = () => {
    if (currentStatus === 'picked_up' && order?.pickup_lat) {
      // Show pickup location when heading to pick up
      return { lat: Number(order.pickup_lat), lng: Number(order.pickup_lng) };
    }
    // Show delivery location when delivering
    if (order?.delivery_lat) {
      return { lat: Number(order.delivery_lat), lng: Number(order.delivery_lng) };
    }
    // Fallback to Accra
    return { lat: 5.6037, lng: -0.1870 };
  };

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

  const destination = getDestination();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Full-screen Map */}
      <div className="relative flex-1 min-h-[50vh]">
        <UberStyleMap
          riderLocation={riderLocation || undefined}
          destinationLocation={destination}
          eta={currentStatus === 'picked_up' ? 8 : 5}
          currentStreet={currentStatus === 'picked_up' ? 'Heading to pickup' : 'Delivering to customer'}
          isMoving={currentStatus !== 'delivered'}
        />

        {/* Back button overlay */}
        <button 
          onClick={() => navigate('/rider/dashboard')}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-card rounded-full shadow-lg flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Order number badge */}
        <div className="absolute top-4 right-4 z-10 bg-card rounded-lg shadow-lg px-3 py-2">
          <p className="text-xs text-muted-foreground">Order</p>
          <p className="font-semibold text-foreground text-sm">{order.order_number}</p>
        </div>

        {/* Status Badge Overlay */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className={cn(
            "rounded-xl p-4 flex items-center gap-3 shadow-lg",
            currentStatus === 'delivered' ? "bg-success text-white" : "bg-card"
          )}>
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              currentStatus === 'delivered' ? "bg-white/20" : "bg-primary"
            )}>
              {currentStatus === 'delivered' ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : currentStatus === 'out_for_delivery' ? (
                <Truck className="w-6 h-6 text-white" />
              ) : (
                <Package className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <p className={cn(
                "font-semibold capitalize",
                currentStatus === 'delivered' ? "text-white" : "text-foreground"
              )}>
                {currentStatus.replace(/_/g, ' ')}
              </p>
              <p className={cn(
                "text-sm",
                currentStatus === 'delivered' ? "text-white/80" : "text-muted-foreground"
              )}>
                {currentStatus === 'delivered' 
                  ? 'Order delivered successfully' 
                  : currentStatus === 'picked_up' 
                    ? 'Head to pickup location'
                    : 'Heading to customer'}
              </p>
            </div>
            <div className="text-right">
              <p className={cn(
                "text-2xl font-bold",
                currentStatus === 'delivered' ? "text-white" : "text-success"
              )}>
                {formatCurrency((Number(order.delivery_fee) || 15) - 5)}
              </p>
              <p className={cn(
                "text-xs",
                currentStatus === 'delivered' ? "text-white/70" : "text-muted-foreground"
              )}>
                Your earning
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sheet with Details */}
      <div className="bg-card border-t border-border rounded-t-3xl -mt-4 relative z-20">
        {/* Drag Handle */}
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex flex-col items-center pt-3 pb-2"
        >
          <div className="w-12 h-1 bg-border rounded-full mb-2" />
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            {showDetails ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            {showDetails ? 'Hide details' : 'Show details'}
          </div>
        </button>

        <div className={cn(
          "px-4 overflow-hidden transition-all duration-300",
          showDetails ? "max-h-[60vh] pb-4" : "max-h-0"
        )}>
          {/* Pickup & Dropoff Locations */}
          <section className="space-y-4 mb-4">
            {/* Pickup */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase">PICKUP</p>
                <p className="font-semibold text-foreground">
                  {(order as any).stores?.name || 'Pickup Point'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.pickup_address || (order as any).stores?.address || 'Address not specified'}
                </p>
              </div>
              {order.pickup_lat && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.pickup_lat},${order.pickup_lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="border-l-2 border-dashed border-border ml-1.5 h-4" />

            {/* Dropoff */}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase">DROPOFF</p>
                <p className="font-semibold text-foreground">{order.delivery_address}</p>
              </div>
              {order.delivery_lat && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${order.delivery_lat},${order.delivery_lng}`;
                    window.open(url, '_blank');
                  }}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>
          </section>

          {/* Customer Info */}
          <section className="bg-secondary/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{customer?.full_name || 'Customer'}</p>
                  {customer?.phone && (
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  )}
                </div>
              </div>
              {customer?.phone && (
                <a href={`tel:${customer.phone}`}>
                  <Button size="icon" className="rounded-full h-11 w-11 bg-success hover:bg-success/90">
                    <Phone className="w-5 h-5" />
                  </Button>
                </a>
              )}
            </div>
          </section>

          {/* Order Notes */}
          {order.notes && (
            <section className="bg-warning/10 rounded-xl p-4 mb-4">
              <p className="text-xs text-muted-foreground font-medium uppercase mb-1">Notes</p>
              <p className="text-foreground">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Action Button */}
        {currentStatus !== 'delivered' && (
          <div className="px-4 pb-4 safe-area-pb">
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
    </div>
  );
};

export default RiderDelivery;
