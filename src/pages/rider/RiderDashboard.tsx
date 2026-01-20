import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, MapPin, Clock, Bell, User, Navigation, Star,
  Wallet, ChevronRight, Phone, CheckCircle2, X, Timer
} from 'lucide-react';
import { toast } from 'sonner';
import { availableOrders } from '@/data/deliveryData';

interface OrderRequest {
  id: string;
  type: string;
  icon: string;
  storeName: string;
  pickupAddress: string;
  dropoffAddress: string;
  distance: number;
  estimatedEarning: number;
  estimatedTime: string;
  expiresIn: number;
}

const RiderDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<OrderRequest | null>(null);
  const [orderTimer, setOrderTimer] = useState(0);
  const [orders, setOrders] = useState<OrderRequest[]>([]);

  // Simulate receiving orders when online
  useEffect(() => {
    if (isOnline && !currentOrder) {
      const timer = setTimeout(() => {
        const randomOrder = availableOrders[Math.floor(Math.random() * availableOrders.length)];
        setCurrentOrder({ ...randomOrder, expiresIn: 30 });
        setOrderTimer(30);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, currentOrder]);

  // Countdown timer for order
  useEffect(() => {
    if (currentOrder && orderTimer > 0) {
      const interval = setInterval(() => {
        setOrderTimer((prev) => {
          if (prev <= 1) {
            setCurrentOrder(null);
            toast.error('Order expired. Looking for new orders...');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentOrder, orderTimer]);

  const toggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    toast.success(newStatus ? 'You are now online and receiving orders!' : 'You are now offline');
    if (!newStatus) {
      setCurrentOrder(null);
      setOrders([]);
    }
  };

  const acceptOrder = () => {
    if (currentOrder) {
      toast.success(`Order accepted! Navigate to ${currentOrder.storeName}`);
      setOrders([currentOrder, ...orders.slice(0, 4)]);
      setCurrentOrder(null);
    }
  };

  const declineOrder = () => {
    setCurrentOrder(null);
    toast.info('Order declined. Looking for new orders...');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-dark text-white px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl">K</div>
            <div>
              <p className="font-semibold">Kwame Asante</p>
              <div className="flex items-center gap-1 text-sm text-white/70">
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                4.9 • 1,250 deliveries
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-white relative">
            <Bell className="w-5 h-5" />
            {isOnline && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
            )}
          </Button>
        </div>

        {/* Online Toggle */}
        <div className={`flex items-center justify-between p-4 rounded-2xl backdrop-blur transition-colors ${
          isOnline ? 'bg-success/20 border border-success/30' : 'bg-white/10'
        }`}>
          <div>
            <p className="font-semibold">{isOnline ? 'You are Online' : 'You are Offline'}</p>
            <p className="text-sm text-white/70">{isOnline ? 'Receiving delivery requests' : 'Go online to start earning'}</p>
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
          {[
            { label: "Today's Earnings", value: 'GH₵ 245', icon: Wallet },
            { label: 'Deliveries', value: '12', icon: Navigation },
            { label: 'Hours Online', value: '6.5h', icon: Clock },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4 text-center">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* New Order Alert */}
        {currentOrder && (
          <div className="bg-card rounded-2xl border-2 border-primary shadow-glow overflow-hidden animate-slide-up">
            {/* Timer bar */}
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
                    <span className="text-2xl">{currentOrder.icon}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">New Delivery Request!</p>
                    <p className="text-sm text-primary font-medium">
                      GH₵ {currentOrder.estimatedEarning} • {currentOrder.distance} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
                  <Timer className="w-4 h-4 text-primary" />
                  <span className="text-xl font-bold text-primary">{orderTimer}s</span>
                </div>
              </div>
              
              <div className="space-y-2.5 mb-4 text-sm bg-secondary/50 rounded-xl p-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">PICKUP</p>
                    <p className="font-medium text-foreground">{currentOrder.storeName}</p>
                    <p className="text-muted-foreground text-xs">{currentOrder.pickupAddress}</p>
                  </div>
                </div>
                <div className="border-l-2 border-dashed border-border ml-1 h-4" />
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-rush mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">DROPOFF</p>
                    <p className="font-medium text-foreground">{currentOrder.dropoffAddress}</p>
                    <p className="text-xs text-muted-foreground">{currentOrder.estimatedTime} estimated</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12" 
                  onClick={declineOrder}
                >
                  <X className="w-4 h-4 mr-2" />
                  Decline
                </Button>
                <Button 
                  className="flex-1 h-12 gradient-hero text-white" 
                  onClick={acceptOrder}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Accept
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Available Orders Section - shown when online but no active order */}
        {isOnline && !currentOrder && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Available Orders</h2>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Looking for orders...
              </div>
            </div>
            
            <div className="space-y-3">
              {availableOrders.map((order) => (
                <div 
                  key={order.id}
                  className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-2xl">{order.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{order.storeName}</p>
                      <p className="text-sm text-muted-foreground">{order.distance} km • {order.estimatedTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-success">GH₵ {order.estimatedEarning}</p>
                      <p className="text-xs text-muted-foreground">Est. earning</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{order.pickupAddress}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                    <span>{order.dropoffAddress}</span>
                  </div>
                </div>
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

        {/* Recent Deliveries */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Deliveries</h2>
          <div className="space-y-3">
            {(orders.length > 0 ? orders : [
              { id: 'DEL-001', icon: '📦', storeName: 'Osu', dropoffAddress: 'Cantonments', estimatedEarning: 15, estimatedTime: '30 mins ago' },
              { id: 'DEL-002', icon: '🍔', storeName: 'Airport', dropoffAddress: 'Dzorwulu', estimatedEarning: 22, estimatedTime: '1 hour ago' },
            ]).map((delivery) => (
              <div key={delivery.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="text-2xl">{delivery.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{delivery.storeName} → {delivery.dropoffAddress}</p>
                  <p className="text-sm text-muted-foreground">{delivery.estimatedTime}</p>
                </div>
                <span className="font-bold text-success">+GH₵ {delivery.estimatedEarning}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-6 py-3">
        <div className="flex items-center justify-around">
          <Link to="/rider" className="flex flex-col items-center gap-1 text-primary">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/rider/earnings" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Earnings</span>
          </Link>
          <Link to="/rider/deliveries" className="flex flex-col items-center gap-1 text-muted-foreground">
            <Clock className="w-5 h-5" />
            <span className="text-xs">History</span>
          </Link>
          <Link to="/rider/profile" className="flex flex-col items-center gap-1 text-muted-foreground">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default RiderDashboard;