import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Navigation, ChevronRight, Loader2, Zap, TrendingUp, Clock } from 'lucide-react';
import { serviceCategories } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';
import { 
  BookingFormData, 
  DeliveryStop, 
  PackageDetails, 
  FoodDetails, 
  ErrandDetails,
  FeeEstimate 
} from '@/types/booking';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import useDeliveryFee from '@/hooks/useDeliveryFee';

// Booking components
import ServiceSelector from '@/components/booking/ServiceSelector';
import PackageDetailsForm from '@/components/booking/PackageDetailsForm';
import FoodDetailsForm from '@/components/booking/FoodDetailsForm';
import ErrandDetailsForm from '@/components/booking/ErrandDetailsForm';
import MultiStopInput from '@/components/booking/MultiStopInput';
import ScheduleSelector from '@/components/booking/ScheduleSelector';
import SavedAddresses from '@/components/booking/SavedAddresses';

const DEFAULT_PACKAGE_DETAILS: PackageDetails = {
  size: 'medium',
  isFragile: false,
  declaredValue: 0,
};

const DEFAULT_FOOD_DETAILS: FoodDetails = {
  keepWarm: true,
  keepCold: false,
  utensilsNeeded: false,
  contactlessDelivery: false,
};

const DEFAULT_ERRAND_DETAILS: ErrandDetails = {
  taskType: 'buy_something',
  budgetAmount: 0,
  timing: 'asap',
  requireReceipt: true,
  taskDescription: '',
};

