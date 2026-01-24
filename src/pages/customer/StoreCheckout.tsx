import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, MapPin, Store, Clock, Loader2, 
  ShoppingBag, CreditCard, Smartphone, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/hooks/useStores';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import useDeliveryFee from '@/hooks/useDeliveryFee';
import { cn } from '@/lib/utils';

interface CartItemData {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

const paymentMethods = [
  { id: 'momo', name: 'Mobile Money', icon: Smartphone, description: 'MTN, Vodafone, AirtelTigo' },
  { id: 'card', name: 'Card Payment', icon: CreditCard, description: 'Visa, Mastercard' },
];

const StoreCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const createOrder = useCreateOrder();
  const { calculateFee, isCalculating } = useDeliveryFee();

  const storeId = searchParams.get('store');
  const itemsParam = searchParams.get('items');
  
  const { data: store, isLoading: storeLoading } = useStore(storeId || '');
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('momo');
  
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [notes, setNotes] = useState('');
  
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState('');

  // Parse cart items from URL
  const cartItems: CartItemData[] = React.useMemo(() => {
    if (!itemsParam) return [];
    try {
      return JSON.parse(decodeURIComponent(itemsParam));
    } catch {
      return [];
    }
  }, [itemsParam]);

  const itemsTotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const total = itemsTotal + deliveryFee;

  // Redirect if no store or items
  useEffect(() => {
    if (!storeId || cartItems.length === 0) {
      toast.error('Invalid checkout. Please try again.');
      navigate('/customer');
    }
  }, [storeId, cartItems, navigate]);

  // Default store location (Accra center) - stores don't have lat/lng in DB
  const defaultStoreCoords = { lat: 5.6037, lng: -0.1870 };

  // Calculate delivery fee when address is selected
  const handleAddressSelect = async (address: string, coords?: { lat: number; lng: number }) => {
    setDeliveryAddress(address);
    setDeliveryCoords(coords || null);

    if (coords && store) {
      const breakdown = await calculateFee(
        defaultStoreCoords,
        coords
      );
      
      if (breakdown) {
        setDeliveryFee(breakdown.totalFee);
        setEstimatedTime(`${breakdown.estimatedMinutes} mins`);
      } else {
        // Fallback to store's default delivery fee
        setDeliveryFee(store.delivery_fee || 5);
        setEstimatedTime('25-35 mins');
      }
    }
  };

  const handleContinue = () => {
    if (!deliveryAddress || !deliveryCoords) {
      toast.error('Please enter your delivery address');
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!profile) {
      toast.error('Please log in to place an order');
      navigate('/auth');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        store_id: storeId,
        items: cartItems,
        delivery_address: deliveryAddress,
        delivery_lat: deliveryCoords?.lat,
        delivery_lng: deliveryCoords?.lng,
        pickup_address: store?.address || `${store?.name} Store`,
        pickup_lat: defaultStoreCoords.lat,
        pickup_lng: defaultStoreCoords.lng,
        notes: notes || undefined,
        delivery_fee: deliveryFee,
        payment_status: 'pending',
      };

      const order = await createOrder.mutateAsync(orderData);
      
      toast.success('Order placed successfully!');
      navigate(`/customer/track/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
      setIsProcessing(false);
    }
  };

  if (storeLoading || !store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground">
              {step === 1 ? 'Delivery Address' : 'Confirm Order'}
            </h1>
            <p className="text-xs text-muted-foreground">Step {step} of 2</p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-2 mt-4">
          {[1, 2].map((s) => (
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
        {/* Step 1: Delivery Address */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Store Info Card */}
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={store.name} className="w-8 h-8 object-contain" />
                ) : (
                  <Store className="w-6 h-6 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{store.name}</p>
                <p className="text-xs text-muted-foreground">{cartItems.length} item(s) • GH₵ {itemsTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Pickup Location (Fixed - Store) */}
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center py-4 z-10">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <div className="flex-1 w-0.5 bg-border my-1" />
                  <div className="w-3 h-3 rounded-full bg-coral" />
                </div>
                
                <div className="space-y-3 pl-10">
                  {/* Pickup - Store (Fixed, read-only) */}
                  <div className="bg-muted/50 rounded-xl border border-border p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">PICKUP FROM</Label>
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      <span className="font-medium text-foreground">{store.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{store.address || 'Store location'}</p>
                  </div>
                  
                  {/* Delivery Address (User input) */}
                  <div className="bg-card rounded-xl border border-border p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">DELIVER TO</Label>
                    <AddressAutocomplete
                      value={deliveryAddress}
                      onChange={handleAddressSelect}
                      placeholder="Enter your delivery address"
                      icon="dropoff"
                      className="border-0 shadow-none"
                    />
                    <Input
                      placeholder="Landmark (optional)"
                      value={deliveryLandmark}
                      onChange={(e) => setDeliveryLandmark(e.target.value)}
                      className="border-0 p-0 h-auto text-sm text-muted-foreground focus-visible:ring-0 mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Estimate */}
              {deliveryFee > 0 && (
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-xl border border-success/20">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-success" />
                    <span className="text-sm text-foreground">Estimated delivery</span>
                  </div>
                  <span className="font-medium text-success">{estimatedTime}</span>
                </div>
              )}

              {/* Special Instructions */}
              <div>
                <Label>Special Instructions (optional)</Label>
                <Textarea
                  placeholder="E.g., Extra ketchup, no onions, ring doorbell..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleContinue}
                className="w-full gradient-hero text-white shadow-glow"
                disabled={!deliveryAddress || isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Calculating delivery...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirm & Pay */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Order from {store.name}</p>
                  <p className="text-xs text-muted-foreground">{cartItems.length} item(s)</p>
                </div>
              </div>
              
              <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.quantity}× {item.product_name}
                    </span>
                    <span className="text-muted-foreground">
                      GH₵ {(item.unit_price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Store className="w-4 h-4 text-primary mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">PICKUP</p>
                  <p className="text-sm font-medium text-foreground">{store.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-coral mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">DELIVER TO</p>
                  <p className="text-sm font-medium text-foreground">{deliveryAddress}</p>
                </div>
              </div>
              {estimatedTime && (
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-success" />
                  <span className="text-sm text-success font-medium">{estimatedTime}</span>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Payment Method</Label>
              <div className="grid gap-3">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                      selectedPayment === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-card hover:border-primary/50'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center',
                      selectedPayment === method.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    )}>
                      <method.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">GH₵ {itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery fee</span>
                <span className="text-foreground">GH₵ {deliveryFee.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-xl text-primary">GH₵ {total.toFixed(2)}</span>
              </div>
              
              {/* Pay after delivery note */}
              <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Pay after delivery</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Footer for Step 2 */}
      {step === 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4">
          <Button 
            onClick={handlePlaceOrder}
            disabled={isProcessing}
            className="w-full h-14 gradient-hero text-white shadow-glow text-lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Place Order • GH₵ {total.toFixed(2)}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default StoreCheckout;
