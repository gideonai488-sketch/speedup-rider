import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Phone, MessageSquare, Navigation, MapPin,
  CheckCircle2, Package, Truck, User, ChevronDown, ChevronUp, Clock,
  Locate, AlertTriangle
} from 'lucide-react';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useUpdateRiderLocation } from '@/hooks/useRiderLocation';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import UberStyleMap from '@/components/tracking/UberStyleMap';
import ChatView from '@/components/chat/ChatView';
import { supabase } from '@/integrations/supabase/client';

type DeliveryStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

const statusFlow: DeliveryStatus[] = ['confirmed', 'picked_up', 'out_for_delivery', 'delivered'];

const RiderDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { profile } = useAuth();
  const { data: order, isLoading, refetch } = useOrder(orderId || '');
  const updateStatus = useUpdateOrderStatus();
  const updateLocation = useUpdateRiderLocation();
  const [showDetails, setShowDetails] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [riderLocation, setRiderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<number>(10);
  const [distance, setDistance] = useState<number | null>(null);
  const [currentStreet, setCurrentStreet] = useState<string>('Calculating route...');
  const [isCompletingDelivery, setIsCompletingDelivery] = useState(false);
  const [isAcquiringGPS, setIsAcquiringGPS] = useState(true);
  const [gpsError, setGpsError] = useState<string | null>(null);

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
    if (!navigator.geolocation || !profile) {
      setGpsError('GPS not available on this device');
      setIsAcquiringGPS(false);
      return;
    }

    const updatePos = (position: GeolocationPosition) => {
      const newLoc = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setRiderLocation(newLoc);
      setIsAcquiringGPS(false);
      setGpsError(null);

      // Update rider location in database for customer tracking
      updateLocation.mutate({
        latitude: newLoc.lat,
        longitude: newLoc.lng,
        heading: position.coords.heading || undefined,
        speed: position.coords.speed || undefined,
        is_online: true,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      console.error('GPS Error:', error);
      setIsAcquiringGPS(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setGpsError('Location permission denied. Please enable GPS.');
          break;
        case error.POSITION_UNAVAILABLE:
          setGpsError('Location unavailable. Please check GPS settings.');
          break;
        case error.TIMEOUT:
          setGpsError('Location request timed out. Retrying...');
          break;
        default:
          setGpsError('Unable to get your location.');
      }
    };

    navigator.geolocation.getCurrentPosition(updatePos, handleError, { 
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });

    const watchId = navigator.geolocation.watchPosition(updatePos, handleError, { 
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

    // Block completing delivery until customer has paid
    if (nextStatus === 'delivered' && (order as any).payment_status !== 'paid') {
      toast.error('Customer must pay before you can complete delivery');
      toast.info('Please wait for customer to complete payment');
      return;
    }

    try {
      setIsCompletingDelivery(nextStatus === 'delivered');
      
      await updateStatus.mutateAsync({ orderId: order.id, status: nextStatus });
      
      if (nextStatus === 'delivered') {
        // Rider just reports delivery - earnings were already credited via payment
        const riderEarning = Number(order.delivery_fee) || 15;
        toast.success(`Delivery completed! You earned GH₵ ${riderEarning.toFixed(2)}`);
        setTimeout(() => navigate('/rider'), 2000);
      } else if (nextStatus === 'out_for_delivery') {
        toast.success('Status updated - customer will be prompted to pay');
        toast.info('Wait for payment before completing delivery');
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
    const paymentStatus = (order as any)?.payment_status || 'pending';
    switch (currentStatus) {
      case 'confirmed':
        return 'Start Delivery';
      case 'picked_up':
        return 'Arrived at Pickup';
      case 'out_for_delivery':
        return paymentStatus === 'paid' ? 'Complete Delivery' : 'Waiting for Payment...';
      case 'delivered':
        return 'Delivered ✓';
      default:
        return 'Update Status';
    }
  };

  const canComplete = () => {
    const paymentStatus = (order as any)?.payment_status || 'pending';
    if (currentStatus === 'out_for_delivery') {
      return paymentStatus === 'paid';
    }
    return true;
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
        {/* GPS Acquiring Overlay */}
        {isAcquiringGPS && (
          <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="relative mb-6">
              {/* Pulsing radar effect */}
              <div className="absolute inset-0 w-24 h-24 rounded-full bg-primary/20 animate-ping" />
              <div className="absolute inset-2 w-20 h-20 rounded-full bg-primary/30 animate-ping" style={{ animationDelay: '0.3s' }} />
              <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Locate className="w-10 h-10 text-primary animate-pulse" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Acquiring GPS Signal</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Please wait while we pinpoint your location for accurate navigation...
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>High accuracy mode enabled</span>
            </div>
          </div>
        )}

        {/* GPS Error Overlay */}
        {gpsError && !isAcquiringGPS && (
          <div className="absolute inset-0 z-30 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Location Error</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
              {gpsError}
            </p>
            <Button
              onClick={() => {
                setIsAcquiringGPS(true);
                setGpsError(null);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setRiderLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setIsAcquiringGPS(false);
                  },
                  () => {
                    setGpsError('Still unable to get location. Please check device settings.');
                    setIsAcquiringGPS(false);
                  },
                  { enableHighAccuracy: true, timeout: 15000 }
                );
              }}
              className="gap-2"
            >
              <Locate className="w-4 h-4" />
              Retry GPS
            </Button>
          </div>
        )}

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
                  ? 'Delivery complete!' 
                  : currentStatus === 'confirmed'
                    ? 'Heading to pickup location'
                    : currentStatus === 'picked_up' 
                      ? 'At pickup - confirm arrival'
                      : (order as any)?.payment_status === 'paid'
                        ? 'Payment received - complete delivery'
                        : 'At customer - waiting for payment'}
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

          {/* Customer Info with Message & Call */}
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
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full h-11 w-11"
                  onClick={() => setShowChat(true)}
                >
                  <MessageSquare className="w-5 h-5 text-primary" />
                </Button>
                {customer?.phone && (
                  <a href={`tel:${customer.phone}`}>
                    <Button size="icon" className="rounded-full h-11 w-11 bg-success hover:bg-success/90">
                      <Phone className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>
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
            {/* Payment waiting indicator */}
            {currentStatus === 'out_for_delivery' && !canComplete() && (
              <div className="mb-3 p-3 bg-warning/10 border border-warning/30 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-warning/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning">Waiting for Payment</p>
                  <p className="text-xs text-muted-foreground">Customer must pay before you can complete</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refetch()}
                  className="text-xs"
                >
                  Refresh
                </Button>
              </div>
            )}
            
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatus.isPending || isCompletingDelivery || !getNextStatus() || !canComplete()}
              className={cn(
                "w-full h-14 text-lg font-semibold",
                currentStatus === 'out_for_delivery' && canComplete()
                  ? "bg-success hover:bg-success/90 text-white" 
                  : currentStatus === 'out_for_delivery' && !canComplete()
                    ? "bg-muted text-muted-foreground"
                    : "gradient-hero text-white"
              )}
            >
              {updateStatus.isPending || isCompletingDelivery ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isCompletingDelivery ? 'Completing...' : 'Updating...'}
                </div>
              ) : (
                <>
                  {currentStatus === 'out_for_delivery' && canComplete() && <CheckCircle2 className="w-5 h-5 mr-2" />}
                  {currentStatus === 'confirmed' && <Truck className="w-5 h-5 mr-2" />}
                  {currentStatus === 'picked_up' && <MapPin className="w-5 h-5 mr-2" />}
                  {getStatusButtonText()}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      {/* Chat Overlay */}
      {showChat && order?.customer_id && (
        <div className="fixed inset-0 z-50">
          <ChatView
            otherProfileId={order.customer_id}
            otherName={customer?.full_name || 'Customer'}
            otherPhone={customer?.phone}
            orderId={order.id}
            onBack={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
};

export default RiderDelivery;