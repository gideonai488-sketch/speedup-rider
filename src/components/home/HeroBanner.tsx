import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Clock, Truck } from 'lucide-react';

const HeroBanner: React.FC = () => {
  return (
    <section className="relative mx-4 mt-4 rounded-3xl overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 rounded-full blur-xl" />
      
      <div className="relative px-6 py-8 flex flex-col gap-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 w-fit">
          <Sparkles className="w-4 h-4 text-warning" />
          <span className="text-xs font-semibold text-primary-foreground">First Order 20% OFF</span>
        </div>

        {/* Main content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-primary-foreground leading-tight">
            Fresh & Clean{' '}
            <span className="block">Laundry Service</span>
          </h1>
          <p className="text-sm text-primary-foreground/80 max-w-[200px]">
            Professional care for your clothes, delivered to your door
          </p>
        </div>

        {/* CTA */}
        <Button variant="glass" size="lg" className="w-fit mt-2">
          Book Now
        </Button>

        {/* Stats */}
        <div className="flex gap-6 mt-2">
          <div className="flex items-center gap-2 text-primary-foreground/90">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">6hr Express</span>
          </div>
          <div className="flex items-center gap-2 text-primary-foreground/90">
            <Truck className="w-4 h-4" />
            <span className="text-xs font-medium">Free Pickup</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
