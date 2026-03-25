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
  Zap, MapPin, Clock, Search, Bell, User, Globe,
  ChevronRight, Star, Navigation, UtensilsCrossed,
  ShoppingCart, Pill, ClipboardList, Package, FileText, ExternalLink, LogOut, RefreshCw, Gavel, Check, LocateFixed,
  ArrowRight, Sparkles
} from 'lucide-react';
import owlLogo from '@/assets/speedup-owl-logo.png';
import { useCountry } from '@/context/CountryContext';
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
  food: <UtensilsCrossed className="w-5 h-5" />,
  groceries: <ShoppingCart className="w-5 h-5" />,
  pharmacy: <Pill className="w-5 h-5" />,
  errands: <ClipboardList className="w-5 h-5" />,
  packages: <Package className="w-5 h-5" />,
  documents: <FileText className="w-5 h-5" />,
  shipping: <Globe className="w-5 h-5" />,
};

const serviceGradients: Record<string, string> = {
  food: 'from-orange-500/20 to-orange-600/5',
  groceries: 'from-emerald-500/20 to-emerald-600/5',
  pharmacy: 'from-primary/20 to-primary/5',
  errands: 'from-violet-500/20 to-violet-600/5',
  packages: 'from-sky-500/20 to-sky-600/5',
  documents: 'from-cyan-500/20 to-cyan-600/5',
  shipping: 'from-indigo-500/20 to-indigo-600/5',
};

const serviceIconColors: Record<string, string> = {
  food: 'text-orange-500',
  groceries: 'text-emerald-500',
  pharmacy: 'text-primary',
  errands: 'text-violet-500',
  packages: 'text-sky-500',
  documents: 'text-cyan-500',
  shipping: 'text-indigo-400',
};

