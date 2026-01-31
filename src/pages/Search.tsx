import React, { useState } from 'react';
import { Search as SearchIcon, X, SlidersHorizontal, Store } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '@/components/layout/BottomNav';
import { useStores } from '@/hooks/useStores';
import { cn } from '@/lib/utils';
import StoreLogo from '@/components/ui/store-logo';

const categories = [
  { id: 'all', name: 'All' },
  { id: 'food', name: 'Food' },
  { id: 'groceries', name: 'Groceries' },
  { id: 'pharmacy', name: 'Pharmacy' },
  { id: 'electronics', name: 'Electronics' },
];

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  const { data: stores, isLoading } = useStores();

  const filteredStores = stores?.filter((store) => {
    const matchesQuery = store.name.toLowerCase().includes(query.toLowerCase()) ||
      store.description?.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = activeCategory === 'all' || store.category === activeCategory;
    return matchesQuery && matchesCategory;
  }) || [];

  const handleStoreClick = (storeId: string) => {
    navigate(`/customer/store/${storeId}`);
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
              placeholder="Search stores..."
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
          {filteredStores.length} stores found
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredStores.map((store) => (
              <div 
                key={store.id} 
                onClick={() => handleStoreClick(store.id)}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden cursor-pointer hover:shadow-card transition-shadow"
              >
                <div className={cn(
                  'h-20 flex items-center justify-center p-3',
                  store.cover_color || 'bg-primary/10'
                )}>
                  {store.logo_url ? (
                    <StoreLogo 
                      src={store.logo_url} 
                      name={store.name}
                      className="h-12 w-auto"
                    />
                  ) : (
                    <span className="text-white font-bold text-center leading-tight text-sm">
                      {store.name}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm text-foreground line-clamp-1">
                    {store.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {store.delivery_time} • {store.category}
                  </p>
                  {store.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs">⭐</span>
                      <span className="text-xs font-medium">{store.rating}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredStores.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Store className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No stores found</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Search;
