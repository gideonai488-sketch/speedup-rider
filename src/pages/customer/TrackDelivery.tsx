import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Phone, MessageSquare, MapPin, Navigation,
  Clock, Star, Shield, ChevronUp
} from 'lucide-react';
import { mockRiders } from '@/data/deliveryData';

const TrackDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [riderProgress, setRiderProgress] = useState(0);
  const [status, setStatus] = useState<'accepted' | 'arriving' | 'picked_up' | 'delivering'>('accepted');
  const [showDetails, setShowDetails] = useState(false);

  const rider = mockRiders[0];

  // Simulate rider movement
  useEffect(() => {
    const interval = setInterval(() => {
      setRiderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        
        // Update status based on progress
        if (prev >= 75) setStatus('delivering');
        else if (prev >= 50) setStatus('picked_up');
        else if (prev >= 25) setStatus('arriving');
        
        return prev + 2;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const statusInfo = {
    accepted: { text: 'Rider accepted your order', color: 'text-primary' },
    arriving: { text: 'Rider is arriving at pickup', color: 'text-warning' },
    picked_up: { text: 'Package picked up', color: 'text-accent' },
    delivering: { text: 'On the way to you', color: 'text-success' },
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Map Area (simulated) */}
      <div className="h-[60vh] bg-gradient-to-b from-secondary to-background relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <button 
            onClick={() => navigate('/customer/home')}
            className="w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Simulated Map with moving rider */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--rush))" />
              </linearGradient>
            </defs>
            <path 
              d="M 80,300 Q 200,200 320,350 T 520,280" 
              stroke="url(#routeGradient)" 
              strokeWidth="4" 
              fill="none"
              strokeDasharray="8 8"
              className="animate-pulse"
            />
          </svg>

          {/* Pickup point */}
          <div className="absolute left-[15%] top-[50%]">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-primary shadow-glow" />
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-background px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-md">
                Pickup
              </div>
            </div>
          </div>

          {/* Dropoff point */}
          <div className="absolute right-[15%] top-[45%]">
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-rush shadow-rush">
                <div className="absolute inset-0 rounded-full bg-rush animate-ping-location opacity-50" />
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-background px-2 py-1 rounded text-xs font-medium whitespace-nowrap shadow-md">
                Dropoff
              </div>
            </div>
          </div>

          {/* Rider marker */}
          <div 
            className="absolute transition-all duration-500 ease-out"
            style={{ 
              left: `${15 + (riderProgress * 0.7)}%`,
              top: `${50 - Math.sin(riderProgress / 20) * 10}%`
            }}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center shadow-glow animate-float">
                <span className="text-xl">🏍️</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success flex items-center justify-center border-2 border-background">
                <Navigation className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
        </div>
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
          {/* Status */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${statusInfo[status].color}`}>
                {statusInfo[status].text}
              </p>
              <p className="text-sm text-muted-foreground">
                Estimated arrival: {Math.max(5, 15 - Math.floor(riderProgress / 7))} mins
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full gradient-hero transition-all duration-500"
                style={{ width: `${riderProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Order accepted</span>
              <span>Picked up</span>
              <span>Delivered</span>
            </div>
          </div>

          {/* Rider Info */}
          <div className="bg-card rounded-2xl border border-border p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center text-white font-bold text-xl">
                {rider.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{rider.name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  <span>{rider.rating}</span>
                  <span>•</span>
                  <span>{rider.vehiclePlate}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full">
                  <MessageSquare className="w-4 h-4" />
                </Button>
                <Button size="icon" className="rounded-full gradient-hero text-white">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Order Details */}
          {showDetails && (
            <div className="space-y-4 animate-slide-up">
              <h3 className="font-semibold text-foreground">Delivery Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">PICKUP</p>
                    <p className="text-sm font-medium">KFC Osu, Oxford Street</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rush mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">DROPOFF</p>
                    <p className="text-sm font-medium">East Legon, American House</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-success" />
                  <span className="text-sm text-foreground">Order #{orderId}</span>
                </div>
                <span className="font-bold text-primary">GH₵ 25</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackDelivery;
