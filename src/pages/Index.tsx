import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import HeroBanner from '@/components/home/HeroBanner';
import QuickActions from '@/components/home/QuickActions';
import ServiceSection from '@/components/home/ServiceSection';
import PromoCard from '@/components/home/PromoCard';
import ServiceDetailSheet from '@/components/service/ServiceDetailSheet';
import { laundryServices } from '@/data/services';
import { LaundryService } from '@/types/laundry';

const Index: React.FC = () => {
  const [selectedService, setSelectedService] = useState<LaundryService | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleServiceClick = (service: LaundryService) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  const popularServices = laundryServices.filter((s) => s.tags.includes('Popular'));
  const expressServices = laundryServices.filter((s) => s.tags.includes('Express') || s.deliveryTime.includes('6'));
  const newServices = laundryServices.filter((s) => s.tags.includes('New'));

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="max-w-lg mx-auto">
        <HeroBanner />
        
        <QuickActions />
        
        <ServiceSection
          title="Popular Services"
          subtitle="Most booked by customers"
          services={popularServices}
          onServiceClick={handleServiceClick}
          variant="large"
        />
        
        <PromoCard />
        
        <ServiceSection
          title="Express Delivery"
          subtitle="Get it done in 6 hours"
          services={expressServices}
          onServiceClick={handleServiceClick}
        />
        
        <ServiceSection
          title="New & Trending"
          subtitle="Try our latest services"
          services={newServices}
          onServiceClick={handleServiceClick}
        />
        
        <ServiceSection
          title="All Services"
          services={laundryServices}
          onServiceClick={handleServiceClick}
          showAll={false}
        />
      </main>

      <ServiceDetailSheet
        service={selectedService}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />

      <BottomNav />
    </div>
  );
};

export default Index;
