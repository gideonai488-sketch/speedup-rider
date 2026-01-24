import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Package } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RiderMap from '@/components/tracking/RiderMap';
import OrderTimeline from '@/components/tracking/OrderTimeline';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useRiderLocation } from '@/hooks/useRiderLocation';

const TrackOrder: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*),
            stores(name, address)
          `)
          .eq('order_number', orderId)
          .maybeSingle();

        if (error) throw error;
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // Subscribe to order updates
  useEffect(() => {
    if (!orderId) return;

    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `order_number=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev: any) => ({ ...prev, ...payload.new }));
          toast.info('Order status updated');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Use rider location hook for real-time tracking
  const { data: riderLocationData } = useRiderLocation(order?.rider_id);

  const formatCurrency = (value: number) => `GH₵ ${value?.toLocaleString() || 0}`;

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Order Placed',
      confirmed: 'Order Confirmed',
      preparing: 'Preparing',
      ready_for_pickup: 'Ready for Pickup',
      picked_up: 'Picked Up',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading order...</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <MapPin className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-foreground mb-2">Order Not Found</h2>
        <p className="text-muted-foreground text-center mb-4">
          The order you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/customer')} variant="outline">
          Go Home
        </Button>
      </div>
    );
  }

  const riderPos = riderLocationData 
    ? { lat: Number(riderLocationData.latitude), lng: Number(riderLocationData.longitude) }
    : { lat: 5.5620, lng: -0.1920 };
  const destination = { 
    lat: Number(order.delivery_lat) || 5.5560, 
    lng: Number(order.delivery_lng) || -0.1869 
  };
  const pickup = order.pickup_lat ? {
    lat: Number(order.pickup_lat),
    lng: Number(order.pickup_lng)
  } : undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 gradient-glass border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-foreground">Track Order</h1>
              <p className="text-xs text-muted-foreground">{order.order_number}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <div className="h-[280px] relative">
        <RiderMap
          riderLocation={riderPos}
          destinationLocation={destination}
          pickupLocation={pickup}
        />

        {/* ETA Overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-card border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-coral" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{getStatusText(order.status)}</p>
                  <p className="font-bold text-foreground">
                    {order.estimated_delivery 
                      ? new Date(order.estimated_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Calculating...'
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline" className="h-9 w-9">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" className="h-9 w-9">
                  <MessageCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 -mt-6 relative z-10">
        {/* Rider Card */}
        {order.rider_id && (
          <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
                R
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Your Rider</p>
                <p className="text-sm text-muted-foreground">On the way</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="icon" 
                  className="h-10 w-10 rounded-full gradient-hero text-primary-foreground"
                  onClick={() => toast.info('Calling rider...')}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery Address</p>
              <p className="font-medium text-foreground mt-0.5">{order.delivery_address}</p>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <OrderTimeline 
          currentStatus={order.status}
          estimatedTime={order.estimated_delivery 
            ? new Date(order.estimated_delivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : undefined
          }
        />

        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Order Summary</h3>
          </div>
          <div className="space-y-2">
            {order.order_items?.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                <span className="text-foreground">{formatCurrency(item.total_price)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>{formatCurrency(order.delivery_fee)}</span>
              </div>
              <div className="flex justify-between mt-2 pt-2 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
