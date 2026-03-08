import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, MapPin, Store, Loader2, 
  ShoppingBag, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/hooks/useStores';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';

interface CartItemData {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

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

const StoreCheckout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { profile } = useAuth();
  const createOrder = useCreateOrder();

  const storeId = searchParams.get('store');
  const itemsParam = searchParams.get('items');
  
  const { data: store, isLoading: storeLoading } = useStore(storeId || '');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryCoords, setDeliveryCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [deliveryLandmark, setDeliveryLandmark] = useState('');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [notes, setNotes] = useState('');

  const cartItems: CartItemData[] = React.useMemo(() => {
    if (!itemsParam) return [];
    try {
      return JSON.parse(decodeURIComponent(itemsParam));
    } catch {
      return [];
    }
  }, [itemsParam]);

  const itemsTotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  useEffect(() => {
    if (!storeId || cartItems.length === 0) {
      toast.error('Invalid checkout. Please try again.');
      navigate('/customer');
    }
  }, [storeId, cartItems, navigate]);

  const storeCoords = React.useMemo(() => ({
    lat: store?.latitude ?? 5.6037,
    lng: store?.longitude ?? -0.1870
  }), [store?.latitude, store?.longitude]);

  const handleAddressSelect = (address: string, coords?: { lat: number; lng: number }) => {
    setDeliveryAddress(address);
    setDeliveryCoords(coords || null);
  };

  const handlePlaceOrder = async () => {
    if (!profile) {
      toast.error('Please log in to place an order');
      navigate('/auth');
      return;
    }
    if (!deliveryAddress || !deliveryCoords) {
      toast.error('Please enter your delivery address');
      return;
    }
    if (!customerPhone.trim()) {
      toast.error('Please enter your phone number so the rider can reach you');
      return;
    }

    setIsProcessing(true);

    try {
      const distance = calculateDistance(
        storeCoords.lat, storeCoords.lng,
        deliveryCoords.lat, deliveryCoords.lng
      );

      const orderData = {
        store_id: storeId,
        items: cartItems,
        delivery_address: deliveryAddress,
        delivery_lat: deliveryCoords.lat,
        delivery_lng: deliveryCoords.lng,
        pickup_address: store?.address || `${store?.name} Store`,
        pickup_lat: storeCoords.lat,
        pickup_lng: storeCoords.lng,
        notes: `📞 ${customerPhone.trim()}${notes ? ' | ' + notes : ''}`,
        delivery_fee: 0,
        distance_km: Math.round(distance * 10) / 10,
        base_fee: 0,
        per_km_fee: 0,
        service_fee: 0,
        rider_fee: 0,
        surge_multiplier: 1,
        payment_status: 'pending',
      };

      const order = await createOrder.mutateAsync(orderData);
      
      toast.success('Order posted! Waiting for rider bids.');
      navigate(`/customer/track/${order.id}`);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
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
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="font-bold text-foreground">Checkout</h1>
            <p className="text-xs text-muted-foreground">Set delivery address & post for bids</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
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

        {/* Order Items */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Your Items</span>
          </div>
          <div className="p-4 space-y-2">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-foreground">{item.quantity}× {item.product_name}</span>
                <span className="text-muted-foreground">GH₵ {(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold">
              <span>Items Total</span>
              <span className="text-foreground">GH₵ {itemsTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 flex flex-col items-center py-4 z-10">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <div className="flex-1 w-0.5 bg-border my-1" />
              <div className="w-3 h-3 rounded-full bg-success" />
            </div>
            
            <div className="space-y-3 pl-10">
              <div className="bg-muted/50 rounded-xl border border-border p-4">
                <Label className="text-xs text-muted-foreground mb-2 block">PICKUP FROM</Label>
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="font-medium text-foreground">{store.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{store.address || 'Store location'}</p>
              </div>
              
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

          <div>
            <Label>Your Phone Number <span className="text-destructive">*</span></Label>
            <Input
              type="tel"
              placeholder="e.g. 0241234567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">Rider will use this to contact you</p>
          </div>

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
        </div>

        {/* How Bidding Works */}
        <div className="bg-primary/5 rounded-2xl border border-primary/20 p-5 space-y-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            How Delivery Fee Works
          </h3>
          <p className="text-sm text-muted-foreground">
            There's no fixed delivery fee. Once you post your order, nearby riders will bid their price. You choose the best offer!
          </p>
          <div className="flex items-center gap-2 text-xs text-primary font-medium">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            You only pay after delivery is complete
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border p-4">
        <Button 
          onClick={handlePlaceOrder}
          disabled={isProcessing || !deliveryAddress}
          className="w-full h-14 gradient-hero text-white shadow-glow text-lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Posting...
            </>
          ) : (
            <>
              Post Order & Get Bids
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StoreCheckout;
