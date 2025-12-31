import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, MessageCircle, MapPin, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import RiderMap from '@/components/tracking/RiderMap';
import OrderTimeline from '@/components/tracking/OrderTimeline';
import { toast } from 'sonner';

// Mock order data
const mockTrackingData = {
  orderId: 'ORD-001',
  status: 'out_for_delivery',
  estimatedTime: '15 mins',
  rider: {
    name: 'Kwaku Frimpong',
    phone: '+233 20 111 2222',
    rating: 4.8,
    photo: null,
  },
  items: [
    { name: 'Wash & Fold', quantity: 5 },
    { name: 'Dry Cleaning', quantity: 2 },
  ],
  total: 275,
  destination: {
    address: '15 Oxford Street, Osu, Accra',
    lat: 5.5560,
    lng: -0.1869,
  },
};

// Simulated rider movement (Accra coordinates)
const riderPath = [
  { lat: 5.5620, lng: -0.1920 },
  { lat: 5.5600, lng: -0.1900 },
  { lat: 5.5585, lng: -0.1885 },
  { lat: 5.5570, lng: -0.1875 },
  { lat: 5.5565, lng: -0.1870 },
  { lat: 5.5560, lng: -0.1869 },
];

const TrackOrder: React.FC = () => {
  const navigate = useNavigate();
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(true);
  const [riderLocation, setRiderLocation] = useState(riderPath[0]);
  const [pathIndex, setPathIndex] = useState(0);

  // Simulate rider movement
  useEffect(() => {
    if (!mapboxToken || pathIndex >= riderPath.length - 1) return;

    const interval = setInterval(() => {
      setPathIndex(prev => {
        const next = prev + 1;
        if (next < riderPath.length) {
          setRiderLocation(riderPath[next]);
          if (next === riderPath.length - 1) {
            toast.success('Rider has arrived!');
          }
        }
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [mapboxToken, pathIndex]);

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      toast.success('Map loaded successfully');
    } else {
      toast.error('Please enter a valid Mapbox token');
    }
  };

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

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
              <p className="text-xs text-muted-foreground">{mockTrackingData.orderId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Map Section */}
      <div className="h-[280px] relative">
        {showTokenInput ? (
          <div className="absolute inset-0 bg-muted flex flex-col items-center justify-center p-6 gap-4">
            <MapPin className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium text-foreground mb-1">Enable Map View</p>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your Mapbox public token to view rider location
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <Input
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="bg-card"
              />
              <Button 
                onClick={handleTokenSubmit}
                className="w-full gradient-hero text-primary-foreground"
              >
                Load Map
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Get your token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary underline">mapbox.com</a>
              </p>
            </div>
          </div>
        ) : (
          <RiderMap
            riderLocation={riderLocation}
            destinationLocation={mockTrackingData.destination}
            mapboxToken={mapboxToken}
          />
        )}

        {/* ETA Overlay */}
        {!showTokenInput && (
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-card/95 backdrop-blur-sm rounded-xl p-3 shadow-card border border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-coral" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Estimated arrival</p>
                    <p className="font-bold text-foreground">{mockTrackingData.estimatedTime}</p>
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
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4 -mt-6 relative z-10">
        {/* Rider Card */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-primary-foreground font-bold text-lg">
              {mockTrackingData.rider.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{mockTrackingData.rider.name}</p>
              <p className="text-sm text-muted-foreground">Your delivery rider</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-warning">★</span>
                <span className="text-sm font-medium">{mockTrackingData.rider.rating}</span>
              </div>
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

        {/* Delivery Address */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Delivery Address</p>
              <p className="font-medium text-foreground mt-0.5">{mockTrackingData.destination.address}</p>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <OrderTimeline 
          currentStatus={mockTrackingData.status}
          estimatedTime={mockTrackingData.estimatedTime}
        />

        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Order Summary</h3>
          </div>
          <div className="space-y-2">
            {mockTrackingData.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-primary">{formatCurrency(mockTrackingData.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
