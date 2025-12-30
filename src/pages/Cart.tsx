import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from '@/components/layout/BottomNav';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

const Cart: React.FC = () => {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
          <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-bold">My Cart</h1>
          </div>
        </header>

        <main className="flex flex-col items-center justify-center px-8 py-20 max-w-lg mx-auto">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Start adding laundry services to your cart
          </p>
          <Link to="/">
            <Button variant="hero" size="lg">
              Browse Services
            </Button>
          </Link>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-36">
      <header className="sticky top-0 z-40 gradient-glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">My Cart ({totalItems})</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {items.map((item) => {
          const price = (item.service.pricePerKg || 25) * item.quantity;
          
          return (
            <div
              key={item.service.id}
              className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 shadow-card"
            >
              <img
                src={item.service.image}
                alt={item.service.name}
                className="w-20 h-20 rounded-xl object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=200&q=80`;
                }}
              />
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{item.service.name}</h3>
                    <p className="text-xs text-muted-foreground">{item.service.deliveryTime}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.service.id)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.service.id, item.quantity - 1)}
                      className={cn(
                        'w-8 h-8 rounded-full border border-border flex items-center justify-center transition-colors',
                        'hover:border-primary hover:text-primary'
                      )}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.service.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full gradient-hero text-primary-foreground flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-bold text-primary">GH₵ {price}</p>
                </div>

                {item.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-2 py-1">
                    Note: {item.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Checkout Footer */}
      <div className="fixed bottom-16 left-0 right-0 p-4 gradient-glass border-t border-border/50">
        <div className="max-w-lg mx-auto space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-semibold">GH₵ {totalPrice}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Delivery Fee</span>
            <span className="font-semibold text-success">Free</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-bold text-primary">GH₵ {totalPrice}</span>
          </div>
          <Link to="/checkout">
            <Button variant="hero" size="xl" className="w-full">
              Proceed to Checkout
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Cart;
