import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, MapPin, Navigation, Clock, CreditCard, 
  ChevronRight, Loader2, Zap
} from 'lucide-react';
import { serviceCategories } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';
import { toast } from 'sonner';

const BookDelivery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') as ServiceType | null;
  
  const [step, setStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: preselectedService || '' as ServiceType,
    pickupAddress: '',
    pickupLandmark: '',
    dropoffAddress: '',
    dropoffLandmark: '',
    description: '',
    contactName: '',
    contactPhone: '',
  });
  
  const [estimate, setEstimate] = useState({
    distance: 5.2,
    duration: '15-20 mins',
    fee: 25,
  });

  const selectedService = serviceCategories.find(s => s.id === formData.serviceType);

  const handleServiceSelect = (serviceId: ServiceType) => {
    setFormData({ ...formData, serviceType: serviceId });
    setStep(2);
  };

  const handleLocationSubmit = () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      toast.error('Please enter both pickup and dropoff locations');
      return;
    }
    // Calculate estimate based on inputs
    const basePrice = selectedService?.basePrice || 5;
    const pricePerKm = selectedService?.pricePerKm || 1.5;
    const distance = Math.random() * 10 + 2; // Mock distance
    const fee = basePrice + (distance * pricePerKm);
    
    setEstimate({
      distance: Math.round(distance * 10) / 10,
      duration: `${Math.round(distance * 3)}-${Math.round(distance * 4)} mins`,
      fee: Math.round(fee),
    });
    setStep(3);
  };

  const handleFindRider = async () => {
    setIsSearching(true);
    
    // Simulate rider search
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    toast.success('Rider found! Kofi is on the way.');
    navigate('/customer/track/DEMO-001');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground">
              {step === 1 && 'Select Service'}
              {step === 2 && 'Enter Locations'}
              {step === 3 && 'Confirm & Book'}
            </h1>
            <p className="text-xs text-muted-foreground">Step {step} of 3</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${
                s <= step ? 'gradient-hero' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </header>

      <main className="px-4 py-6">
        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="space-y-4 stagger-children">
            <p className="text-muted-foreground">What do you need delivered?</p>
            
            <div className="grid grid-cols-2 gap-3">
              {serviceCategories.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left ${
                    formData.serviceType === service.id
                      ? 'border-primary bg-primary/5 shadow-glow'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <span className="text-3xl mb-3">{service.icon}</span>
                  <span className="font-semibold text-foreground">{service.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">{service.description}</span>
                  <span className="text-xs text-primary mt-2">From GH₵ {service.basePrice}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Locations */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <span className="text-2xl">{selectedService?.icon}</span>
              <div>
                <p className="font-medium text-foreground">{selectedService?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedService?.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center py-4">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="flex-1 w-0.5 bg-border my-1" />
                  <div className="w-3 h-3 rounded-full bg-rush" />
                </div>
                
                <div className="space-y-3 pl-10">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <Label className="text-xs text-muted-foreground">PICKUP LOCATION</Label>
                    <Input
                      placeholder="Enter pickup address"
                      value={formData.pickupAddress}
                      onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                      className="border-0 p-0 h-auto text-foreground font-medium focus-visible:ring-0 mt-1"
                    />
                    <Input
                      placeholder="Landmark (optional)"
                      value={formData.pickupLandmark}
                      onChange={(e) => setFormData({ ...formData, pickupLandmark: e.target.value })}
                      className="border-0 p-0 h-auto text-sm text-muted-foreground focus-visible:ring-0 mt-1"
                    />
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border p-4">
                    <Label className="text-xs text-muted-foreground">DROPOFF LOCATION</Label>
                    <Input
                      placeholder="Enter dropoff address"
                      value={formData.dropoffAddress}
                      onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                      className="border-0 p-0 h-auto text-foreground font-medium focus-visible:ring-0 mt-1"
                    />
                    <Input
                      placeholder="Landmark (optional)"
                      value={formData.dropoffLandmark}
                      onChange={(e) => setFormData({ ...formData, dropoffLandmark: e.target.value })}
                      className="border-0 p-0 h-auto text-sm text-muted-foreground focus-visible:ring-0 mt-1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Package Description (optional)</Label>
                <Textarea
                  placeholder="Describe what you're sending..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleLocationSubmit}
                className="w-full gradient-hero text-white shadow-glow"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Route Summary */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedService?.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{selectedService?.name}</p>
                    <p className="text-sm text-muted-foreground">{estimate.distance} km • {estimate.duration}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">PICKUP</p>
                    <p className="text-sm font-medium text-foreground">{formData.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-rush mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">DROPOFF</p>
                    <p className="text-sm font-medium text-foreground">{formData.dropoffAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <Label>Receiver Contact (optional)</Label>
              <Input
                placeholder="Receiver's name"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
              <Input
                placeholder="Receiver's phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>

            {/* Fare Breakdown */}
            <div className="bg-secondary/50 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base fare</span>
                <span className="text-foreground">GH₵ {selectedService?.basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance ({estimate.distance} km)</span>
                <span className="text-foreground">GH₵ {Math.round(estimate.distance * (selectedService?.pricePerKm || 1.5))}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-xl text-primary">GH₵ {estimate.fee}</span>
              </div>
            </div>

            {/* Payment Method */}
            <button className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-warning" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">Mobile Money</p>
                  <p className="text-xs text-muted-foreground">MTN MoMo ••••4567</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Find Rider Button */}
            <Button 
              onClick={handleFindRider}
              disabled={isSearching}
              className="w-full h-14 gradient-hero text-white shadow-glow text-lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Finding nearby rider...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 mr-2" />
                  Find Rider • GH₵ {estimate.fee}
                </>
              )}
            </Button>
          </div>
        )}
      </main>

      {/* Searching Overlay */}
      {isSearching && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-4 rounded-full gradient-hero flex items-center justify-center">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Finding your rider</h3>
            <p className="text-muted-foreground">Looking for the nearest available rider...</p>
            
            <div className="flex justify-center gap-1 mt-6">
              {[0, 1, 2].map((i) => (
                <div 
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDelivery;
