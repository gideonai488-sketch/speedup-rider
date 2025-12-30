import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { LaundryService } from '@/types/laundry';
import ServiceCard from './ServiceCard';
import { cn } from '@/lib/utils';

interface ServiceSectionProps {
  title: string;
  subtitle?: string;
  services: LaundryService[];
  onServiceClick?: (service: LaundryService) => void;
  showAll?: boolean;
  variant?: 'default' | 'large';
}

const ServiceSection: React.FC<ServiceSectionProps> = ({
  title,
  subtitle,
  services,
  onServiceClick,
  showAll = true,
  variant = 'default',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 mb-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {showAll && (
          <button className="flex items-center gap-0.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            See all
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex gap-3 overflow-x-auto px-4 pb-2 hide-scrollbar scroll-smooth',
          'snap-x snap-mandatory'
        )}
      >
        {services.map((service, index) => (
          <div
            key={service.id}
            className="snap-start animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <ServiceCard
              service={service}
              onClick={() => onServiceClick?.(service)}
              size={variant === 'large' ? 'large' : 'default'}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServiceSection;
