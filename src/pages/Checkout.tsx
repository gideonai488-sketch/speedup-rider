import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Clock, CreditCard, 
  ChevronRight, Check, Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const paymentMethods = [
  { id: 'momo', name: 'Mobile Money', icon: Smartphone, description: 'MTN, Vodafone, AirtelTigo' },
  { id: 'card', name: 'Card Payment', icon: CreditCard, description: 'Visa, Mastercard' },
];

const timeSlots = [
  { id: '1', label: 'Morning', time: '9:00 AM - 12:00 PM' },
  { id: '2', label: 'Afternoon', time: '12:00 PM - 3:00 PM' },
  { id: '3', label: 'Evening', time: '3:00 PM - 6:00 PM' },
];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('momo');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    clearCart();
    toast.success('Order placed successfully!');
    navigate('/orders');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Link to="/">
            <Button variant="hero">Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
          <Link to="/cart">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">Checkout</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-6">
        {/* Delivery Address */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pickup Address
          </h2>
          <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Home</p>
              <p className="text-sm text-muted-foreground">15 Palm Street, East Legon, Accra</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </section>

        {/* Time Slot */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pickup Time
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedTimeSlot(slot.id)}
                className={cn(
                  'p-3 rounded-xl border text-center transition-all duration-300',
                  selectedTimeSlot === slot.id
                    ? 'gradient-hero text-primary-foreground border-transparent shadow-glow'
                    : 'bg-card border-border/50 hover:border-primary/30'
                )}
              >
                <Clock className={cn(
                  'w-5 h-5 mx-auto mb-1',
                  selectedTimeSlot === slot.id ? 'text-primary-foreground' : 'text-muted-foreground'
                )} />
                <p className="text-xs font-semibold">{slot.label}</p>
                <p className={cn(
                  'text-[10px]',
                  selectedTimeSlot === slot.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {slot.time}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Payment Method */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Payment Method
          </h2>
          <div className="space-y-2">
            {paymentMethods.map(({ id, name, icon: Icon, description }) => (
              <button
                key={id}
                onClick={() => setSelectedPayment(id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300',
                  selectedPayment === id
                    ? 'bg-primary/5 border-primary'
                    : 'bg-card border-border/50 hover:border-primary/30'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center',
                  selectedPayment === id ? 'bg-primary/10' : 'bg-muted'
                )}>
                  <Icon className={cn(
                    'w-6 h-6',
                    selectedPayment === id ? 'text-primary' : 'text-muted-foreground'
                  )} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">{name}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                  selectedPayment === id
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                )}>
                  {selectedPayment === id && <Check className="w-4 h-4 text-primary-foreground" />}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Order Summary */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Order Summary
          </h2>
          <div className="rounded-xl bg-card border border-border/50 p-4 space-y-3">
            {items.map((item) => (
              <div key={item.service.id} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.service.name} x{item.quantity}
                </span>
                <span className="font-medium">
                  GH₵ {(item.service.pricePerKg || 25) * item.quantity}
                </span>
              </div>
            ))}
            <div className="pt-3 border-t border-border/50 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">GH₵ {totalPrice}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span className="font-medium text-success">Free</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-primary">GH₵ {totalPrice}</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Place Order Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 gradient-glass border-t border-border/50">
        <div className="max-w-lg mx-auto">
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              `Place Order • GH₵ ${totalPrice}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
