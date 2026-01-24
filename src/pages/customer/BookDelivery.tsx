import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, MapPin, Navigation, 
  ChevronRight, Loader2, Zap, TrendingUp, Clock
} from 'lucide-react';
import { serviceCategories } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import useDeliveryFee from '@/hooks/useDeliveryFee';

const BookDelivery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') as ServiceType | null;
  const { profile } = useAuth();
  const createOrder = useCreateOrder();
  const { calculateFee, feeBreakdown, isCalculating, formatFee } = useDeliveryFee();
  
  const [step, setStep] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    serviceType: preselectedService || '' as ServiceType,
    pickupAddress: '',
    pickupCoords: null as { lat: number; lng: number } | null,
    pickupLandmark: '',
    dropoffAddress: '',
    dropoffCoords: null as { lat: number; lng: number } | null,
    dropoffLandmark: '',
    description: '',
    contactName: '',
    contactPhone: '',
  });
  
  const [estimate, setEstimate] = useState({
    distance: 0,
    duration: '',
    fee: 0,
    baseFee: 5,
    distanceFee: 0,
    serviceFee: 2,
    surgeMultiplier: 1,
  });

  const selectedService = serviceCategories.find(s => s.id === formData.serviceType);

  const handleServiceSelect = (serviceId: ServiceType) => {
    setFormData({ ...formData, serviceType: serviceId });
    setStep(2);
  };

  const calculateDistance = (
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleLocationSubmit = async () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      toast.error('Please enter both pickup and dropoff locations');
      return;
    }

    if (!formData.pickupCoords || !formData.dropoffCoords) {
      toast.error('Please select addresses from the suggestions');
      return;
    }

    // Calculate real fee using Mapbox directions API
    const breakdown = await calculateFee(formData.pickupCoords, formData.dropoffCoords);
    
    if (breakdown) {
      setEstimate({
        distance: breakdown.distanceKm,
        duration: `${breakdown.estimatedMinutes} mins`,
        fee: breakdown.totalFee,
        baseFee: breakdown.baseFee,
        distanceFee: breakdown.distanceFee,
        serviceFee: breakdown.serviceFee,
        surgeMultiplier: breakdown.surgeMultiplier,
      });
      setStep(3);
    } else {
      // Fallback calculation
      const distance = calculateDistance(
        formData.pickupCoords.lat,
        formData.pickupCoords.lng,
        formData.dropoffCoords.lat,
        formData.dropoffCoords.lng
      );
      const fee = 5 + (distance * 2) + 2; // base + distance + service fee
      setEstimate({
        distance: Math.round(distance * 10) / 10,
        duration: `${Math.round(distance * 3)}-${Math.round(distance * 4)} mins`,
        fee: Math.round(fee),
        baseFee: 5,
        distanceFee: Math.round(distance * 2 * 100) / 100,
        serviceFee: 2,
        surgeMultiplier: 1,
      });
      setStep(3);
    }
  };

  const handleFindRider = async () => {
    if (!profile) {
      toast.error('Please log in to book a delivery');
      navigate('/auth');
      return;
    }

    setIsSearching(true);
    
    try {
      // Create the order in the database with Uber-style fee data
      const orderData = {
        store_id: null as any, // Delivery orders don't have a store
        items: [{
          product_id: null as any,
          product_name: `${selectedService?.name} Delivery`,
          quantity: 1,
          unit_price: estimate.fee,
        }],
        delivery_address: formData.dropoffAddress,
        delivery_lat: formData.dropoffCoords?.lat,
        delivery_lng: formData.dropoffCoords?.lng,
        pickup_address: formData.pickupAddress,
        pickup_lat: formData.pickupCoords?.lat,
        pickup_lng: formData.pickupCoords?.lng,
        notes: formData.description || `${selectedService?.name} delivery. Contact: ${formData.contactName} ${formData.contactPhone}`.trim(),
        delivery_fee: estimate.fee,
        // Uber-style fee breakdown
        distance_km: estimate.distance,
        base_fee: estimate.baseFee,
        per_km_fee: 2,
        service_fee: estimate.serviceFee,
        rider_fee: 5, // Flat fee taken from rider
        surge_multiplier: estimate.surgeMultiplier,
        payment_status: 'pending', // Pay after delivery
      };

      const order = await createOrder.mutateAsync(orderData);
      
      // Simulate finding a rider (in production, this would be handled by a realtime system)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Rider found! Your delivery is on the way.');
      navigate(`/customer/track/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
      setIsSearching(false);
    }
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
                <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center py-4 z-10">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="flex-1 w-0.5 bg-border my-1" />
                  <div className="w-3 h-3 rounded-full bg-coral" />
                </div>
                
                <div className="space-y-3 pl-10">
                  <div className="bg-card rounded-xl border border-border p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">PICKUP LOCATION</Label>
                    <AddressAutocomplete
                      value={formData.pickupAddress}
                      onChange={(address, coords) => setFormData({ 
                        ...formData, 
                        pickupAddress: address,
                        pickupCoords: coords || null
                      })}
                      placeholder="Enter pickup address"
                      icon="pickup"
                      className="border-0 shadow-none"
                    />
                    <Input
                      placeholder="Landmark (optional)"
                      value={formData.pickupLandmark}
                      onChange={(e) => setFormData({ ...formData, pickupLandmark: e.target.value })}
                      className="border-0 p-0 h-auto text-sm text-muted-foreground focus-visible:ring-0 mt-2"
                    />
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">DROPOFF LOCATION</Label>
                    <AddressAutocomplete
                      value={formData.dropoffAddress}
                      onChange={(address, coords) => setFormData({ 
                        ...formData, 
                        dropoffAddress: address,
                        dropoffCoords: coords || null
                      })}
                      placeholder="Enter dropoff address"
                      icon="dropoff"
                      className="border-0 shadow-none"
                    />
                    <Input
                      placeholder="Landmark (optional)"
                      value={formData.dropoffLandmark}
                      onChange={(e) => setFormData({ ...formData, dropoffLandmark: e.target.value })}
                      className="border-0 p-0 h-auto text-sm text-muted-foreground focus-visible:ring-0 mt-2"
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
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating fare...
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
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
                  <MapPin className="w-4 h-4 text-coral mt-0.5" />
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

            {/* Uber-style Fare Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              {/* Surge indicator */}
              {estimate.surgeMultiplier > 1 && (
                <div className="flex items-center gap-2 p-3 bg-warning/10 rounded-xl border border-warning/20 mb-2">
                  <TrendingUp className="w-5 h-5 text-warning" />
                  <div>
                    <p className="text-sm font-medium text-warning">High demand pricing</p>
                    <p className="text-xs text-muted-foreground">
                      {((estimate.surgeMultiplier - 1) * 100).toFixed(0)}% surge due to high demand
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base fare</span>
                <span className="text-foreground">GH₵ {estimate.baseFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance ({estimate.distance} km × GH₵ 2/km)</span>
                <span className="text-foreground">GH₵ {estimate.distanceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service fee</span>
                <span className="text-foreground">GH₵ {estimate.serviceFee.toFixed(2)}</span>
              </div>
              {estimate.surgeMultiplier > 1 && (
                <div className="flex justify-between text-sm text-warning">
                  <span>Surge ({estimate.surgeMultiplier.toFixed(1)}×)</span>
                  <span>+GH₵ {((estimate.baseFee + estimate.distanceFee + estimate.serviceFee) * (estimate.surgeMultiplier - 1)).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-xl text-primary">GH₵ {estimate.fee.toFixed(2)}</span>
              </div>
              
              {/* Pay after delivery note */}
              <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Pay after delivery - no payment required now</span>
              </div>
            </div>

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
