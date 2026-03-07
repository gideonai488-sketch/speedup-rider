import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, MapPin, Clock, Bell, User, Navigation, Star,
  Wallet, ChevronRight, CheckCircle2, X, Timer, AlertCircle, Loader2, Send
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useUpdateRiderLocation } from '@/hooks/useRiderLocation';
import { useRiderPendingOrders, useRiderActiveOrders, useRiderEarnings } from '@/hooks/useAdminData';
import { useCreateBid, useMyBids } from '@/hooks/useBids';
import { supabase } from '@/integrations/supabase/client';

const RiderDashboard: React.FC = () => {
  const location = useLocation();
  const { profile, user, loading: authLoading } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [orderTimer, setOrderTimer] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const updateLocation = useUpdateRiderLocation();
  const { data: pendingOrders = [], refetch: refetchPending } = useRiderPendingOrders();
  const createBid = useCreateBid();
  const { data: myBids = [] } = useMyBids(profile?.id || '');
  const { data: activeOrders = [] } = useRiderActiveOrders(profile?.id || '');
  const { data: earnings } = useRiderEarnings(profile?.id || '');
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  // Check rider approval status
  const riderStatus = (profile as any)?.rider_status || 'pending';
  const isApproved = riderStatus === 'approved';

  // Watch for real-time order updates
  useEffect(() => {
    if (!isApproved) return;
    
    const channel = supabase
      .channel('rider-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        () => {
          refetchPending();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetchPending, isApproved]);

  // Update rider location periodically when online
  useEffect(() => {
    if (!isOnline || !profile || !isApproved) return;

    const updateRiderLocation = () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            updateLocation.mutate({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              is_online: true,
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
          },
          { enableHighAccuracy: true }
        );
      }
    };

    updateRiderLocation();
    const interval = setInterval(updateRiderLocation, 10000);
    return () => clearInterval(interval);
  }, [isOnline, profile, updateLocation, isApproved]);

  // Countdown timer for selected order
  useEffect(() => {
    if (selectedOrder && orderTimer > 0) {
      const interval = setInterval(() => {
        setOrderTimer((prev) => {
          if (prev <= 1) {
            setSelectedOrder(null);
            toast.error('Order expired. Looking for new orders...');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [selectedOrder, orderTimer]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending approval screen for non-approved riders
  if (!isApproved && profile?.role === 'rider') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
        <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mb-6">
          {riderStatus === 'rejected' ? (
            <X className="w-10 h-10 text-destructive" />
          ) : (
            <Clock className="w-10 h-10 text-warning" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {riderStatus === 'rejected' ? 'Application Rejected' : 'Application Pending'}
        </h1>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {riderStatus === 'rejected' 
            ? 'Unfortunately, your rider application has been rejected. Please contact support for more information.'
            : 'Your rider application is under review. We\'ll notify you once you\'re approved to start accepting deliveries.'
          }
        </p>
        {riderStatus === 'pending' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4" />
            <span>This usually takes 24-48 hours</span>
          </div>
        )}
        <Link to="/" className="mt-8 text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    
    if (profile) {
      await updateLocation.mutateAsync({
        latitude: 5.6037, // Default Accra coordinates
        longitude: -0.1870,
        is_online: newStatus,
      });
    }
    
    toast.success(newStatus ? 'You are now online and receiving orders!' : 'You are now offline');
    if (!newStatus) {
      setSelectedOrder(null);
    }
  };

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderTimer(60); // Give more time for bidding
    // Suggest a bid based on delivery fee
    const suggestedBid = Math.max(5, (Number(order.delivery_fee) || 10) - 3);
    setBidAmount(suggestedBid.toString());
    setBidMessage('');
  };

  const handlePlaceBid = async () => {
    if (!selectedOrder || !profile) return;
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }
    
    try {
      await createBid.mutateAsync({
        orderId: selectedOrder.id,
        riderId: profile.id,
        amount,
        message: bidMessage.trim() || undefined,
      });
      toast.success('Bid placed! Waiting for customer to accept.');
      setSelectedOrder(null);
      setBidAmount('');
      setBidMessage('');
      refetchPending();
    } catch (error: any) {
      if (error?.message?.includes('duplicate')) {
        toast.error('You already placed a bid on this order');
      } else {
        toast.error('Failed to place bid. Try again.');
      }
      setSelectedOrder(null);
      refetchPending();
    }
  };

  const handleDeclineOrder = () => {
    setSelectedOrder(null);
    toast.info('Order declined. Looking for new orders...');
  };

  const formatCurrency = (value: number) => `GH₵ ${value?.toLocaleString() || 0}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-dark text-white px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">
              {profile?.full_name?.charAt(0) || 'R'}
            </div>
            <div>
              <p className="font-semibold">{profile?.full_name || 'Rider'}</p>
              <div className="flex items-center gap-1 text-sm text-white/70">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                4.9 • {activeOrders.length} active
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white relative">
            <Bell className="w-5 h-5" />
            {pendingOrders.length > 0 && isOnline && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center">
                {pendingOrders.length}
              </span>
            )}
          </Button>
        </div>

        {/* Online Toggle */}
        <div className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur transition-colors ${
          isOnline ? 'bg-success/20 border border-success/30' : 'bg-white/10'
        }`}>
          <div>
            <p className="font-semibold">{isOnline ? 'You are Online' : 'You are Offline'}</p>
            <p className="text-sm text-white/70">
              {isOnline ? `${pendingOrders.length} orders available` : 'Go online to start earning'}
            </p>
          </div>
          <Switch 
            checked={isOnline} 
            onCheckedChange={toggleOnline} 
            className="data-[state=checked]:bg-success scale-125" 
          />
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Wallet className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-bold text-foreground">{formatCurrency(earnings?.todayEarnings || 0)}</p>
            <p className="text-xs text-muted-foreground">Today's Earnings</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Navigation className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-bold text-foreground">{earnings?.todayDeliveries || 0}</p>
            <p className="text-xs text-muted-foreground">Deliveries</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <Clock className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="font-bold text-foreground">{activeOrders.length}</p>
            <p className="text-xs text-muted-foreground">Active Orders</p>
          </div>
        </div>

        {/* Selected Order Alert */}
        {selectedOrder && (
          <div className="bg-card rounded-2xl border-2 border-primary shadow-glow overflow-hidden animate-slide-up">
            <div className="h-1 bg-border">
              <div 
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${(orderTimer / 30) * 100}%` }}
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center">
                    {selectedOrder.stores?.logo_url ? (
                      <img 
                        src={selectedOrder.stores.logo_url} 
                        alt="" 
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">New Delivery Request!</p>
                    <p className="text-sm text-primary font-medium">
                      Earn {formatCurrency(Number(selectedOrder.delivery_fee) || 15)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="text-xl font-bold text-primary">{orderTimer}s</span>
                </div>
              </div>
              
              {/* Pickup & Dropoff Details as Text */}
              <div className="space-y-3 mb-4 text-sm bg-secondary/50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium">PICKUP LOCATION</p>
                    <p className="font-semibold text-foreground">{selectedOrder.stores?.name || 'Pickup Point'}</p>
                    <p className="text-muted-foreground">{selectedOrder.pickup_address || selectedOrder.stores?.address || 'Address not specified'}</p>
                  </div>
                </div>
                
                <div className="border-l-2 border-dashed border-border ml-1.5 h-6" />
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground font-medium">DROPOFF LOCATION</p>
                    <p className="font-semibold text-foreground">{selectedOrder.delivery_address}</p>
                    {selectedOrder.profiles?.full_name && (
                      <p className="text-muted-foreground">Customer: {selectedOrder.profiles.full_name}</p>
                    )}
                    {selectedOrder.profiles?.phone && (
                      <p className="text-muted-foreground text-xs">{selectedOrder.profiles.phone}</p>
                    )}
                  </div>
                </div>
                
                {/* Distance & Estimated Earning */}
                {selectedOrder.distance_km && (
                  <div className="pt-2 border-t border-border mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-medium text-foreground">{Number(selectedOrder.distance_km).toFixed(1)} km</span>
                  </div>
                )}
              </div>
              
              {/* Bid Form */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Your Bid (GH₵)</label>
                  <Input
                    type="number"
                    placeholder="Enter your price"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="text-lg font-bold"
                    min="1"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Message (optional)</label>
                  <Textarea
                    placeholder="e.g. I'm nearby and can pick up in 5 mins"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12" 
                  onClick={handleDeclineOrder}
                >
                  <X className="w-4 h-4 mr-2" />
                  Skip
                </Button>
                <Button 
                  className="flex-1 h-12 gradient-hero text-white" 
                  onClick={handlePlaceBid}
                  disabled={createBid.isPending || !bidAmount}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {createBid.isPending ? 'Placing...' : 'Place Bid'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">Active Deliveries</h2>
            <div className="space-y-3">
              {activeOrders.map((order: any) => (
                <Link 
                  key={order.id}
                  to={`/rider/delivery/${order.id}`}
                  className="block bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      📦
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{order.order_number}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {order.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  
                  {/* Pickup/Dropoff details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{order.pickup_address || order.stores?.address || 'Pickup'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-success mt-1 flex-shrink-0" />
                      <span className="text-foreground truncate">{order.delivery_address}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Available Orders Section */}
        {isOnline && !selectedOrder && pendingOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Available Orders</h2>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {pendingOrders.length} available
              </div>
            </div>
            
            <div className="space-y-3">
              {pendingOrders.map((order: any) => (
                <button 
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        {order.stores?.logo_url ? (
                          <img src={order.stores.logo_url} alt="" className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{order.stores?.name || 'Delivery Request'}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.order_items?.length || 1} item{(order.order_items?.length || 1) > 1 ? 's' : ''}
                          {order.distance_km && ` • ${Number(order.distance_km).toFixed(1)} km`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">{formatCurrency((Number(order.delivery_fee) || 10) - 5)}</p>
                      <p className="text-xs text-muted-foreground">Your earning</p>
                    </div>
                  </div>
                  
                  {/* Pickup/Dropoff as text details */}
                  <div className="space-y-2 text-xs bg-secondary/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">Pickup: </span>
                        <span className="text-foreground font-medium truncate block">{order.pickup_address || order.stores?.address || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-success mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-muted-foreground">Dropoff: </span>
                        <span className="text-foreground font-medium truncate block">{order.delivery_address}</span>
                      </div>
                    </div>
                    {order.profiles?.full_name && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Customer: {order.profiles.full_name}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Offline State */}
        {!isOnline && (
          <section className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Navigation className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">You're offline</h3>
            <p className="text-muted-foreground mb-4">Go online to start receiving delivery requests and earn money</p>
            <Button onClick={toggleOnline} className="gradient-hero text-white shadow-glow">
              <Zap className="w-4 h-4 mr-2" />
              Go Online
            </Button>
          </section>
        )}

        {/* No Orders Available */}
        {isOnline && !selectedOrder && pendingOrders.length === 0 && activeOrders.length === 0 && (
          <section className="text-center py-8">
            <div className="w-20 h-20 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No orders available</h3>
            <p className="text-muted-foreground">We'll notify you when new orders come in</p>
          </section>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-6 py-3 safe-area-pb">
        <div className="flex items-center justify-around">
          <Link to="/rider" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Zap className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/rider/earnings" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider/earnings' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Earnings</span>
          </Link>
          <Link to="/rider/deliveries" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider/deliveries' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Clock className="w-5 h-5" />
            <span className="text-xs">History</span>
          </Link>
          <Link to="/rider/profile" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider/profile' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default RiderDashboard;
