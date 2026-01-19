import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Zap, MapPin, Clock, Bell, User, Navigation, Star,
  Wallet, ChevronRight, Phone, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

const RiderDashboard: React.FC = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [hasNewOrder, setHasNewOrder] = useState(false);

  const toggleOnline = () => {
    setIsOnline(!isOnline);
    toast.success(isOnline ? 'You are now offline' : 'You are now online and receiving orders!');
    if (!isOnline) {
      setTimeout(() => setHasNewOrder(true), 3000);
    }
  };

  const acceptOrder = () => {
    setHasNewOrder(false);
    toast.success('Order accepted! Navigate to pickup location.');
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
          <Button variant="ghost" size="icon" className="text-white">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Online Toggle */}
        <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur">
          <div>
            <p className="font-semibold">{isOnline ? 'You are Online' : 'You are Offline'}</p>
            <p className="text-sm text-white/70">{isOnline ? 'Receiving delivery requests' : 'Go online to start earning'}</p>
          </div>
          <Switch checked={isOnline} onCheckedChange={toggleOnline} className="data-[state=checked]:bg-success" />
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
        {hasNewOrder && (
          <div className="bg-card rounded-2xl border-2 border-primary p-4 shadow-glow animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
                <span className="text-xl">🍔</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">New Delivery Request!</p>
                <p className="text-sm text-primary">GH₵ 18 • 2.3 km</p>
              </div>
              <span className="text-2xl font-bold text-primary">15s</span>
            </div>
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>KFC Osu, Oxford Street</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-rush mt-0.5" />
                <span>East Legon, American House</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setHasNewOrder(false)}>Decline</Button>
              <Button className="flex-1 gradient-hero text-white" onClick={acceptOrder}>Accept</Button>
            </div>
          </div>
        )}

        {/* Recent Deliveries */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Deliveries</h2>
          <div className="space-y-3">
            {[
              { id: 'DEL-001', type: '📦', from: 'Osu', to: 'Cantonments', amount: 15, time: '30 mins ago' },
              { id: 'DEL-002', type: '🍔', from: 'Airport', to: 'Dzorwulu', amount: 22, time: '1 hour ago' },
            ].map((delivery) => (
              <div key={delivery.id} className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <div className="text-2xl">{delivery.type}</div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{delivery.from} → {delivery.to}</p>
                  <p className="text-sm text-muted-foreground">{delivery.time}</p>
                </div>
                <span className="font-bold text-success">+GH₵ {delivery.amount}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-6 py-3">
        <div className="flex items-center justify-around">
          <Link to="/rider/dashboard" className="flex flex-col items-center gap-1 text-primary">
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
