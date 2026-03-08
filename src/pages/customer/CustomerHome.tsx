import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import StoreLogo from '@/components/ui/store-logo';
import HeroCarousel from '@/components/home/HeroCarousel';
import OnlineRidersPreview from '@/components/home/OnlineRidersPreview';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Zap, MapPin, Clock, Search, Bell, User,
  ChevronRight, Star, Navigation, UtensilsCrossed,
  ShoppingCart, Pill, ClipboardList, Package, FileText, ExternalLink, LogOut, RefreshCw, Gavel, Check, LocateFixed
} from 'lucide-react';
import { ghanaianCities, getCitiesByRegion } from '@/data/ghanaianCities';
import { serviceCategories } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';
import { useStoresByCity } from '@/hooks/useStores';
import { useOrders } from '@/hooks/useOrders';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/context/AuthContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useOrderBids } from '@/hooks/useBids';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type StoreCategory = Database['public']['Enums']['store_category'];

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

// Inline bid count for a single order
const OrderBidCount: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { data: bids = [] } = useOrderBids(orderId);
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary">
      <Gavel className="w-3.5 h-3.5" />
      {bids.length} bid{bids.length !== 1 ? 's' : ''}
    </span>
  );
};

const CustomerHome: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const { city, isLoading: locationLoading, refetch: refetchLocation, setManualCity, isManual } = useUserLocation();
  const { data: storeData, isLoading: storesLoading } = useStoresByCity(city);
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: wallet } = useWallet();

  const stores = storeData?.stores || [];
  const isFilteredByCity = storeData?.isFiltered || false;
  const currentCity = storeData?.city || city;

  const citiesByRegion = getCitiesByRegion();
  const filteredCities = citySearch
    ? ghanaianCities.filter(c => 
        c.label.toLowerCase().includes(citySearch.toLowerCase()) ||
        c.region.toLowerCase().includes(citySearch.toLowerCase())
      )
    : ghanaianCities;

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const featuredStores = stores.filter(s => s.is_featured) || [];

  // Orders waiting for rider (pending, no rider assigned) — these can have bids
  const pendingBidOrders = (orders || []).filter(
    (o: any) => o.status === 'pending' && !o.rider_id
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const formatCurrency = (amount: number) => `GH₵ ${amount.toFixed(0)}`;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center shadow-lg relative overflow-hidden">
                <span className="text-2xl">🦉</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Speed<span className="text-primary">Up</span>
                </h1>
                <button 
                  onClick={() => setCityPickerOpen(true)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="w-3 h-3 text-primary" />
                  {locationLoading ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Detecting...
                    </span>
                  ) : (
                    <>
                      {currentCity || profile?.address || 'Set location'}
                      {isManual && <span className="text-[10px] text-primary">(manual)</span>}
                      <ChevronRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/customer/wallet">
                <Button variant="ghost" size="sm" className="text-primary font-semibold">
                  {formatCurrency(wallet?.balance || 0)}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="relative" onClick={() => navigate('/customer/notifications')}>
                <Bell className="w-5 h-5" />
                {orders && orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {profile && (
            <p className="text-sm text-muted-foreground mb-3">
              Welcome back, <span className="font-medium text-foreground">{profile.full_name}</span>!
            </p>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search for services, restaurants, stores..."
              className="pl-10 bg-secondary/50 rounded-xl"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-7">
        {/* 1. Hero Carousel with ads/videos/images */}
        <HeroCarousel />

        {/* Active Deliveries Awaiting Bids */}
        {pendingBidOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Incoming Bids</h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live
              </div>
            </div>

            <div className="space-y-3">
              {pendingBidOrders.map((order: any) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/track/${order.id}`)}
                  className="w-full text-left bg-card rounded-2xl border-2 border-primary/30 p-4 hover:border-primary/60 transition-all shadow-[0_0_15px_rgba(var(--primary),0.08)] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                        {order.stores?.logo_url ? (
                          <img src={order.stores.logo_url} alt="" className="w-8 h-8 object-contain rounded-lg" />
                        ) : (
                          <Package className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{order.order_number || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.stores?.name || 'Delivery'}</p>
                      </div>
                    </div>
                    <OrderBidCount orderId={order.id} />
                  </div>

                  <div className="space-y-1.5 text-xs mb-3">
                    {order.pickup_address && (
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground truncate">{order.pickup_address}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-success mt-1 flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">{order.delivery_address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Tap to view & accept bids</span>
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 2. Services Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Our Services</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {serviceCategories.map((service) => (
              <Link
                key={service.id}
                to={`/customer/book?service=${service.id}`}
                className={cn(
                  'flex flex-col items-center p-4 rounded-xl border-2 transition-all',
                  selectedService === service.id
                    ? 'border-primary bg-primary/5 shadow-glow'
                    : 'border-border bg-card hover:border-primary/50'
                )}
                onClick={() => setSelectedService(service.id)}
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-2', serviceColors[service.id])}>
                  {serviceIcons[service.id]}
                </div>
                <span className="text-xs font-medium text-foreground text-center">{service.name}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">From GH₵{service.basePrice}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Online Riders */}
        <OnlineRidersPreview />

        {/* 4. Featured Stores */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Featured Stores</h2>
              {isFilteredByCity && currentCity && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  in {currentCity}
                </span>
              )}
            </div>
            <button className="text-sm text-primary font-medium">See all</button>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 pb-4">
              {storesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-40">
                    <Skeleton className="h-24 rounded-xl mb-3" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                ))
              ) : (
                featuredStores.map((store) => (
                  <Link key={store.id} to={`/customer/store/${store.id}`} className="group flex-shrink-0 w-40">
                    <div className={`h-24 rounded-xl ${store.cover_color || 'bg-primary'} mb-3 overflow-hidden relative flex items-center justify-center p-4`}>
                      <StoreLogo src={store.logo_url || ''} name={store.name} className="max-h-16 max-w-28" textClassName="text-2xl" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm truncate">{store.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {store.rating?.toFixed(1) || '0.0'}
                      </div>
                      <span>•</span>
                      <span>{store.delivery_time}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </section>

        {/* 5. Popular Stores Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">Popular Near You</h2>
              {isFilteredByCity && currentCity && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {currentCity}
                </span>
              )}
            </div>
            <button className="text-sm text-primary font-medium">See all</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {storesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                  <Skeleton className="h-20" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : (
              stores.map((store) => (
                <Link
                  key={store.id}
                  to={`/customer/store/${store.id}`}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
                >
                  <div className={`h-20 ${store.cover_color || 'bg-primary'} flex items-center justify-center p-3 relative`}>
                    <StoreLogo src={store.logo_url || ''} name={store.name} className="max-h-12 max-w-20" textClassName="text-xl" />
                    <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground text-sm">{store.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span>{store.rating?.toFixed(1) || '0.0'}</span>
                      <span className="mx-1">•</span>
                      <Clock className="w-3 h-3" />
                      <span>{store.delivery_time}</span>
                    </div>
                    <div className="text-xs text-primary mt-1.5 font-medium">
                      Rider bids for delivery
                    </div>
                  </div>
                </Link>
              ))
            )}
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

      {/* City Picker Sheet */}
      <Sheet open={cityPickerOpen} onOpenChange={setCityPickerOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader className="pb-2">
            <SheetTitle>Choose Your City</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-3">
            {/* Auto-detect button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                refetchLocation();
                setCityPickerOpen(false);
              }}
            >
              <LocateFixed className="w-4 h-4 text-primary" />
              Auto-detect my location
              {!isManual && city && (
                <Check className="w-4 h-4 ml-auto text-primary" />
              )}
            </Button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* City list */}
            <ScrollArea className="h-[calc(80vh-200px)]">
              <div className="space-y-1 pr-3">
                {citySearch ? (
                  filteredCities.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setManualCity(c.label);
                        setCityPickerOpen(false);
                        setCitySearch('');
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                        currentCity?.toLowerCase() === c.label.toLowerCase()
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-secondary text-foreground"
                      )}
                    >
                      <div>
                        <span>{c.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">{c.region}</span>
                      </div>
                      {currentCity?.toLowerCase() === c.label.toLowerCase() && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))
                ) : (
                  Object.entries(citiesByRegion).map(([region, cities]) => (
                    <div key={region} className="mb-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">
                        {region}
                      </p>
                      {cities.map((c) => (
                        <button
                          key={c.value}
                          onClick={() => {
                            setManualCity(c.label);
                            setCityPickerOpen(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                            currentCity?.toLowerCase() === c.label.toLowerCase()
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-secondary text-foreground"
                          )}
                        >
                          <span>{c.label}</span>
                          {currentCity?.toLowerCase() === c.label.toLowerCase() && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CustomerHome;
