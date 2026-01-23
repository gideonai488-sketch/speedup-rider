import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import StoreLogo from '@/components/ui/store-logo';
import { 
  Zap, MapPin, Clock, Search, Bell, User,
  ChevronRight, Star, Navigation, UtensilsCrossed,
  ShoppingCart, Pill, ClipboardList, Package, FileText, ExternalLink
} from 'lucide-react';
import { serviceCategories, popularStores } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';

const serviceIcons: Record<string, React.ReactNode> = {
  food: <UtensilsCrossed className="w-6 h-6" />,
  groceries: <ShoppingCart className="w-6 h-6" />,
  pharmacy: <Pill className="w-6 h-6" />,
  errands: <ClipboardList className="w-6 h-6" />,
  packages: <Package className="w-6 h-6" />,
  documents: <FileText className="w-6 h-6" />,
};

const serviceColors: Record<string, string> = {
  food: 'bg-orange-500/10 text-orange-500',
  groceries: 'bg-green-500/10 text-green-500',
  pharmacy: 'bg-red-500/10 text-red-500',
  errands: 'bg-purple-500/10 text-purple-500',
  packages: 'bg-blue-500/10 text-blue-500',
  documents: 'bg-cyan-500/10 text-cyan-500',
};

const CustomerHome: React.FC = () => {
  const location = useLocation();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with SpeedRush branding */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* SpeedRush Owl Logo */}
              <div className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center shadow-lg relative overflow-hidden">
                <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
                  <ellipse cx="20" cy="23" rx="12" ry="14" fill="white" fillOpacity="0.95" />
                  <circle cx="20" cy="14" r="10" fill="white" />
                  <path d="M11 7 L14 14 L8 12 Z" fill="white" />
                  <path d="M29 7 L26 14 L32 12 Z" fill="white" />
                  <circle cx="16" cy="14" r="4" fill="#1e293b" />
                  <circle cx="24" cy="14" r="4" fill="#1e293b" />
                  <circle cx="17" cy="13" r="2" fill="white" />
                  <circle cx="25" cy="13" r="2" fill="white" />
                  <path d="M18 18 L20 22 L22 18 Z" fill="#f59e0b" />
                </svg>
                {/* Speed indicator */}
                <div className="absolute -right-0.5 top-1/2 -translate-y-1/2 flex gap-0.5">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="w-0.5 bg-white/60 rounded-full" style={{ height: `${4 + i * 3}px` }} />
                  ))}
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Speed<span className="text-primary">Rush</span>
                </h1>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <MapPin className="w-3 h-3 text-primary" />
                  Osu, Accra
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/customer/wallet">
                <Button variant="ghost" size="sm" className="text-primary font-semibold">
                  GH₵ 245
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </Button>
              <Link to="/profile">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search for services, restaurants, stores..."
              className="pl-10 bg-secondary/50 rounded-xl"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-8">
        {/* Quick Action Banner */}
        <div className="gradient-hero rounded-2xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <h2 className="text-xl font-bold mb-1">Need something delivered?</h2>
            <p className="text-white/80 text-sm mb-4">Our riders are ready to rush to you</p>
            <Link to="/customer/book">
              <Button className="bg-white text-primary hover:bg-white/90 shadow-lg">
                <Navigation className="w-4 h-4 mr-2" />
                Request Pickup
              </Button>
            </Link>
          </div>
        </div>

        {/* Services Grid with Icons */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Our Services</h2>
            <button className="text-sm text-primary font-medium">See all</button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {serviceCategories.map((service) => (
              <Link
                key={service.id}
                to={`/customer/book?service=${service.id}`}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                  selectedService === service.id
                    ? 'border-primary bg-primary/5 shadow-glow'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
                onClick={() => setSelectedService(service.id)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${serviceColors[service.id]}`}>
                  {serviceIcons[service.id]}
                </div>
                <span className="text-xs font-medium text-foreground text-center">{service.name}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">From GH₵{service.basePrice}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Stores - Netflix Style */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Featured Stores</h2>
            <button className="text-sm text-primary font-medium">See all</button>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {popularStores.filter(s => s.featured).map((store) => (
              <Link
                  key={store.id}
                  to={`/customer/store/${store.id}`}
                  className="group flex-shrink-0 w-40"
                >
                  <div className={`h-24 rounded-xl ${store.coverColor} mb-3 overflow-hidden relative flex items-center justify-center p-4`}>
                    <StoreLogo 
                      src={store.logo} 
                      name={store.name}
                      className="max-h-16 max-w-28"
                      textClassName="text-2xl"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm truncate">{store.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      {store.rating}
                    </div>
                    <span>•</span>
                    <span>{store.deliveryTime}</span>
                  </div>
                </Link>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* Popular Stores Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Popular Near You</h2>
            <button className="text-sm text-primary font-medium">See all</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {popularStores.map((store) => (
              <Link
                key={store.id}
                to={`/customer/store/${store.id}`}
                className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
              >
                <div className={`h-20 ${store.coverColor} flex items-center justify-center p-3 relative`}>
                  <StoreLogo 
                    src={store.logo} 
                    name={store.name}
                    className="max-h-12 max-w-20"
                    textClassName="text-xl"
                  />
                  <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ExternalLink className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-foreground text-sm">{store.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span>{store.rating}</span>
                    <span className="mx-1">•</span>
                    <Clock className="w-3 h-3" />
                    <span>{store.deliveryTime}</span>
                  </div>
                  <div className="text-xs text-primary mt-1.5 font-medium">
                    GH₵{store.deliveryFee} delivery
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Orders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Recent Orders</h2>
            <Link to="/customer/orders" className="text-sm text-primary font-medium">View all</Link>
          </div>
          
          <div className="space-y-3">
            {[
              { id: 'ORD-001', service: '🍔 Food', from: 'KFC Osu', status: 'Delivered', time: '2 hours ago' },
              { id: 'ORD-002', service: '📦 Package', from: 'East Legon', status: 'In Transit', time: '5 hours ago' },
            ].map((order) => (
              <Link
                key={order.id}
                to={`/customer/track/${order.id}`}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
              >
                <div className="text-2xl">{order.service.split(' ')[0]}</div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{order.from}</p>
                  <p className="text-sm text-muted-foreground">{order.time}</p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  order.status === 'Delivered' 
                    ? 'bg-success/10 text-success'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {order.status}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Nearby Riders */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Riders Near You</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              12 online
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-secondary/50 to-secondary rounded-2xl p-6 text-center">
            <div className="flex justify-center -space-x-3 mb-4">
              {['K', 'A', 'Y', 'E'].map((letter, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold border-2 border-background"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <p className="text-foreground font-medium mb-1">Riders ready to deliver</p>
            <p className="text-sm text-muted-foreground">Average wait time: 3-5 mins</p>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-6 py-3 safe-area-pb">
        <div className="flex items-center justify-around">
          <Link to="/customer" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Zap className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/customer/orders" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer/orders' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Clock className="w-5 h-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link to="/customer/book" className="relative -top-4">
            <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center shadow-glow">
              <Navigation className="w-6 h-6 text-white" />
            </div>
          </Link>
          <Link to="/customer/notifications" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer/notifications' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Bell className="w-5 h-5" />
            <span className="text-xs">Alerts</span>
          </Link>
          <Link to="/customer/profile" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer/profile' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CustomerHome;