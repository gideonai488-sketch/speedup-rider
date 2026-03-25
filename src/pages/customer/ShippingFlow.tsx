import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Package, Globe, MapPin, QrCode, Truck, ChevronRight, Loader2, Star, Clock, Shield, CheckCircle2, Navigation, CreditCard, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useShipmentRates, useCreateShipment, useServicePoints, useShipmentTracking, useUserShipments } from '@/hooks/useShipments';
import type { ShipmentRate, ServicePoint } from '@/hooks/useShipments';
import QRCodeDisplay from '@/components/shipping/QRCodeDisplay';
import { supabase } from '@/integrations/supabase/client';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';

type ShippingStep = 'details' | 'rates' | 'confirm' | 'payment' | 'qrcode' | 'service-points' | 'tracking' | 'my-shipments';

const ShippingFlow: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStep = (searchParams.get('step') as ShippingStep) || 'details';
  const trackParam = searchParams.get('track');
  
  const { profile } = useAuth();
  const ratesMutation = useShipmentRates();
  const createShipmentMutation = useCreateShipment();
  const servicePointsMutation = useServicePoints();
  const { data: shipments } = useUserShipments();

  const [step, setStep] = useState<ShippingStep>(trackParam ? 'tracking' : initialStep);
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Package form
  const [form, setForm] = useState({
    packageWeight: '',
    packageLength: '',
    packageWidth: '',
    packageHeight: '',
    destinationCountry: '',
    destinationCity: '',
    destinationAddress: '',
    destinationPostalCode: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    customsDescription: '',
    declaredValue: '',
    isFragile: false,
    requiresInsurance: false,
  });

  const [selectedRate, setSelectedRate] = useState<ShipmentRate | null>(null);
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [trackingNumber, setTrackingNumber] = useState(trackParam || '');
  const [qrData, setQrData] = useState('');
  const [createdShipmentId, setCreatedShipmentId] = useState('');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');

  const trackingQuery = useShipmentTracking(step === 'tracking' && trackingNumber ? trackingNumber : null);

  const update = (partial: Partial<typeof form>) => setForm({ ...form, ...partial });

  const handleGetRates = async () => {
    if (!form.packageWeight || !form.destinationCountry || !form.destinationCity) {
      toast.error('Please fill in package weight and destination');
      return;
    }
    try {
      const result = await ratesMutation.mutateAsync({
        packageWeight: parseFloat(form.packageWeight),
        packageLength: parseFloat(form.packageLength) || 20,
        packageWidth: parseFloat(form.packageWidth) || 15,
        packageHeight: parseFloat(form.packageHeight) || 10,
        destinationCountry: form.destinationCountry,
        destinationCity: form.destinationCity,
        destinationPostalCode: form.destinationPostalCode,
      });
      if (result.success && result.products.length > 0) {
        setStep('rates');
      } else {
        toast.error('No rates available for this route');
      }
    } catch {
      toast.error('Failed to get rates. Please try again.');
    }
  };

  const handleConfirmShipment = async () => {
    if (!profile || !selectedRate) return;
    if (!form.recipientName || !form.recipientPhone || !form.destinationAddress) {
      toast.error('Please fill in all recipient details');
      return;
    }

    try {
      // Create shipment record in DB first
      const { data: shipment, error } = await supabase
        .from('shipments')
        .insert({
          user_id: profile.id,
          carrier: 'dhl',
          package_weight: parseFloat(form.packageWeight),
          package_length: parseFloat(form.packageLength) || 0,
          package_width: parseFloat(form.packageWidth) || 0,
          package_height: parseFloat(form.packageHeight) || 0,
          is_fragile: form.isFragile,
          customs_description: form.customsDescription,
          declared_value: parseFloat(form.declaredValue) || 0,
          requires_insurance: form.requiresInsurance,
          origin_address: pickupAddress,
          destination_country: form.destinationCountry,
          destination_city: form.destinationCity,
          destination_address: form.destinationAddress,
          destination_postal_code: form.destinationPostalCode,
          recipient_name: form.recipientName,
          recipient_phone: form.recipientPhone,
          recipient_email: form.recipientEmail,
          quoted_rate: selectedRate.totalPrice,
          currency: selectedRate.currency,
          estimated_delivery_date: selectedRate.estimatedDeliveryDate,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Create DHL shipment via edge function
      const result = await createShipmentMutation.mutateAsync({
        shipmentId: (shipment as any).id,
        shippingDetails: form,
        selectedRate,
        pickupAddress,
      });

      if (result.success) {
        setTrackingNumber(result.trackingNumber);
        setQrData(result.qrCodeData || result.trackingNumber);
        setCreatedShipmentId((shipment as any).id);
        setStep('qrcode');
        toast.success('Shipment created! Show the QR code at the DHL drop-off point.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to create shipment');
    }
  };

  const handleFindServicePoints = async () => {
    try {
      const lat = pickupCoords?.lat || 5.6037;
      const lng = pickupCoords?.lng || -0.1870;
      const result = await servicePointsMutation.mutateAsync({ latitude: lat, longitude: lng });
      if (result.success) {
        setServicePoints(result.locations);
        setStep('service-points');
      }
    } catch {
      toast.error('Failed to find service points');
    }
  };

  const stepTitles: Record<ShippingStep, string> = {
    details: 'Ship Internationally',
    rates: 'Choose Rate',
    confirm: 'Review Shipment',
    payment: 'Payment',
    qrcode: 'Your QR Code',
    'service-points': 'DHL Drop-off Points',
    tracking: 'Track Shipment',
    'my-shipments': 'My Shipments',
  };

  const goBack = () => {
    const backMap: Record<ShippingStep, ShippingStep | null> = {
      details: null,
      rates: 'details',
      confirm: 'rates',
      payment: 'confirm',
      qrcode: null,
      'service-points': 'details',
      tracking: 'my-shipments',
      'my-shipments': 'details',
    };
    const prev = backMap[step];
    if (prev) setStep(prev);
    else navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={goBack}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{stepTitles[step]}</h1>
            <p className="text-xs text-muted-foreground">Powered by DHL Express</p>
          </div>
          {step === 'details' && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('my-shipments')}>
                <Package className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setStep('tracking')}>
                <Truck className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-6 pb-24">
        {/* STEP: Details */}
        {step === 'details' && (
          <div className="space-y-6">
            {/* Pickup */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Label className="font-semibold text-foreground">Pickup Location</Label>
              </div>
              <AddressAutocomplete
                value={pickupAddress}
                onChange={(address, coords) => {
                  setPickupAddress(address);
                  setPickupCoords(coords || null);
                }}
                placeholder="Where should rider collect the package?"
                icon="pickup"
              />
            </div>

            {/* Package */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <Label className="font-semibold text-foreground">Package Details</Label>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Weight (kg) *</Label>
                <Input type="number" min={0.1} step={0.1} value={form.packageWeight} onChange={(e) => update({ packageWeight: e.target.value })} placeholder="e.g. 2.5" className="mt-1" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Length (cm)</Label>
                  <Input type="number" value={form.packageLength} onChange={(e) => update({ packageLength: e.target.value })} placeholder="L" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Width (cm)</Label>
                  <Input type="number" value={form.packageWidth} onChange={(e) => update({ packageWidth: e.target.value })} placeholder="W" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Height (cm)</Label>
                  <Input type="number" value={form.packageHeight} onChange={(e) => update({ packageHeight: e.target.value })} placeholder="H" className="mt-1" />
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <Label className="font-semibold text-foreground">Destination *</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Country</Label>
                  <Input value={form.destinationCountry} onChange={(e) => update({ destinationCountry: e.target.value })} placeholder="e.g. US" className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">City</Label>
                  <Input value={form.destinationCity} onChange={(e) => update({ destinationCity: e.target.value })} placeholder="e.g. New York" className="mt-1" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Full Address</Label>
                <Input value={form.destinationAddress} onChange={(e) => update({ destinationAddress: e.target.value })} placeholder="Street, apt, zip" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Postal Code</Label>
                <Input value={form.destinationPostalCode} onChange={(e) => update({ destinationPostalCode: e.target.value })} placeholder="e.g. 10001" className="mt-1" />
              </div>
            </div>

            {/* Recipient */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <Label className="font-semibold text-foreground">Recipient *</Label>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input value={form.recipientName} onChange={(e) => update({ recipientName: e.target.value })} placeholder="Recipient's name" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Phone</Label>
                <Input type="tel" value={form.recipientPhone} onChange={(e) => update({ recipientPhone: e.target.value })} placeholder="+1 234 567 8900" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email (optional)</Label>
                <Input type="email" value={form.recipientEmail} onChange={(e) => update({ recipientEmail: e.target.value })} placeholder="recipient@email.com" className="mt-1" />
              </div>
            </div>

            {/* Customs & Options */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <Label className="font-semibold text-foreground">Customs & Options</Label>
              <div>
                <Label className="text-xs text-muted-foreground">Contents Description *</Label>
                <Textarea value={form.customsDescription} onChange={(e) => update({ customsDescription: e.target.value })} placeholder="e.g. Clothing, electronics..." className="mt-1" rows={2} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Fragile</p>
                  <p className="text-xs text-muted-foreground">Extra care handling</p>
                </div>
                <Switch checked={form.isFragile} onCheckedChange={(v) => update({ isFragile: v })} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-foreground">Insurance</p>
                  <p className="text-xs text-muted-foreground">Protect against loss</p>
                </div>
                <Switch checked={form.requiresInsurance} onCheckedChange={(v) => update({ requiresInsurance: v })} />
              </div>
              {form.requiresInsurance && (
                <div>
                  <Label className="text-xs text-muted-foreground">Declared Value (USD)</Label>
                  <Input type="number" value={form.declaredValue} onChange={(e) => update({ declaredValue: e.target.value })} placeholder="Value in USD" className="mt-1" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button onClick={handleGetRates} disabled={ratesMutation.isPending} className="w-full gradient-hero text-primary-foreground shadow-glow">
                {ratesMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Getting quotes...</> : <>Get Shipping Rates <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
              <Button variant="outline" onClick={handleFindServicePoints} disabled={servicePointsMutation.isPending} className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Find DHL Drop-off Points
              </Button>
            </div>

            {/* How it works */}
            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
              <p className="text-sm font-semibold text-foreground mb-3">📦 How Label-Free Shipping Works</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>1. <strong className="text-foreground">Fill details & get a quote</strong></p>
                <p>2. <strong className="text-foreground">Confirm & get a QR code</strong></p>
                <p>3. <strong className="text-foreground">Rider picks up your package</strong></p>
                <p>4. <strong className="text-foreground">Rider scans QR at DHL point</strong> — label printed on-site</p>
                <p>5. <strong className="text-foreground">DHL ships worldwide</strong> — track in real-time</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Rates */}
        {step === 'rates' && ratesMutation.data && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {form.packageWeight}kg → {form.destinationCity}, {form.destinationCountry}
            </p>
            {ratesMutation.data.products.map((rate) => (
              <button
                key={rate.productCode}
                onClick={() => { setSelectedRate(rate); setStep('confirm'); }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedRate?.productCode === rate.productCode
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">{rate.productName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {rate.deliveryDays} business day{rate.deliveryDays > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">${rate.totalPrice}</p>
                    <p className="text-[10px] text-muted-foreground">{rate.currency}</p>
                  </div>
                </div>
              </button>
            ))}
            {ratesMutation.data.source === 'mock' && (
              <p className="text-[10px] text-center text-muted-foreground">
                💡 Estimated rates — final price confirmed when DHL API is connected
              </p>
            )}
          </div>
        )}

        {/* STEP: Confirm */}
        {step === 'confirm' && selectedRate && (
          <div className="space-y-5">
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <p className="font-semibold text-foreground">Shipment Summary</p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">Service</span>
                <span className="text-foreground font-medium">{selectedRate.productName}</span>
                <span className="text-muted-foreground">Weight</span>
                <span className="text-foreground">{form.packageWeight} kg</span>
                <span className="text-muted-foreground">Destination</span>
                <span className="text-foreground">{form.destinationCity}, {form.destinationCountry}</span>
                <span className="text-muted-foreground">Recipient</span>
                <span className="text-foreground">{form.recipientName}</span>
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-foreground">{selectedRate.deliveryDays} days</span>
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Cost</span>
                <span className="text-2xl font-bold text-primary">${selectedRate.totalPrice}</span>
              </div>
              {form.requiresInsurance && (
                <p className="text-xs text-muted-foreground mt-1">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Insurance included for ${form.declaredValue} declared value
                </p>
              )}
            </div>

            <Button onClick={handleConfirmShipment} disabled={createShipmentMutation.isPending} className="w-full h-14 gradient-hero text-primary-foreground shadow-glow text-lg">
              {createShipmentMutation.isPending ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" />Creating shipment...</>
              ) : (
                <><QrCode className="w-5 h-5 mr-2" />Confirm & Get QR Code</>
              )}
            </Button>
          </div>
        )}

        {/* STEP: QR Code */}
        {step === 'qrcode' && (
          <div className="space-y-6 text-center">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Shipment Created!</h2>
              <p className="text-sm text-muted-foreground">Show this QR code at any DHL Service Point. The label will be printed on-site — no printer needed!</p>
              
              <QRCodeDisplay data={qrData || trackingNumber} size={220} label={trackingNumber} />

              <div className="bg-muted rounded-lg p-3 text-left">
                <p className="text-xs text-muted-foreground">Tracking Number</p>
                <p className="font-mono font-semibold text-foreground">{trackingNumber}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button onClick={() => { setStep('tracking'); }} variant="outline" className="w-full">
                <Truck className="w-4 h-4 mr-2" />
                Track This Shipment
              </Button>
              <Button onClick={handleFindServicePoints} variant="outline" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Find Nearest DHL Drop-off
              </Button>
              <Button onClick={() => navigate('/customer')} className="w-full gradient-hero text-primary-foreground">
                Back to Home
              </Button>
            </div>

            <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 text-left">
              <p className="text-sm font-semibold text-foreground mb-2">📋 Next Steps</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>1. A SpeedUp rider will come pick up your package</p>
                <p>2. Rider takes it to the nearest DHL Service Point</p>
                <p>3. Rider scans the QR code — label is printed automatically</p>
                <p>4. Track your shipment worldwide right here in the app</p>
              </div>
            </div>
          </div>
        )}

        {/* STEP: Service Points */}
        {step === 'service-points' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Nearest DHL drop-off locations where your rider can scan the QR code</p>
            {servicePoints.map((sp) => (
              <div key={sp.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm">{sp.name}</p>
                    <p className="text-xs text-muted-foreground">{sp.address}, {sp.city}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">📍 {sp.distance} km</span>
                      <span className="text-xs text-muted-foreground">🕐 {sp.openingHours}</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {sp.services.map((s) => (
                        <span key={s} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(servicePointsMutation.data as any)?.source === 'mock' && (
              <p className="text-[10px] text-center text-muted-foreground">
                📍 Sample locations — real DHL points shown when API is connected
              </p>
            )}
          </div>
        )}

        {/* STEP: Tracking */}
        {step === 'tracking' && (
          <div className="space-y-5">
            {!trackingNumber && (
              <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                <Label className="font-semibold text-foreground">Enter Tracking Number</Label>
                <div className="flex gap-2">
                  <Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. 1234567890" className="flex-1" />
                  <Button onClick={() => trackingQuery.refetch()} disabled={!trackingNumber}>Track</Button>
                </div>
              </div>
            )}

            {trackingQuery.isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}

            {trackingQuery.data && (
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{trackingQuery.data.statusDescription}</p>
                      <p className="text-xs text-muted-foreground font-mono">{trackingNumber}</p>
                    </div>
                  </div>
                  {trackingQuery.data.estimatedDelivery && (
                    <div className="mt-3 p-2 bg-primary/5 rounded-lg">
                      <p className="text-xs text-muted-foreground">Estimated Delivery</p>
                      <p className="text-sm font-medium text-foreground">
                        {new Date(trackingQuery.data.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="bg-card rounded-xl border border-border p-4">
                  <p className="font-semibold text-foreground mb-4">Tracking History</p>
                  <div className="space-y-0">
                    {trackingQuery.data.events.map((event, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full shrink-0 ${i === 0 ? 'bg-primary' : 'bg-border'}`} />
                          {i < trackingQuery.data!.events.length - 1 && (
                            <div className="w-0.5 h-full bg-border min-h-[40px]" />
                          )}
                        </div>
                        <div className="pb-4">
                          <p className="text-sm font-medium text-foreground">{event.description}</p>
                          <p className="text-xs text-muted-foreground">{event.location}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP: My Shipments */}
        {step === 'my-shipments' && (
          <div className="space-y-4">
            {!shipments?.length ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No shipments yet</p>
                <Button onClick={() => setStep('details')} className="mt-4">
                  Create Your First Shipment
                </Button>
              </div>
            ) : (
              shipments.map((s: any) => (
                <button
                  key={s.id}
                  onClick={() => {
                    if (s.dhl_tracking_number) {
                      setTrackingNumber(s.dhl_tracking_number);
                      setStep('tracking');
                    }
                  }}
                  className="w-full text-left bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-foreground text-sm">
                        → {s.destination_city}, {s.destination_country}
                      </p>
                      <p className="text-xs text-muted-foreground">{s.recipient_name}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {s.dhl_tracking_number || 'Pending...'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        s.status === 'confirmed' ? 'bg-green-500/10 text-green-600' :
                        s.status === 'draft' ? 'bg-muted text-muted-foreground' :
                        'bg-primary/10 text-primary'
                      }`}>
                        {s.status}
                      </span>
                      {s.quoted_rate && (
                        <p className="text-sm font-semibold text-foreground mt-1">${s.quoted_rate}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShippingFlow;
