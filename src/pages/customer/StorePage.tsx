import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, Star, Clock, MapPin, Search, Plus, Minus, 
  ShoppingBag, Heart, Share2, Info, ChevronRight
} from 'lucide-react';
import { useStore } from '@/hooks/useStores';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

interface CartItem extends Product {
  quantity: number;
}

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([]);

  const { data: store, isLoading: storeLoading } = useStore(storeId || '');
  const { data: products, isLoading: productsLoading } = useProducts(storeId || '');

  // Redirect to auth if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (storeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-56 w-full" />
        <div className="px-4 py-4">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground mb-2">Store not found</h2>
          <Button onClick={() => navigate('/customer')} variant="outline">
            Go back home
          </Button>
        </div>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(products?.map(p => p.category_id || 'Uncategorized') || []))];
  
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory = selectedCategory === 'All' || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const popularProducts = products?.filter(p => p.is_popular) || [];

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => 
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter(item => item.id !== productId);
    });
  };

  const getCartQuantity = (productId: string) => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    const minOrder = store.min_order || 0;
    if (cartTotal < minOrder) {
      toast.error(`Minimum order is GH₵${minOrder}`);
      return;
    }
    
    const cartData = cart.map(item => ({
      product_id: item.id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: Number(item.price),
    }));
    
    navigate(`/customer/store-checkout?store=${store.id}&items=${encodeURIComponent(JSON.stringify(cartData))}`);
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Image */}
      <div className="relative h-56">
        <div className={`absolute inset-0 ${store.cover_color || 'bg-primary'}`}>
          {store.cover_image_url && (
            <img 
              src={store.cover_image_url} 
              alt={store.name}
              className="w-full h-full object-cover opacity-60"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-background/80 backdrop-blur-sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Store Logo */}
        <div className="absolute bottom-4 left-4 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white p-2 shadow-lg flex items-center justify-center">
            {store.logo_url ? (
              <img 
                src={store.logo_url} 
                alt={store.name}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.parentElement!.innerHTML = `<span class="text-2xl font-bold text-gray-800">${store.name.charAt(0)}</span>`;
                }}
              />
            ) : (
              <span className="text-2xl font-bold text-gray-800">{store.name.charAt(0)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{store.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{store.description}</p>
          </div>
          <Button variant="ghost" size="icon">
            <Info className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-medium">{store.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-muted-foreground">({store.reviews_count || 0})</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{store.delivery_time}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[120px]">{store.address}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <Badge variant="secondary" className="gap-1">
            <span>GH₵{store.delivery_fee?.toFixed(0)} delivery</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <span>Min. GH₵{store.min_order?.toFixed(0)}</span>
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={`Search in ${store.name}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-secondary/50"
          />
        </div>
      </div>

      {/* Products */}
      <div className="px-4 py-4">
        {/* Popular Items */}
        {popularProducts.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-foreground mb-3">🔥 Popular Items</h2>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-2">
                {popularProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="flex-shrink-0 w-40 bg-card rounded-xl border border-border overflow-hidden"
                  >
                    <div className="relative h-28">
                      <img 
                        src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                      {getCartQuantity(product.id) > 0 && (
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {getCartQuantity(product.id)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-foreground text-sm truncate">{product.name}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">GH₵{Number(product.price).toFixed(0)}</span>
                        <Button 
                          size="icon" 
                          className="w-7 h-7 rounded-full gradient-hero"
                          onClick={() => addToCart(product)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        {/* All Products Grid */}
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3">All Items</h2>
          
          {productsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No products found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map((product) => {
                const quantity = getCartQuantity(product.id);
                return (
                  <div 
                    key={product.id}
                    className="flex gap-4 p-3 bg-card rounded-xl border border-border"
                  >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                      <img 
                        src={product.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
                      {product.rating && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span>{product.rating}</span>
                          <span>({product.reviews_count})</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary text-lg">GH₵{Number(product.price).toFixed(0)}</span>
                        {quantity > 0 ? (
                          <div className="flex items-center gap-2">
                            <Button 
                              size="icon" 
                              variant="outline"
                              className="w-8 h-8 rounded-full"
                              onClick={() => removeFromCart(product.id)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-6 text-center font-bold">{quantity}</span>
                            <Button 
                              size="icon" 
                              className="w-8 h-8 rounded-full gradient-hero"
                              onClick={() => addToCart(product)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            size="sm"
                            className="gradient-hero text-white"
                            onClick={() => addToCart(product)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-lg border-t border-border">
          <Button 
            className="w-full h-14 gradient-hero text-white shadow-glow text-lg justify-between px-6"
            onClick={handleCheckout}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cartCount} items</span>
            </div>
            <div className="flex items-center gap-2">
              <span>GH₵{(cartTotal + Number(store.delivery_fee || 0)).toFixed(0)}</span>
              <ChevronRight className="w-5 h-5" />
            </div>
          </Button>
          {cartTotal < Number(store.min_order || 0) && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Add GH₵{(Number(store.min_order || 0) - cartTotal).toFixed(0)} more to reach minimum order
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StorePage;
