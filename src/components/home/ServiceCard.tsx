import React from 'react';
import { Clock, Plus } from 'lucide-react';
import { LaundryService } from '@/types/laundry';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface ServiceCardProps {
  service: LaundryService;
  onClick?: () => void;
  size?: 'default' | 'large';
}

const tagStyles: Record<string, string> = {
  Popular: 'bg-primary/10 text-primary',
  Express: 'bg-coral/10 text-coral',
  New: 'bg-accent/10 text-accent',
  Eco: 'bg-success/10 text-success',
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, size = 'default' }) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(service);
    toast.success(`${service.name} added to cart`);
  };

  const isLarge = size === 'large';

  return (
    <article
      onClick={onClick}
      className={cn(
        'group relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-card bg-card border border-border/50',
        isLarge ? 'w-64' : 'w-44'
      )}
    >
      {/* Image container */}
      <div className={cn('relative overflow-hidden', isLarge ? 'h-36' : 'h-28')}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-card/80 z-10" />
        <img
          src={service.image}
          alt={service.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&q=80`;
          }}
        />
        
        {/* Tags */}
        {service.tags.length > 0 && (
          <div className="absolute top-2 left-2 z-20 flex gap-1">
            {service.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-semibold backdrop-blur-sm',
                  tagStyles[tag]
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {service.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-primary">{service.priceRange}</p>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{service.deliveryTime}</span>
            </div>
          </div>
          
          <Button
            variant="hero"
            size="icon"
            className="w-8 h-8 rounded-full shadow-md"
            onClick={handleAddToCart}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  );
};

export default ServiceCard;
