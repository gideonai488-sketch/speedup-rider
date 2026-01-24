import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, Phone, MessageSquare, MapPin,
  Star, Navigation, CreditCard, Wallet, ChevronUp
} from 'lucide-react';
import UberStyleMap from '@/components/tracking/UberStyleMap';
import FindingRider from '@/components/tracking/FindingRider';
import RatingModal from '@/components/rating/RatingModal';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { useRiderLocation } from '@/hooks/useRiderLocation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

type DeliveryStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

const TrackDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { data: order, isLoading: orderLoading, refetch } = useOrder(orderId || '');
  const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();
  const { data: riderLocation } = useRiderLocation(order?.rider_id || '');
  const [showPayment, setShowPayment] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [eta, setEta] = useState(15);
  const [currentStreet, setCurrentStreet] = useState('En route to you');

  // Update ETA based on status
  useEffect(() => {
    if (order?.status) {
      const etaMap: Record<string, number> = {
        pending: 35,
        confirmed: 30,
        preparing: 25,
        ready_for_pickup: 20,
        picked_up: 15,
        out_for_delivery: 10,
        delivered: 0,
      };
      setEta(etaMap[order.status] || 15);
    }
  }, [order?.status]);

  // Reverse geocode rider location to get street name
  useEffect(() => {
    const getStreetName = async () => {
      if (!riderLocation) return;
      try {
        const { data } = await supabase.functions.invoke('get-mapbox-token');
        if (!data?.token) return;
        
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${riderLocation.longitude},${riderLocation.latitude}.json?access_token=${data.token}&types=address,street`
        );
        const geoData = await response.json();
        if (geoData.features?.[0]?.text) {
          setCurrentStreet(geoData.features[0].text);
        }
      } catch {
        // Keep default
      }
    };
    getStreetName();
  }, [riderLocation]);

  const handlePayment = async (method: 'wallet' | 'momo' | 'card') => {
    if (!order) return;
    setIsProcessingPayment(true);

    try {
      // Use the edge function to process payment properly
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          orderId: order.id,
          paymentMethod: method,
          customerId: order.customer_id,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Payment failed');

      toast.success('Payment successful!');
      setShowPayment(false);
      refetch();
      
      // Show rating modal after successful payment
      setTimeout(() => setShowRating(true), 500);
    } catch (err: unknown) {
      console.error('Payment failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      toast.error(errorMessage);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleCancelOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      await updateOrderStatus({ orderId, status: 'cancelled' });
      toast.success('Order cancelled successfully');
      navigate('/orders');
    } catch (err) {
      console.error('Failed to cancel order:', err);
      toast.error('Failed to cancel order. Please try again.');
      throw err;
    }
  }, [orderId, updateOrderStatus, navigate]);

  const currentStatus = (order?.status as DeliveryStatus) || 'pending';
  const paymentStatus = (order as any)?.payment_status || 'pending';
  const isDelivered = currentStatus === 'delivered';
  const isOutForDelivery = currentStatus === 'out_for_delivery';
  // Customer pays when rider is out for delivery (before delivery is marked complete)
  const needsPayment = (isOutForDelivery || isDelivered) && paymentStatus === 'pending';
  const hasRider = !!order?.rider_id;
  const isFindingRider = !hasRider && ['pending'].includes(currentStatus);

  // Parse coordinates - Map shows RIDER and CUSTOMER locations, not pickup/dropoff
  // Customer location (delivery address) - where the order is going
  const customerLocation = {
    lat: Number(order?.delivery_lat) || 5.6145,
    lng: Number(order?.delivery_lng) || -0.2050,
  };

  // Rider location from real-time tracking
  const riderPos = riderLocation ? {
    lat: Number(riderLocation.latitude),
    lng: Number(riderLocation.longitude),
    heading: Number(riderLocation.heading) || 0,
  } : undefined;

  const rider = order?.rider as { full_name?: string; phone?: string; avatar_url?: string } | undefined;

  const formatCurrency = (value: number) => `GH₵ ${value?.toFixed(2) || '0.00'}`;

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button onClick={() => navigate('/orders')}>Go to Orders</Button>
        </div>
      </div>
    );
  }

  // Finding rider screen - show before map/locations appear
  if (isFindingRider) {
    return (
      <FindingRider
        pickupLat={Number(order.pickup_lat)}
        pickupLng={Number(order.pickup_lng)}
        pickupAddress={order.pickup_address || undefined}
        deliveryAddress={order.delivery_address}
        orderNumber={order.order_number || `#${orderId?.slice(0, 8)}`}
        totalAmount={Number(order.total)}
        onBack={() => navigate('/orders')}
        onCancel={handleCancelOrder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Full Screen Map */}
      <div className="h-[60vh] relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between safe-area-inset">
          <button
            onClick={() => navigate('/orders')}
            className="w-10 h-10 rounded-full bg-card shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-card rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {order.order_number || `#${orderId?.slice(0, 8)}`}
            </span>
            <div className={cn(
              "w-2 h-2 rounded-full",
              isDelivered ? "bg-success" : "bg-primary animate-pulse"
            )} />
          </div>
        </div>

        {/* Map - Shows rider and customer locations only */}
        <UberStyleMap
          riderLocation={riderPos}
          destinationLocation={customerLocation}
          eta={eta}
          currentStreet={currentStreet}
          isMoving={currentStatus === 'out_for_delivery' || currentStatus === 'picked_up'}
        />

        {/* Get Directions Button */}
        {riderPos && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <Button
              variant="default"
              className="w-full bg-foreground text-background hover:bg-foreground/90 rounded-xl py-6"
              onClick={() => {
                const url = `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}`;
                window.open(url, '_blank');
              }}
            >
              <Navigation className="w-5 h-5 mr-2" />
              GET DIRECTIONS
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 bg-card rounded-t-3xl shadow-2xl transition-all duration-300 z-30",
        showPayment ? "h-[70vh]" : "h-auto"
      )}>
        {/* Handle */}
        <button
          onClick={() => setShowPayment(!showPayment)}
          className="w-full flex justify-center py-3"
        >
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </button>

        <div className="px-6 pb-8">
          {/* Pickup & Dropoff Addresses as Text */}
          <div className="space-y-3 mb-4">
            {order.pickup_address && (
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">PICKUP</p>
                  <p className="text-sm font-medium text-foreground">{order.pickup_address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">DROPOFF</p>
                <p className="text-sm font-medium text-foreground">{order.delivery_address}</p>
              </div>
            </div>
          </div>

          {/* Rider Info */}
          {rider && (
            <div className="flex items-center gap-4 py-4 border-t border-border">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-lg">
                {rider.full_name?.charAt(0) || 'R'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{rider.full_name || 'Your Rider'}</p>
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-medium">4.8</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "w-3 h-3",
                          i < 4 ? "text-warning fill-warning" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-11 w-11"
                  onClick={() => toast.info('Messaging rider...')}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                {rider.phone && (
                  <a href={`tel:${rider.phone}`}>
                    <Button
                      size="icon"
                      className="rounded-full h-11 w-11 bg-primary hover:bg-primary/90"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Payment Section - Shows when rider is out for delivery or after */}
          {needsPayment && (
            <div className="pt-4 border-t border-border animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">Payment Required</p>
                  <p className="text-sm text-muted-foreground">
                    {isOutForDelivery ? 'Pay now to complete your delivery' : 'Please complete payment'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(Number(order.total))}</p>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-muted/50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>{formatCurrency(Number(order.delivery_fee))}</span>
                </div>
                {(order as any)?.surge_multiplier > 1 && (
                  <div className="flex justify-between text-sm text-warning">
                    <span>Surge ({((order as any).surge_multiplier - 1) * 100}%)</span>
                    <span>Included</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(Number(order.total))}</span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <Button
                  variant="hero"
                  className="w-full py-6"
                  onClick={() => handlePayment('wallet')}
                  disabled={isProcessingPayment}
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Pay with Wallet
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-6"
                  onClick={() => handlePayment('momo')}
                  disabled={isProcessingPayment}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Pay with Mobile Money
                </Button>
                <Button
                  variant="outline"
                  className="w-full py-6"
                  onClick={() => handlePayment('card')}
                  disabled={isProcessingPayment}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pay with Card
                </Button>
              </div>
            </div>
          )}

          {/* Payment Complete */}
          {paymentStatus === 'paid' && (
            <div className="pt-4 border-t border-border">
              <div className="bg-success/10 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-success">Payment Complete</p>
                    <p className="text-sm text-muted-foreground">
                      Paid {formatCurrency(Number(order.total))} via {(order as any).payment_method}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRating(true)}
                >
                  Rate
                </Button>
              </div>
            </div>
          )}

          {/* Order Details Toggle */}
          {showPayment && (
            <div className="pt-4 mt-4 border-t border-border space-y-4 animate-fade-in">
              <h3 className="font-semibold text-foreground">Order Details</h3>

              {/* Locations */}
              <div className="space-y-3">
                {order.pickup_address && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">PICKUP</p>
                      <p className="text-sm font-medium">{order.pickup_address}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">DROPOFF</p>
                    <p className="text-sm font-medium">{order.delivery_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Items</h4>
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span className="font-medium">{formatCurrency(Number(item.total_price))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Expand button */}
          {!showPayment && !needsPayment && (
            <button
              onClick={() => setShowPayment(true)}
              className="w-full flex items-center justify-center gap-2 pt-4 text-muted-foreground"
            >
              <span className="text-sm">View details</span>
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRating}
        onClose={() => setShowRating(false)}
        orderId={order.id}
        riderId={order.rider_id || undefined}
        storeId={(order as any).store_id || undefined}
        riderName={rider?.full_name}
        storeName={(order as any).stores?.name}
      />
    </div>
  );
};

export default TrackDelivery;
