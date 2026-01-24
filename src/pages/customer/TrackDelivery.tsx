import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Phone, MessageSquare, MapPin,
  Clock, Star, Shield, Loader2
} from 'lucide-react';
import LiveMap from '@/components/tracking/LiveMap';
import { useOrder } from '@/hooks/useOrders';
import { useRiderLocation } from '@/hooks/useRiderLocation';
import { Skeleton } from '@/components/ui/skeleton';

type DeliveryStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'picked_up' | 'out_for_delivery' | 'delivered' | 'cancelled';

const TrackDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { data: order, isLoading: orderLoading } = useOrder(orderId || '');
  const { data: riderLocation } = useRiderLocation(order?.rider_id || '');
  const [showDetails, setShowDetails] = useState(false);
  const [eta, setEta] = useState(15);

  // Update ETA based on status
  useEffect(() => {
    if (order?.status) {
      const etaMap: Record<string, number> = {
        pending: 30,
        confirmed: 25,
        ready_for_pickup: 20,
        picked_up: 15,
        out_for_delivery: 10,
        delivered: 0,
      };
      setEta(etaMap[order.status] || 15);
    }
  }, [order?.status]);

  const statusInfo: Record<DeliveryStatus, { text: string; color: string; icon: string }> = {
    pending: { text: 'Order placed, waiting for confirmation', color: 'text-warning', icon: '📋' },
    confirmed: { text: 'Order confirmed!', color: 'text-primary', icon: '✅' },
    ready_for_pickup: { text: 'Ready for pickup', color: 'text-accent', icon: '📦' },
    picked_up: { text: 'Package picked up!', color: 'text-primary', icon: '🏍️' },
    out_for_delivery: { text: 'On the way to you', color: 'text-success', icon: '🚀' },
    delivered: { text: 'Order delivered!', color: 'text-success', icon: '🎉' },
    cancelled: { text: 'Order cancelled', color: 'text-destructive', icon: '❌' },
  };

  const currentStatus = (order?.status as DeliveryStatus) || 'pending';
  const statusDetails = statusInfo[currentStatus] || statusInfo.pending;

  // Parse coordinates
  const pickupLocation = {
    lat: Number(order?.pickup_lat) || 5.6037,
    lng: Number(order?.pickup_lng) || -0.1870,
  };
  
  const dropoffLocation = {
    lat: Number(order?.delivery_lat) || 5.6145,
    lng: Number(order?.delivery_lng) || -0.2050,
  };

  const rider = order?.rider as { full_name?: string; phone?: string } | undefined;

  if (orderLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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

  return (
    <div className="min-h-screen bg-background relative">
      {/* Map Area */}
      <div className="h-[55vh] relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/orders')}
            className="w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-background rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {order.order_number || `Order #${orderId?.slice(0, 8)}`}
            </span>
            <div className={`w-2 h-2 rounded-full ${currentStatus === 'delivered' ? 'bg-success' : 'bg-primary animate-pulse'}`} />
          </div>
        </div>

        {/* Live Map Component */}
        <LiveMap
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          status={currentStatus}
          riderLocation={riderLocation ? { lat: Number(riderLocation.latitude), lng: Number(riderLocation.longitude) } : undefined}
        />
      </div>

      {/* Bottom Sheet */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-lg transition-all duration-300 ${
          showDetails ? 'h-[70vh]' : 'h-auto'
        }`}
      >
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex justify-center py-3"
        >
          <div className="w-12 h-1 bg-border rounded-full" />
        </button>

        <div className="px-6 pb-8">
          {/* Status Banner */}
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl mb-6">
            <div className="text-3xl">{statusDetails.icon}</div>
            <div className="flex-1">
              <p className={`font-semibold ${statusDetails.color}`}>
                {statusDetails.text}
              </p>
              {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
                <p className="text-sm text-muted-foreground">
                  Estimated arrival: {eta} mins
                </p>
              )}
            </div>
            {currentStatus !== 'pending' && currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{eta}</p>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              {(['confirmed', 'picked_up', 'out_for_delivery', 'delivered'] as const).map((step) => {
                const statusOrder = ['pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'out_for_delivery', 'delivered'];
                const currentIndex = statusOrder.indexOf(currentStatus);
                const stepIndex = statusOrder.indexOf(step);
                const isCompleted = currentIndex > stepIndex;
                const isCurrent = currentStatus === step || (step === 'confirmed' && (currentStatus === 'confirmed' || currentStatus === 'ready_for_pickup'));
                
                return (
                  <div key={step} className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted || isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {step === 'confirmed' && '✓'}
                      {step === 'picked_up' && '📦'}
                      {step === 'out_for_delivery' && '🚀'}
                      {step === 'delivered' && '🎉'}
                    </div>
                    <p className={`text-xs mt-2 ${isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step === 'confirmed' && 'Confirmed'}
                      {step === 'picked_up' && 'Picked up'}
                      {step === 'out_for_delivery' && 'Delivering'}
                      {step === 'delivered' && 'Delivered'}
                    </p>
                  </div>
                );
              })}
              
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-secondary -z-0">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ 
                    width: currentStatus === 'delivered' ? '100%' 
                      : currentStatus === 'out_for_delivery' ? '75%'
                      : currentStatus === 'picked_up' ? '50%'
                      : currentStatus === 'ready_for_pickup' || currentStatus === 'confirmed' ? '25%'
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rider Info */}
          {rider && (
            <div className="bg-card rounded-2xl border border-border p-4 mb-6 animate-fade-in">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-white font-bold text-xl">
                  {rider.full_name?.charAt(0) || 'R'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{rider.full_name || 'Rider'}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    <span>4.9</span>
                    {riderLocation?.vehicle_plate && (
                      <>
                        <span>•</span>
                        <span>{riderLocation.vehicle_plate}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full">
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                  {rider.phone && (
                    <a href={`tel:${rider.phone}`}>
                      <Button size="icon" className="rounded-full gradient-hero text-white">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Order Details */}
          {showDetails && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-foreground">Delivery Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">PICKUP</p>
                    <p className="text-sm font-medium">{order.pickup_address || 'Store location'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">DROPOFF</p>
                    <p className="text-sm font-medium">{order.delivery_address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">{order.order_number || `Order #${orderId?.slice(0, 8)}`}</span>
                </div>
                <span className="font-bold text-primary">GH₵ {Number(order.total).toFixed(2)}</span>
              </div>

              {/* Order Items */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Items</h4>
                  {order.order_items.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} x{item.quantity}</span>
                      <span className="font-medium">GH₵ {Number(item.total_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDelivery;
