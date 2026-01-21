import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, Phone, MessageSquare, MapPin, Navigation,
  Clock, Star, Shield
} from 'lucide-react';
import { mockRiders } from '@/data/deliveryData';
import LiveMap from '@/components/tracking/LiveMap';

type DeliveryStatus = 'searching' | 'accepted' | 'arriving' | 'picked_up' | 'delivering' | 'delivered';

const TrackDelivery: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [status, setStatus] = useState<DeliveryStatus>('searching');
  const [showDetails, setShowDetails] = useState(false);
  const [eta, setEta] = useState(15);

  const rider = mockRiders[0];

  // Simulate delivery progress
  useEffect(() => {
    const statusSequence: DeliveryStatus[] = ['searching', 'accepted', 'arriving', 'picked_up', 'delivering', 'delivered'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statusSequence.length - 1) {
        currentIndex++;
        setStatus(statusSequence[currentIndex]);
        setEta(Math.max(1, 15 - currentIndex * 3));
      } else {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statusInfo: Record<DeliveryStatus, { text: string; color: string; icon: string }> = {
    searching: { text: 'Finding a rider...', color: 'text-warning', icon: '🔍' },
    accepted: { text: 'Rider accepted your order', color: 'text-primary', icon: '✅' },
    arriving: { text: 'Rider arriving at pickup', color: 'text-accent', icon: '🏍️' },
    picked_up: { text: 'Package picked up!', color: 'text-primary', icon: '📦' },
    delivering: { text: 'On the way to you', color: 'text-success', icon: '🚀' },
    delivered: { text: 'Order delivered!', color: 'text-success', icon: '🎉' },
  };

  const pickupLocation = { lat: 5.6037, lng: -0.1870 };
  const dropoffLocation = { lat: 5.6145, lng: -0.2050 };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Map Area */}
      <div className="h-[55vh] relative">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate('/customer')}
            className="w-10 h-10 rounded-full bg-background shadow-lg flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-background rounded-full px-4 py-2 shadow-lg flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Order #{orderId}</span>
            <div className={`w-2 h-2 rounded-full ${status === 'delivered' ? 'bg-success' : 'bg-primary animate-pulse'}`} />
          </div>
        </div>

        {/* Live Map Component */}
        <LiveMap
          pickupLocation={pickupLocation}
          dropoffLocation={dropoffLocation}
          status={status}
        />
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
          {/* Status Banner */}
          <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-2xl mb-6">
            <div className="text-3xl">{statusInfo[status].icon}</div>
            <div className="flex-1">
              <p className={`font-semibold ${statusInfo[status].color}`}>
                {statusInfo[status].text}
              </p>
              {status !== 'delivered' && status !== 'searching' && (
                <p className="text-sm text-muted-foreground">
                  Estimated arrival: {eta} mins
                </p>
              )}
            </div>
            {status !== 'searching' && status !== 'delivered' && (
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{eta}</p>
                <p className="text-xs text-muted-foreground">min</p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex items-center justify-between relative">
              {(['accepted', 'picked_up', 'delivering', 'delivered'] as const).map((step, index) => {
                const stepIndex = ['searching', 'accepted', 'arriving', 'picked_up', 'delivering', 'delivered'].indexOf(status);
                const currentStepIndex = ['accepted', 'picked_up', 'delivering', 'delivered'].indexOf(step);
                const isCompleted = stepIndex > ['searching', 'accepted', 'arriving', 'picked_up', 'delivering', 'delivered'].indexOf(step);
                const isCurrent = status === step || (step === 'accepted' && (status === 'accepted' || status === 'arriving'));
                
                return (
                  <div key={step} className="flex flex-col items-center z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted || isCurrent
                        ? 'bg-primary text-white'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {step === 'accepted' && '✓'}
                      {step === 'picked_up' && '📦'}
                      {step === 'delivering' && '🚀'}
                      {step === 'delivered' && '🎉'}
                    </div>
                    <p className={`text-xs mt-2 ${isCompleted || isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step === 'accepted' && 'Accepted'}
                      {step === 'picked_up' && 'Picked up'}
                      {step === 'delivering' && 'Delivering'}
                      {step === 'delivered' && 'Delivered'}
                    </p>
                  </div>
                );
              })}
              
              {/* Progress line */}
              <div className="absolute top-5 left-5 right-5 h-0.5 bg-secondary -z-0">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ 
                    width: status === 'delivered' ? '100%' 
                      : status === 'delivering' ? '75%'
                      : status === 'picked_up' ? '50%'
                      : status === 'arriving' || status === 'accepted' ? '25%'
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Rider Info */}
          {status !== 'searching' && (
            <div className="bg-card rounded-2xl border border-border p-4 mb-6 animate-fade-in">
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
          )}

          {/* Order Details */}
          {showDetails && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="font-semibold text-foreground">Delivery Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">PICKUP</p>
                    <p className="text-sm font-medium">KFC Osu, Oxford Street</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-accent" />
                  </div>
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
