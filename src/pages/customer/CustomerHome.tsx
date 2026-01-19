import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Zap, MapPin, Clock, Search, Bell, User, Menu,
  ChevronRight, Star, Navigation
} from 'lucide-react';
import { serviceCategories } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';

const CustomerHome: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Deliver to</p>
                <button className="flex items-center gap-1 font-medium text-foreground">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  Osu, Accra
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
              <Link to="/customer/profile">
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
              className="pl-10 bg-secondary/50"
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

        {/* Services Grid */}
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
                <span className="text-3xl mb-2">{service.icon}</span>
                <span className="text-xs font-medium text-foreground text-center">{service.name}</span>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-6 py-3">
        <div className="flex items-center justify-around">
          <Link to="/customer/home" className="flex flex-col items-center gap-1 text-primary">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/customer/orders" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Clock className="w-5 h-5" />
            <span className="text-xs">Orders</span>
          </Link>
          <Link to="/customer/book" className="relative -top-4">
            <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center shadow-glow">
              <Navigation className="w-6 h-6 text-white" />
            </div>
          </Link>
          <Link to="/customer/notifications" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <span className="text-xs">Alerts</span>
          </Link>
          <Link to="/customer/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default CustomerHome;
