import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Phone, Navigation, MapPin,
  CheckCircle2, Package, Truck, User, ChevronDown, ChevronUp, Clock
} from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useUpdateRiderLocation } from '@/hooks/useRiderLocation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import UberStyleMap from '@/components/tracking/UberStyleMap';
import { supabase } from '@/integrations/supabase/client';

type DeliveryStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

const statusFlow: DeliveryStatus[] = ['picked_up', 'out_for_delivery', 'delivered'];

const RiderDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { profile } = useAuth();
  const { data: order, isLoading, refetch } = useOrder(orderId || '');
  const updateStatus = useUpdateOrderStatus();
  const updateLocation = useUpdateRiderLocation();
  const [showDetails, setShowDetails] = useState(false);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number>(10);
  const [distance, setDistance] = useState<number | null>(null);
  const [currentStreet, setCurrentStreet] = useState<string>('Calculating route...');
  const [isCompletingDelivery, setIsCompletingDelivery] = useState(false);

  const currentStatus = (order?.status as DeliveryStatus) || 'picked_up';

  // Determine destination based on current status
  const getDestination = useCallback(() => {
    if (currentStatus === 'picked_up' && order?.pickup_lat) {
      return { lat: Number(order.pickup_lat), lng: Number(order.pickup_lng) };
    }
    if (order?.delivery_lat) {
      return { lat: Number(order.delivery_lat), lng: Number(order.delivery_lng) };
    }
    return { lat: 5.6037, lng: -0.1870 };
  }, [currentStatus, order]);

  // Track rider's real-time location and update server
  useEffect(() => {
    if (!navigator.geolocation || !profile) return;

    const updatePos = (position: GeolocationPosition) => {
      const newLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setRiderLocation(newLoc);

      // Update rider location in database for customer tracking
      updateLocation.mutate({
        latitude: newLoc.lat,
        longitude: newLoc.lng,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        is_online: true,
      });
    };

    navigator.geolocation.getCurrentPosition(updatePos, console.error, { enableHighAccuracy: true });

    const watchId = navigator.geolocation.watchPosition(updatePos, console.error, { 
      enableHighAccuracy: true, 
      maximumAge: 3000 
    });

    return () => navigator.geolocation.clearWatch(watchId);
  }, [profile]);

  // Calculate live ETA using Mapbox Directions API
  useEffect(() => {
    const calculateETA = async () => {
      if (!riderLocation) return;

      const destination = getDestination();
      
      try {
        const { data: tokenData } = await supabase.functions.invoke('get-mapbox-token');
        if (!tokenData?.token) return;

        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${riderLocation.lng},${riderLocation.lat};${destination.lng},${destination.lat}?access_token=${tokenData.token}`
        );
        const data = await response.json();

        if (data.routes?.[0]) {
          const durationMinutes = Math.ceil(data.routes[0].duration / 60);
          const distanceKm = (data.routes[0].distance / 1000).toFixed(1);
          setEta(durationMinutes);
          setDistance(parseFloat(distanceKm));
        }

        // Also get current street name
        const geoResponse = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${riderLocation.lng},${riderLocation.lat}.json?access_token=${tokenData.token}&types=address,street`
        );
        const geoData = await geoResponse.json();
        if (geoData.features?.[0]?.text) {
          setCurrentStreet(geoData.features[0].text);
        }
      } catch (error) {
        console.error('Failed to calculate ETA:', error);
      }
    };

    calculateETA();
    const interval = setInterval(calculateETA, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [riderLocation, getDestination]);
  
  const getNextStatus = (): DeliveryStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= statusFlow.length - 1) return null;
    return statusFlow[currentIndex + 1];
  };

  const handleUpdateStatus = async () => {
    const nextStatus = getNextStatus();
    if (!nextStatus || !order || !profile) return;

    try {
      setIsCompletingDelivery(nextStatus === 'delivered');
      
      await updateStatus.mutateAsync({ orderId: order.id, status: nextStatus });
      
      if (nextStatus === 'delivered') {
        // Calculate rider earning (full delivery fee)
        const riderEarning = Number(order.delivery_fee) || 15;
        
        // Credit rider's wallet with full delivery fee
        const { data: riderWallet } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('user_id', profile.id)
          .single();

        if (riderWallet) {
          // Add earnings to rider wallet
          await supabase
            .from('wallets')
            .update({ balance: (riderWallet.balance || 0) + riderEarning })
            .eq('id', riderWallet.id);

          // Record transaction
          await supabase.from('transactions').insert({
            wallet_id: riderWallet.id,
            amount: riderEarning,
            type: 'rider_earning',
            description: `Delivery earning for order ${order.order_number}`,
            order_id: order.id,
          });
        }

        toast.success(`Delivery completed! You earned GH₵ ${riderEarning.toFixed(2)}`);
        toast.info('Customer will now be prompted to pay');
        
        setTimeout(() => navigate('/rider'), 2000);
      } else {
        toast.success(`Status updated to ${nextStatus.replace(/_/g, ' ')}`);
      }
      
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsCompletingDelivery(false);
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
          <Button onClick={() => navigate('/rider')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const destination = getDestination();
  const riderEarning = Number(order.delivery_fee) || 15;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Full-screen Map */}
      <div className="relative flex-1" style={{ minHeight: '50vh', height: '55vh' }}>
        <UberStyleMap
          riderLocation={riderLocation || undefined}
          destinationLocation={destination}
          eta={eta}
          currentStreet={currentStreet}
          isMoving={currentStatus !== 'delivered'}
        />

        {/* Back button overlay */}
        <button 
          onClick={() => navigate('/rider')}
          className="absolute top-4 left-4 z-10 w-10 h-10 bg-card rounded-full shadow-lg flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        {/* Order number badge */}
        <div className="absolute top-4 right-4 z-10 bg-card rounded-lg shadow-lg px-3 py-2">
          <p className="text-xs text-muted-foreground">Order</p>
          <p className="font-semibold text-foreground text-sm">{order.order_number}</p>
        </div>

        {/* Live ETA Badge */}
        {riderLocation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-primary text-primary-foreground rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-bold">{eta} min</span>
            {distance && <span className="text-sm opacity-80">• {distance} km</span>}
          </div>
        )}

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
                  ? 'Waiting for customer payment' 
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
                {formatCurrency(riderEarning)}
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
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.pickup_lat},${order.pickup_lng}`, '_blank');
                  }}
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="border-l-2 border-dashed border-border ml-1.5 h-4" />

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
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.delivery_lat},${order.delivery_lng}`, '_blank');
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
              disabled={updateStatus.isPending || isCompletingDelivery || !getNextStatus()}
              className={cn(
                "w-full h-14 text-lg font-semibold",
                currentStatus === 'out_for_delivery' 
                  ? "bg-success hover:bg-success/90 text-white" 
                  : "gradient-hero text-white"
              )}
            >
              {updateStatus.isPending || isCompletingDelivery ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isCompletingDelivery ? 'Processing payment...' : 'Updating...'}
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