const serviceBorderColors: Record<string, string> = {
  food: 'border-orange-500/20 hover:border-orange-500/50',
  groceries: 'border-emerald-500/20 hover:border-emerald-500/50',
  pharmacy: 'border-primary/20 hover:border-primary/50',
  errands: 'border-violet-500/20 hover:border-violet-500/50',
  packages: 'border-sky-500/20 hover:border-sky-500/50',
  documents: 'border-cyan-500/20 hover:border-cyan-500/50',
  shipping: 'border-indigo-500/20 hover:border-indigo-500/50',
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
  const { country: countryConfig, countryCode, setCountry: setCountryFn } = useCountry();
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
      {/* Header - Sleek dark glass */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img src={owlLogo} alt="SpeedUp" className="w-11 h-11 object-contain" />
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
            <div className="flex items-center gap-1">
              <Link to="/customer/wallet">
                <Button variant="ghost" size="sm" className="text-primary font-bold text-sm hover:bg-primary/10">
                  {formatCurrency(wallet?.balance || 0)}
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => navigate('/customer/notifications')}>
                <Bell className="w-5 h-5" />
                {orders && orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse ring-2 ring-background" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted" onClick={handleSignOut}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {profile && (
            <p className="text-sm text-muted-foreground mb-3">
              Welcome back, <span className="font-semibold text-foreground">{profile.full_name}</span> 👋
            </p>
          )}
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search services, restaurants, stores..."
              className="pl-10 bg-secondary/50 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/20"
            />
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-8">
        {/* 1. Hero Carousel */}
        <HeroCarousel />

        {/* Active Deliveries Awaiting Bids */}
        {pendingBidOrders.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Gavel className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-bold text-foreground">Incoming Bids</h2>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </div>
            </div>

            <div className="space-y-3">
              {pendingBidOrders.map((order: any) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/track/${order.id}`)}
                  className="w-full text-left bg-card rounded-2xl border border-primary/20 p-4 hover:border-primary/50 transition-all active:scale-[0.98] group"
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
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                      <span className="text-foreground font-medium truncate">{order.delivery_address}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <span className="text-xs text-muted-foreground">Tap to view & accept bids</span>
                    <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 2. Services Grid - Premium dark cards */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-base font-bold text-foreground">Our Services</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {serviceCategories.filter(s => s.id !== 'shipping').map((service) => (
              <Link
                key={service.id}
                to={`/customer/book?service=${service.id}`}
                className={cn(
                  'group relative flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 overflow-hidden',
                  'bg-gradient-to-b',
                  serviceGradients[service.id],
                  serviceBorderColors[service.id],
                  selectedService === service.id && 'ring-1 ring-primary/50 scale-[0.97]'
                )}
                onClick={() => setSelectedService(service.id)}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-2.5 relative',
                  'bg-card border border-border',
                  'group-hover:scale-110 transition-transform duration-300'
                )}>
                  <span className={serviceIconColors[service.id]}>{serviceIcons[service.id]}</span>
                </div>
                <span className="text-xs font-semibold text-foreground text-center leading-tight">{service.name}</span>
                <span className="text-[10px] text-muted-foreground mt-1 font-medium">From GH₵{service.basePrice}</span>
              </Link>
            ))}
          </div>

          {/* Global Shipping - Premium banner */}
          {serviceCategories.filter(s => s.id === 'shipping').map((service) => (
            <Link
              key={service.id}
              to="/customer/shipping"
              className={cn(
                'group flex items-center gap-4 w-full p-4 rounded-2xl border transition-all mt-4 relative overflow-hidden',
                'bg-gradient-to-r from-indigo-500/10 via-card to-primary/10',
                'border-indigo-500/20 hover:border-indigo-400/40',
              )}
              onClick={() => setSelectedService(service.id)}
            >
              {/* Animated shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{service.name}</span>
                  <span className="text-[9px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                </div>
                <span className="text-xs text-muted-foreground">{service.description}</span>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-xs text-primary font-bold">GH₵{service.basePrice}+</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}
        </section>

        {/* 3. Online Riders */}
        <OnlineRidersPreview />

        {/* 4. Featured Stores */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Featured Stores</h2>
                {isFilteredByCity && currentCity && (
                  <span className="text-[10px] text-muted-foreground">in {currentCity}</span>
                )}
              </div>
            </div>
            <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-1.5 transition-all">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-4">
              {storesLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-44">
                    <Skeleton className="h-28 rounded-2xl mb-3 bg-secondary/50" />
                    <Skeleton className="h-4 w-24 mb-2 bg-secondary/50" />
                    <Skeleton className="h-3 w-20 bg-secondary/50" />
                  </div>
                ))
              ) : (
                featuredStores.map((store) => (
                  <Link key={store.id} to={`/customer/store/${store.id}`} className="group flex-shrink-0 w-44">
                    <div className={`h-28 rounded-2xl ${store.cover_color || 'bg-primary'} mb-3 overflow-hidden relative flex items-center justify-center p-4`}>
                      <StoreLogo src={store.logo_url || ''} name={store.name} className="max-h-16 max-w-28" textClassName="text-2xl" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm truncate">{store.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-foreground">{store.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                      <span className="text-muted-foreground">•</span>
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
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Popular Near You</h2>
                {isFilteredByCity && currentCity && (
                  <span className="text-[10px] text-muted-foreground">{currentCity}</span>
                )}
              </div>
            </div>
            <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-1.5 transition-all">
              See all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {storesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <Skeleton className="h-24 bg-secondary/50" />
                  <div className="p-3">
                    <Skeleton className="h-4 w-20 mb-2 bg-muted" />
                    <Skeleton className="h-3 w-24 bg-muted" />
                  </div>
                </div>
              ))
            ) : (
              stores.map((store) => (
                <Link
                  key={store.id}
                  to={`/customer/store/${store.id}`}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/30 transition-all group"
                >
                  <div className={`h-24 ${store.cover_color || 'bg-primary'} flex items-center justify-center p-3 relative`}>
                    <StoreLogo src={store.logo_url || ''} name={store.name} className="max-h-12 max-w-20" textClassName="text-xl" />
                    <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-foreground text-sm">{store.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-foreground">{store.rating?.toFixed(1) || '0.0'}</span>
                      <span className="mx-0.5 text-muted-foreground">•</span>
                      <Clock className="w-3 h-3" />
                      <span>{store.delivery_time}</span>
                    </div>
                    <div className="text-[10px] text-primary mt-1.5 font-semibold flex items-center gap-1">
                      <Gavel className="w-3 h-3" />
                      Rider bids for delivery
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation - Dark glass */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border px-6 py-3 safe-area-pb">
        <div className="flex items-center justify-around">
          <Link to="/customer" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Zap className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link to="/customer/orders" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer/orders' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Clock className="w-5 h-5" />
            <span className="text-[10px]">Orders</span>
          </Link>
          <Link to="/customer/book" className="relative -top-4">
            <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center shadow-glow ring-4 ring-background">
              <Navigation className="w-6 h-6 text-white" />
            </div>
          </Link>
          <Link to="/customer/notifications" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer/notifications' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Bell className="w-5 h-5" />
            <span className="text-[10px]">Alerts</span>
          </Link>
          <Link to="/customer/profile" className={cn("flex flex-col items-center gap-1", location.pathname === '/customer/profile' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <User className="w-5 h-5" />
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </nav>

      {/* City Picker Sheet */}
      <Sheet open={cityPickerOpen} onOpenChange={setCityPickerOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl bg-background border-border">
          <SheetHeader className="pb-2">
            <SheetTitle className="text-foreground">Choose Your City</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-secondary/50 border-border text-foreground hover:bg-muted"
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

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search city..."
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border text-foreground"
              />
            </div>

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
                          ? "bg-primary/15 text-primary font-medium"
                          : "hover:bg-muted text-foreground"
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
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1.5">
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
                              ? "bg-primary/15 text-primary font-medium"
                              : "hover:bg-muted text-foreground"
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