const BookDelivery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') as ServiceType | null;
  const { profile } = useAuth();
  const createOrder = useCreateOrder();
  const { calculateFee, isCalculating } = useDeliveryFee();
  
  const [step, setStep] = useState(preselectedService ? 2 : 1);
  const [isSearching, setIsSearching] = useState(false);
  
  const [formData, setFormData] = useState<BookingFormData>({
    serviceType: preselectedService || '',
    timing: 'asap',
    pickupAddress: '',
    pickupCoords: null,
    pickupLandmark: '',
    dropoffs: [{
      id: 'stop-1',
      address: '',
      coords: null,
      landmark: '',
      contactName: '',
      contactPhone: '',
      order: 1,
    }],
    packageDetails: DEFAULT_PACKAGE_DETAILS,
    foodDetails: DEFAULT_FOOD_DETAILS,
    errandDetails: DEFAULT_ERRAND_DETAILS,
    description: '',
    contactName: '',
    contactPhone: '',
  });
  
  const [estimate, setEstimate] = useState<FeeEstimate>({
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
    const R = 6371;
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
    const firstDropoff = formData.dropoffs[0];
    
    if (!formData.pickupAddress || !firstDropoff?.address) {
      toast.error('Please enter pickup and at least one dropoff location');
      return;
    }

    if (!formData.pickupCoords || !firstDropoff?.coords) {
      toast.error('Please select addresses from the suggestions');
      return;
    }

    // Calculate fee for first leg
    const breakdown = await calculateFee(formData.pickupCoords, firstDropoff.coords);
    
    // Add extra stop fees
    const extraStopFee = (formData.dropoffs.length - 1) * 5;
    
    // Add insurance fee if package has declared value
    let insuranceFee = 0;
    if (formData.serviceType === 'packages' && formData.packageDetails?.declaredValue) {
      insuranceFee = formData.packageDetails.declaredValue * 0.02;
    }
    
    if (breakdown) {
      setEstimate({
        distance: breakdown.distanceKm,
        duration: `${breakdown.estimatedMinutes} mins`,
        fee: breakdown.totalFee + extraStopFee + insuranceFee,
        baseFee: breakdown.baseFee,
        distanceFee: breakdown.distanceFee,
        serviceFee: breakdown.serviceFee + extraStopFee,
        surgeMultiplier: breakdown.surgeMultiplier,
        insuranceFee: insuranceFee > 0 ? insuranceFee : undefined,
      });
      setStep(4);
    } else {
      // Fallback calculation
      const distance = calculateDistance(
        formData.pickupCoords.lat,
        formData.pickupCoords.lng,
        firstDropoff.coords.lat,
        firstDropoff.coords.lng
      );
      const fee = 5 + (distance * 2) + 2 + extraStopFee + insuranceFee;
      setEstimate({
        distance: Math.round(distance * 10) / 10,
        duration: `${Math.round(distance * 3)}-${Math.round(distance * 4)} mins`,
        fee: Math.round(fee),
        baseFee: 5,
        distanceFee: Math.round(distance * 2 * 100) / 100,
        serviceFee: 2 + extraStopFee,
        surgeMultiplier: 1,
        insuranceFee: insuranceFee > 0 ? insuranceFee : undefined,
      });
      setStep(4);
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
      const firstDropoff = formData.dropoffs[0];
      
      // Build notes with service-specific details
      let notes = formData.description || '';
      
      if (formData.serviceType === 'packages' && formData.packageDetails) {
        notes += ` | Package: ${formData.packageDetails.size}${formData.packageDetails.isFragile ? ', FRAGILE' : ''}`;
      }
      if (formData.serviceType === 'food' && formData.foodDetails) {
        const prefs = [];
        if (formData.foodDetails.keepWarm) prefs.push('Keep Warm');
        if (formData.foodDetails.keepCold) prefs.push('Keep Cold');
        if (formData.foodDetails.contactlessDelivery) prefs.push('Contactless');
        if (prefs.length) notes += ` | ${prefs.join(', ')}`;
      }
      if (formData.serviceType === 'errands' && formData.errandDetails) {
        notes += ` | Task: ${formData.errandDetails.taskType} - ${formData.errandDetails.taskDescription}`;
        if (formData.errandDetails.budgetAmount) notes += ` | Budget: GH₵${formData.errandDetails.budgetAmount}`;
      }
      
      const orderData = {
        store_id: null as any,
        items: [{
          product_id: null as any,
          product_name: `${selectedService?.name} Delivery`,
          quantity: 1,
          unit_price: estimate.fee,
        }],
        delivery_address: firstDropoff.address,
        delivery_lat: firstDropoff.coords?.lat,
        delivery_lng: firstDropoff.coords?.lng,
        pickup_address: formData.pickupAddress,
        pickup_lat: formData.pickupCoords?.lat,
        pickup_lng: formData.pickupCoords?.lng,
        notes: notes.trim(),
        delivery_fee: estimate.fee,
        distance_km: estimate.distance,
        base_fee: estimate.baseFee,
        per_km_fee: 2,
        service_fee: estimate.serviceFee,
        rider_fee: 5,
        surge_multiplier: estimate.surgeMultiplier,
        payment_status: 'pending',
      };

      const order = await createOrder.mutateAsync(orderData);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Rider found! Your delivery is on the way.');
      navigate(`/customer/track/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
      setIsSearching(false);
    }
  };

  const renderServiceDetails = () => {
    switch (formData.serviceType) {
      case 'packages':
      case 'documents':
        return (
          <PackageDetailsForm
            details={formData.packageDetails || DEFAULT_PACKAGE_DETAILS}
            onChange={(details) => setFormData({ ...formData, packageDetails: details })}
          />
        );
      case 'food':
        return (
          <FoodDetailsForm
            details={formData.foodDetails || DEFAULT_FOOD_DETAILS}
            onChange={(details) => setFormData({ ...formData, foodDetails: details })}
          />
        );
      case 'errands':
        return (
          <ErrandDetailsForm
            details={formData.errandDetails || DEFAULT_ERRAND_DETAILS}
            onChange={(details) => setFormData({ ...formData, errandDetails: details })}
          />
        );
      default:
        return null;
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
              {step === 3 && 'Service Details'}
              {step === 4 && 'Confirm & Book'}
            </h1>
            <p className="text-xs text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3, 4].map((s) => (
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
          <ServiceSelector 
            selected={formData.serviceType} 
            onSelect={handleServiceSelect} 
          />
        )}

        {/* Step 2: Locations */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Selected Service Badge */}
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <span className="text-2xl">{selectedService?.icon}</span>
              <div>
                <p className="font-medium text-foreground">{selectedService?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedService?.description}</p>
              </div>
            </div>

            {/* Schedule Selector */}
            <ScheduleSelector
              timing={formData.timing}
              scheduledDate={formData.scheduledDate}
              scheduledTime={formData.scheduledTime}
              onTimingChange={(timing) => setFormData({ ...formData, timing })}
              onScheduleChange={(date, time) => setFormData({ 
                ...formData, 
                scheduledDate: date, 
                scheduledTime: time 
              })}
            />

            {/* Pickup Location */}
            <div className="space-y-3">
              <SavedAddresses
                addresses={[]}
                onSelect={(addr) => setFormData({
                  ...formData,
                  pickupAddress: addr.address,
                  pickupCoords: { lat: addr.lat, lng: addr.lng },
                })}
              />
              
              <div className="bg-card rounded-xl border border-border p-4">
                <Label className="text-xs text-muted-foreground mb-2 block">PICKUP LOCATION</Label>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                  <AddressAutocomplete
                    value={formData.pickupAddress}
                    onChange={(address, coords) => setFormData({ 
                      ...formData, 
                      pickupAddress: address,
                      pickupCoords: coords || null
                    })}
                    placeholder="Enter pickup address"
                    icon="pickup"
                    className="border-0 shadow-none flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Multi-stop Dropoffs */}
            <MultiStopInput
              stops={formData.dropoffs}
              onChange={(dropoffs) => setFormData({ ...formData, dropoffs })}
              maxStops={3}
            />

            {/* Package Description */}
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
              onClick={() => setStep(3)}
              className="w-full gradient-hero text-white shadow-glow"
              disabled={!formData.pickupAddress || !formData.dropoffs[0]?.address}
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 3: Service Details */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Selected Service Badge */}
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <span className="text-2xl">{selectedService?.icon}</span>
              <div>
                <p className="font-medium text-foreground">{selectedService?.name}</p>
                <p className="text-xs text-muted-foreground">Configure your delivery</p>
              </div>
            </div>
            
            {/* Service-specific form */}
            {renderServiceDetails()}
            
            {/* If no specific form, show general description */}
            {!['packages', 'documents', 'food', 'errands'].includes(formData.serviceType) && (
              <div className="p-4 bg-card rounded-xl border border-border">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any special instructions for the rider..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-2"
                  rows={4}
                />
              </div>
            )}

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
        )}

        {/* Step 4: Confirm */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Route Summary */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{selectedService?.icon}</span>
                  <div>
                    <p className="font-semibold text-foreground">{selectedService?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {estimate.distance} km • {estimate.duration}
                      {formData.dropoffs.length > 1 && ` • ${formData.dropoffs.length} stops`}
                    </p>
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
                {formData.dropoffs.map((stop, i) => (
                  <div key={stop.id} className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-coral mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {formData.dropoffs.length > 1 ? `STOP ${i + 1}` : 'DROPOFF'}
                      </p>
                      <p className="text-sm font-medium text-foreground">{stop.address}</p>
                      {stop.contactName && (
                        <p className="text-xs text-muted-foreground">
                          {stop.contactName} • {stop.contactPhone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
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
                <span className="text-muted-foreground">Distance ({estimate.distance} km)</span>
                <span className="text-foreground">GH₵ {estimate.distanceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service fee</span>
                <span className="text-foreground">GH₵ {estimate.serviceFee.toFixed(2)}</span>
              </div>
              {estimate.insuranceFee && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Insurance (2%)</span>
                  <span className="text-foreground">GH₵ {estimate.insuranceFee.toFixed(2)}</span>
                </div>
              )}
              {estimate.surgeMultiplier > 1 && (
                <div className="flex justify-between text-sm text-warning">
                  <span>Surge ({estimate.surgeMultiplier.toFixed(1)}×)</span>
                  <span>
                    +GH₵ {((estimate.baseFee + estimate.distanceFee + estimate.serviceFee) * (estimate.surgeMultiplier - 1)).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-xl text-primary">GH₵ {estimate.fee.toFixed(2)}</span>
              </div>
              
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
                  Find Rider • GH₵ {estimate.fee.toFixed(2)}
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
