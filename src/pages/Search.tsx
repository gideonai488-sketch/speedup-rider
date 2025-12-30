import React, { useState } from 'react';
import { Search as SearchIcon, X, SlidersHorizontal } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import ServiceCard from '@/components/home/ServiceCard';
import ServiceDetailSheet from '@/components/service/ServiceDetailSheet';
import { laundryServices, categories } from '@/data/services';
import { LaundryService } from '@/types/laundry';
import { cn } from '@/lib/utils';

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedService, setSelectedService] = useState<LaundryService | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredServices = laundryServices.filter((service) => {
    const matchesQuery = service.name.toLowerCase().includes(query.toLowerCase()) ||
      service.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const handleServiceClick = (service: LaundryService) => {
    setSelectedService(service);
    setIsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 gradient-glass border-b border-border/50 px-4 py-3">
        <div className="max-w-lg mx-auto space-y-3">
          {/* Search Input */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full h-12 pl-12 pr-12 rounded-xl bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-12 top-1/2 -translate-y-1/2 p-1"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary/10">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  activeCategory === cat.id
                    ? 'gradient-hero text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4">
        <p className="text-sm text-muted-foreground mb-4">
          {filteredServices.length} services found
        </p>

        <div className="grid grid-cols-2 gap-3">
          {filteredServices.map((service) => (
            <div key={service.id} className="w-full">
              <ServiceCard
                service={service}
                onClick={() => handleServiceClick(service)}
              />
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <SearchIcon className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No services found</p>
          </div>
        )}
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

export default Search;
