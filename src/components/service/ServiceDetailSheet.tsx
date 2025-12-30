import React, { useState } from 'react';
import { Clock, Minus, Plus, X, Truck, Shield, Leaf } from 'lucide-react';
import { LaundryService } from '@/types/laundry';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ServiceDetailSheetProps {
  service: LaundryService | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceDetailSheet: React.FC<ServiceDetailSheetProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const { addItem } = useCart();

  if (!service) return null;

  const handleAddToCart = () => {
    addItem(service, quantity, notes);
    toast.success(`${quantity}x ${service.name} added to cart`);
    setQuantity(1);
    setNotes('');
    onClose();
  };

  const price = (service.pricePerKg || 25) * quantity;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 bg-card rounded-t-3xl transition-transform duration-300 ease-out max-h-[90vh] overflow-hidden',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted rounded-full" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="overflow-y-auto max-h-[calc(90vh-60px)] pb-safe">
          {/* Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=800&q=80`;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="px-5 -mt-8 relative space-y-4">
            {/* Tags */}
            <div className="flex gap-2">
              {service.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title & Price */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">{service.name}</h2>
                <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{service.deliveryTime}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary">{service.priceRange}</p>
                {service.pricePerKg && (
                  <p className="text-xs text-muted-foreground">GH₵ {service.pricePerKg}/kg</p>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {service.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: 'Free Pickup' },
                { icon: Shield, label: 'Insured' },
                { icon: Leaf, label: 'Eco-Friendly' },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
              <span className="font-medium text-foreground">Quantity (kg)</span>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-bold w-8 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-full gradient-hero text-primary-foreground flex items-center justify-center"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Special Instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special care instructions..."
                className="w-full h-20 px-4 py-3 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            {/* Add to Cart Button */}
            <div className="sticky bottom-0 pt-4 pb-6 bg-gradient-to-t from-card via-card to-transparent">
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleAddToCart}
              >
                Add to Cart • GH₵ {price}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceDetailSheet;
