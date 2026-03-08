import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Navigation, ChevronRight, Loader2, Zap, Clock } from 'lucide-react';
import { serviceCategories } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';
import { 
  BookingFormData, 
  PackageDetails, 
  FoodDetails, 
  ErrandDetails,
} from '@/types/booking';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';

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

const BookDelivery: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get('service') as ServiceType | null;
  const { profile } = useAuth();
  const createOrder = useCreateOrder();
  
  const [step, setStep] = useState(preselectedService ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const selectedService = serviceCategories.find(s => s.id === formData.serviceType);

  const handleServiceSelect = (serviceId: ServiceType) => {
    setFormData({ ...formData, serviceType: serviceId });
    setStep(2);
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

  const handlePostDelivery = async () => {
    if (!profile) {
      toast.error('Please log in to book a delivery');
      navigate('/auth');
      return;
    }

    const firstDropoff = formData.dropoffs[0];
    if (!formData.pickupAddress || !firstDropoff?.address) {
      toast.error('Please enter pickup and dropoff locations');
      return;
    }
    if (!formData.pickupCoords || !firstDropoff?.coords) {
      toast.error('Please select addresses from the suggestions');
      return;
    }
    if (!formData.contactPhone?.trim()) {
      toast.error('Please enter your phone number so the rider can reach you');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate distance for reference
      const distance = calculateDistance(
        formData.pickupCoords.lat, formData.pickupCoords.lng,
        firstDropoff.coords.lat, firstDropoff.coords.lng
      );

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

      // Post order with NO fixed delivery fee — riders will bid
      const orderData = {
        store_id: null as any,
        items: [{
          product_id: null as any,
          product_name: `${selectedService?.name || 'Delivery'} Request`,
          quantity: 1,
          unit_price: 0,
        }],
        delivery_address: firstDropoff.address,
        delivery_lat: firstDropoff.coords?.lat,
        delivery_lng: firstDropoff.coords?.lng,
        pickup_address: formData.pickupAddress,
        pickup_lat: formData.pickupCoords?.lat,
        pickup_lng: formData.pickupCoords?.lng,
        notes: `📞 ${formData.contactPhone?.trim() || ''}${notes.trim() ? ' | ' + notes.trim() : ''}`,
        delivery_fee: 0, // Riders will bid their price
        distance_km: Math.round(distance * 10) / 10,
        base_fee: 0,
        per_km_fee: 0,
        service_fee: 0,
        rider_fee: 0,
        surge_multiplier: 1,
        payment_status: 'pending',
      };

      const order = await createOrder.mutateAsync(orderData);
      
      toast.success('Delivery posted! Waiting for rider bids.');
      navigate(`/customer/track/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to post delivery. Please try again.');
    } finally {
      setIsSubmitting(false);
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
              {step === 4 && 'Review & Post'}
            </h1>
            <p className="text-xs text-muted-foreground">Step {step} of 4</p>
          </div>
        </div>
        
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
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <span className="text-2xl">{selectedService?.icon}</span>
              <div>
                <p className="font-medium text-foreground">{selectedService?.name}</p>
                <p className="text-xs text-muted-foreground">{selectedService?.description}</p>
              </div>
            </div>

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

            <MultiStopInput
              stops={formData.dropoffs}
              onChange={(dropoffs) => setFormData({ ...formData, dropoffs })}
              maxStops={3}
            />

            <div>
              <Label>Your Phone Number <span className="text-destructive">*</span></Label>
              <Input
                type="tel"
                placeholder="e.g. 0241234567"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">Rider will use this to contact you</p>
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
            <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
              <span className="text-2xl">{selectedService?.icon}</span>
              <div>
                <p className="font-medium text-foreground">{selectedService?.name}</p>
                <p className="text-xs text-muted-foreground">Configure your delivery</p>
              </div>
            </div>
            
            {renderServiceDetails()}
            
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
              onClick={() => setStep(4)}
              className="w-full gradient-hero text-white shadow-glow"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 4: Review & Post — No fixed fee, riders will bid */}
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
                      {formData.dropoffs.length > 1 && `${formData.dropoffs.length} stops • `}
                      {formData.timing === 'asap' ? 'ASAP Delivery' : 'Scheduled'}
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
                    <MapPin className="w-4 h-4 text-destructive mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {formData.dropoffs.length > 1 ? `STOP ${i + 1}` : 'DROPOFF'}
                      </p>
                      <p className="text-sm font-medium text-foreground">{stop.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {formData.description && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">NOTES</p>
                <p className="text-sm text-foreground">{formData.description}</p>
              </div>
            )}

            {/* How it works */}
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">1</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Post your delivery</p>
                    <p className="text-xs text-muted-foreground">Your request is visible to all online riders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">2</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Riders bid their price</p>
                    <p className="text-xs text-muted-foreground">Compare bids and chat with riders</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">3</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Accept a bid & ride starts</p>
                    <p className="text-xs text-muted-foreground">Pay only after delivery is complete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Post Button */}
            <Button 
              onClick={handlePostDelivery}
              disabled={isSubmitting}
              className="w-full h-14 gradient-hero text-white shadow-glow text-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Posting delivery...
                </>
              ) : (
                <>
                  <Navigation className="w-5 h-5 mr-2" />
                  Post Delivery
                </>
              )}
            </Button>

            <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              No payment required until delivery is complete
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookDelivery;
