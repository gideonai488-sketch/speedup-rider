import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Zap, MapPin, Clock, Bell, User, Navigation, Star,
  Wallet, ChevronRight, CheckCircle2, X, Timer, AlertCircle, 
  Loader2, Send, Phone, TrendingUp, Package, Bike, Calendar, LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useUpdateRiderLocation } from '@/hooks/useRiderLocation';
import { useRiderPendingOrders, useRiderActiveOrders, useRiderEarnings } from '@/hooks/useAdminData';
import { useCreateBid, useMyBids } from '@/hooks/useBids';
import { useRiderWallet } from '@/hooks/useWallet';
import { supabase } from '@/integrations/supabase/client';
import BottomNav from '@/components/layout/BottomNav';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const RiderDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, loading: authLoading, signOut } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [orderTimer, setOrderTimer] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const updateLocation = useUpdateRiderLocation();
  const { data: pendingOrders = [], refetch: refetchPending } = useRiderPendingOrders(profile?.city);
  const createBid = useCreateBid();
  const { data: myBids = [] } = useMyBids(profile?.id || '');
  const { data: activeOrders = [] } = useRiderActiveOrders(profile?.id || '');
  const { data: earnings } = useRiderEarnings(profile?.id || '');
  const { data: walletData } = useRiderWallet();
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');

  // All riders are auto-approved — no pending gate
  const isApproved = true;

  // Weekly earnings chart data
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: endOfWeek(new Date(), { weekStartsOn: 0 }),
  });

  const dailyEarnings = weekDays.map(day => {
    const dayEarnings = walletData?.transactions
      ?.filter(tx => isSameDay(new Date(tx.created_at), day))
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;
    return {
      day: format(day, 'EEE'),
      earnings: dayEarnings,
      isToday: isSameDay(day, new Date()),
    };
  });

  const maxDailyEarning = Math.max(...dailyEarnings.map(d => d.earnings), 50);

  // Watch for real-time order updates
  useEffect(() => {
    if (!isApproved) return;
    const channel = supabase
      .channel('rider-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        refetchPending();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetchPending, isApproved]);

  // Real-time toast when a bid is accepted
  useEffect(() => {
    if (!profile?.id) return;
    const channel = supabase
      .channel(`bid-accepted-${profile.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bids',
        filter: `rider_id=eq.${profile.id}`,
      }, (payload) => {
        const newBid = payload.new as any;
        if (newBid.status === 'accepted') {
          toast.success('🎉 Your bid has been accepted!', {
            description: `GH₵ ${Number(newBid.amount).toFixed(2)} — Head to pickup now!`,
            duration: 10000,
            action: {
              label: 'Start Delivery',
              onClick: () => navigate(`/rider/delivery/${newBid.order_id}`),
            },
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile?.id, navigate]);

  // Restore rider online status when dashboard mounts
  useEffect(() => {
    if (!profile?.id) return;

    let isMounted = true;

    const loadOnlineStatus = async () => {
      const { data, error } = await supabase
        .from('rider_locations')
        .select('is_online')
        .eq('rider_id', profile.id)
        .maybeSingle();

      if (!error && isMounted && data?.is_online !== null && data?.is_online !== undefined) {
        setIsOnline(Boolean(data.is_online));
      }
    };

    loadOnlineStatus();

    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

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
          (error) => console.error('Geolocation error:', error),
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No approval gate — riders can access dashboard immediately

  const toggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    if (profile) {
      await updateLocation.mutateAsync({
        latitude: 5.6037,
        longitude: -0.1870,
        is_online: newStatus,
      });
    }
    toast.success(newStatus ? 'You are now online and receiving orders!' : 'You are now offline');
    if (!newStatus) setSelectedOrder(null);
  };

  const handleSelectOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderTimer(60);
    setBidAmount('');
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

  const handleLogout = async () => {
    if (isOnline && profile) {
      await updateLocation.mutateAsync({
        latitude: 5.6037,
        longitude: -0.1870,
        is_online: false,
      });
    }
    await signOut();
    navigate('/');
  };

  const formatCurrency = (value: number) => `GH₵ ${value?.toLocaleString() || 0}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Premium Header */}
      <header className="relative overflow-hidden">
        <div className="gradient-hero px-5 pt-6 pb-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-xl text-white border-2 border-white/30 overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  profile?.full_name?.charAt(0) || 'R'
                )}
              </div>
              <div>
                <p className="font-bold text-white text-lg">{profile?.full_name || 'Rider'}</p>
                <div className="flex items-center gap-1.5 text-sm text-white/80">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  <span>4.9</span>
                  <span className="text-white/50">•</span>
                  <span>{activeOrders.length} active</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white relative bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20"
                onClick={() => navigate('/rider/earnings')}
              >
                <Bell className="w-5 h-5" />
                {pendingOrders.length > 0 && isOnline && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {pendingOrders.length}
                  </span>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white bg-white/10 backdrop-blur-sm rounded-xl hover:bg-destructive/80"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Online Toggle - Glassmorphism */}
          <div className={cn(
            'flex items-center justify-between p-4 rounded-2xl backdrop-blur-md transition-all duration-500 border',
            isOnline 
              ? 'bg-white/20 border-white/30 shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
              : 'bg-black/20 border-white/10'
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                isOnline ? 'bg-success/30' : 'bg-white/10'
              )}>
                {isOnline ? (
                  <Zap className="w-5 h-5 text-success" />
                ) : (
                  <Zap className="w-5 h-5 text-white/60" />
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{isOnline ? 'You are Online' : 'You are Offline'}</p>
                <p className="text-sm text-white/60">
                  {isOnline ? `${pendingOrders.length} orders available` : 'Go online to start earning'}
                </p>
              </div>
            </div>
            <Switch 
              checked={isOnline} 
              onCheckedChange={toggleOnline} 
              className="data-[state=checked]:bg-success scale-125" 
            />
          </div>
        </div>

        {/* Decorative blur circles */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </header>

      <main className="px-4 py-5 space-y-5 -mt-2">
        {/* Stats Cards - Glass style */}
        <div className="grid grid-cols-4 gap-3">
          <Link to="/rider/earnings" className="bg-card rounded-2xl border border-border p-4 text-center hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5 text-success" />
            </div>
            <p className="font-bold text-foreground text-sm">{formatCurrency(earnings?.todayEarnings || 0)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Today</p>
          </Link>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Navigation className="w-5 h-5 text-primary" />
            </div>
            <p className="font-bold text-foreground text-sm">{earnings?.todayDeliveries || 0}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Deliveries</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center mx-auto mb-2">
              <Package className="w-5 h-5 text-warning" />
            </div>
            <p className="font-bold text-foreground text-sm">{activeOrders.length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Active</p>
          </div>
          <Link to="/rider/bids" className="bg-card rounded-2xl border border-border p-4 text-center hover:border-primary/30 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5 text-accent-foreground" />
            </div>
            <p className="font-bold text-foreground text-sm">{myBids?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">My Bids</p>
          </Link>
        </div>

        {/* Mini Earnings Chart */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground text-sm">This Week</h3>
            </div>
            <Link to="/rider/earnings" className="text-xs text-primary flex items-center gap-0.5">
              Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex items-end justify-between gap-1.5 h-20">
            {dailyEarnings.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className={cn(
                    'w-full rounded-lg transition-all duration-500',
                    day.isToday 
                      ? 'bg-gradient-to-t from-primary to-primary/70 shadow-[0_0_10px_rgba(var(--primary),0.3)]' 
                      : day.earnings > 0 
                        ? 'bg-primary/30' 
                        : 'bg-muted'
                  )}
                  style={{ 
                    height: `${Math.max((day.earnings / maxDailyEarning) * 60, 4)}px`,
                    minHeight: '4px'
                  }}
                />
                <span className={cn(
                  'text-[9px]',
                  day.isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                )}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Order Alert - Premium Card */}
        {selectedOrder && (
          <div className="bg-card rounded-2xl border-2 border-primary shadow-[0_0_30px_rgba(var(--primary),0.15)] overflow-hidden animate-slide-up">
            {/* Progress bar */}
            <div className="h-1.5 bg-muted">
              <div 
                className="h-full gradient-hero transition-all duration-1000 rounded-full"
                style={{ width: `${(orderTimer / 60) * 100}%` }}
              />
            </div>
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center shadow-lg">
                    {selectedOrder.stores?.logo_url ? (
                      <img src={selectedOrder.stores.logo_url} alt="" className="w-10 h-10 object-contain rounded-lg" />
                    ) : (
                      <Package className="w-7 h-7 text-white" />
                    )}
                  </div>
                    <div>
                    <p className="font-bold text-foreground">New Delivery Request!</p>
                    <p className="text-sm text-muted-foreground">Place your bid to earn</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-2 rounded-xl">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="text-xl font-bold text-primary tabular-nums">{orderTimer}s</span>
                </div>
              </div>
              
              {/* Route Details */}
              <div className="space-y-3 mb-4 bg-secondary/50 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0 ring-4 ring-primary/20" />
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Pickup</p>
                    <p className="font-semibold text-foreground">{selectedOrder.stores?.name || 'Pickup Point'}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.pickup_address || selectedOrder.stores?.address || 'Address not specified'}</p>
                  </div>
                </div>
                
                <div className="border-l-2 border-dashed border-border ml-1.5 h-4" />
                
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0 ring-4 ring-success/20" />
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Dropoff</p>
                    <p className="font-semibold text-foreground">{selectedOrder.delivery_address}</p>
                    {selectedOrder.profiles?.full_name && (
                      <p className="text-sm text-muted-foreground">Customer: {selectedOrder.profiles.full_name}</p>
                    )}
                    {selectedOrder.profiles?.phone && (
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        <a href={`tel:${selectedOrder.profiles.phone}`} className="text-primary text-xs font-medium hover:underline">
                          {selectedOrder.profiles.phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedOrder.distance_km && (
                  <div className="pt-2 border-t border-border mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-bold text-foreground">{Number(selectedOrder.distance_km).toFixed(1)} km</span>
                  </div>
                )}
              </div>
              
              {/* Bid Form */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Your Bid (GH₵)</label>
                  <Input
                    type="number"
                    placeholder="Enter your price"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="text-lg font-bold h-12 rounded-xl"
                    min="1"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-foreground mb-1.5 block">Message (optional)</label>
                  <Textarea
                    placeholder="e.g. I'm nearby and can pick up in 5 mins"
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    rows={2}
                    className="rounded-xl"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 rounded-xl" 
                  onClick={handleDeclineOrder}
                >
                  <X className="w-4 h-4 mr-2" />
                  Skip
                </Button>
                <Button 
                  className="flex-1 h-12 gradient-hero text-white rounded-xl shadow-lg" 
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

        {/* Active Orders - Enhanced Cards */}
        {activeOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">Active Deliveries</h2>
              <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full">
                {activeOrders.length} active
              </span>
            </div>
            <div className="space-y-3">
              {activeOrders.map((order: any) => (
                <Link 
                  key={order.id}
                  to={`/rider/delivery/${order.id}`}
                  className="block bg-card rounded-2xl border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {order.stores?.name ? (
                        <span className="text-lg">🏪</span>
                      ) : (
                        <Package className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{order.order_number}</p>
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                          order.status === 'confirmed' && "bg-primary/10 text-primary",
                          order.status === 'picked_up' && "bg-warning/10 text-warning",
                          order.status === 'out_for_delivery' && "bg-success/10 text-success",
                        )}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{order.pickup_address || order.stores?.address || 'Pickup'}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-success mt-1 flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">{order.delivery_address}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Available Orders Section - Enhanced */}
        {isOnline && !selectedOrder && pendingOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-foreground">Available Orders</h2>
              <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                {pendingOrders.length} available
              </div>
            </div>
            
            <div className="space-y-3">
              {pendingOrders.map((order: any) => (
                <button 
                  key={order.id}
                  onClick={() => handleSelectOrder(order)}
                  className="w-full text-left bg-card rounded-2xl border border-border p-4 hover:border-primary/50 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center overflow-hidden">
                        {order.stores?.logo_url ? (
                          <img src={order.stores.logo_url} alt="" className="w-9 h-9 object-contain" />
                        ) : (
                          <Package className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{order.stores?.name || 'Delivery Request'}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.order_items?.length || 1} item{(order.order_items?.length || 1) > 1 ? 's' : ''}
                          {order.distance_km && ` • ${Number(order.distance_km).toFixed(1)} km`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">Bid Now</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs bg-secondary/40 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-foreground font-medium truncate block">{order.pickup_address || order.stores?.address || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-success mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="text-foreground font-medium truncate block">{order.delivery_address}</span>
                      </div>
                    </div>
                    {order.profiles?.full_name && (
                      <div className="flex items-center gap-2 pt-1.5 border-t border-border">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.profiles.full_name}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Offline State - Premium */}
        {!isOnline && (
          <section className="text-center py-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-muted mx-auto mb-5 flex items-center justify-center">
              <Navigation className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">You're offline</h3>
            <p className="text-muted-foreground mb-6 max-w-xs mx-auto">Go online to start receiving delivery requests and earn money</p>
            <Button onClick={toggleOnline} className="gradient-hero text-white shadow-lg px-8 h-12 rounded-xl text-base">
              <Zap className="w-5 h-5 mr-2" />
              Go Online
            </Button>
          </section>
        )}

        {/* No Orders Available */}
        {isOnline && !selectedOrder && pendingOrders.length === 0 && activeOrders.length === 0 && (
          <section className="text-center py-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-muted mx-auto mb-5 flex items-center justify-center">
              <Clock className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No orders available</h3>
            <p className="text-muted-foreground">We'll notify you when new orders come in</p>
          </section>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default RiderDashboard;
