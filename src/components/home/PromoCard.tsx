import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PromoCard: React.FC = () => {
  return (
    <section className="mx-4 my-4">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-accent to-primary p-5">
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full" />
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-primary-foreground">
              Subscribe & Save
            </h3>
            <p className="text-sm text-primary-foreground/80 max-w-[180px]">
              Get 30% off on weekly laundry plans
            </p>
            <Button variant="glass" size="sm" className="mt-2">
              Learn More
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="text-4xl font-bold text-primary-foreground/20">
            30%
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoCard;
