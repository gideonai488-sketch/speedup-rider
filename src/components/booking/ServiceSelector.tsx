import React from 'react';
import { serviceCategories } from '@/data/deliveryData';
import { ServiceType } from '@/types/delivery';
import { cn } from '@/lib/utils';

interface ServiceSelectorProps {
  selected: ServiceType | '';
  onSelect: (service: ServiceType) => void;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">What do you need delivered?</p>
      
      <div className="grid grid-cols-2 gap-3">
        {serviceCategories.filter(s => s.id !== 'shipping').map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={cn(
              'flex flex-col items-start p-4 rounded-xl border-2 transition-all text-left',
              selected === service.id
                ? 'border-primary bg-primary/5 shadow-glow'
                : 'border-border bg-card hover:border-primary/50'
            )}
          >
            <span className="text-3xl mb-3">{service.icon}</span>
            <span className="font-semibold text-foreground">{service.name}</span>
            <span className="text-xs text-muted-foreground mt-1">{service.description}</span>
            <span className="text-xs text-primary mt-2">From GH₵ {service.basePrice}</span>
          </button>
        ))}
      </div>

      {/* Full-width Global Shipping button */}
      {serviceCategories.filter(s => s.id === 'shipping').map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service.id)}
          className={cn(
            'flex items-center gap-4 w-full p-4 rounded-xl border-2 transition-all text-left',
            selected === service.id
              ? 'border-primary bg-primary/5 shadow-glow'
              : 'border-border bg-card hover:border-primary/50'
          )}
        >
          <span className="text-3xl">{service.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">{service.name}</span>
              <span className="text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">NEW</span>
            </div>
            <span className="text-xs text-muted-foreground">{service.description}</span>
          </div>
          <span className="text-xs text-primary font-medium whitespace-nowrap">From GH₵ {service.basePrice}</span>
        </button>
      ))}
    </div>
  );
};

export default ServiceSelector;
