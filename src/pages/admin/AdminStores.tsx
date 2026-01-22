import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { storeDetails, StoreDetail, Product } from '@/data/storeProducts';
import { 
  Search, 
  Plus,
  MoreVertical,
  Store,
  Package,
  Star,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const AdminStores: React.FC = () => {
  const [stores, setStores] = useState<Record<string, StoreDetail>>(storeDetails);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedStore, setSelectedStore] = useState<StoreDetail | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
  });

  const storesList = Object.values(stores);

  const filteredStores = storesList.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || store.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

  const getCategoryBadge = (category: StoreDetail['category']) => {
    const variants = {
      food: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      groceries: 'bg-green-500/10 text-green-500 border-green-500/20',
      electronics: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      pharmacy: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return <Badge className={`${variants[category]} border`}>{category}</Badge>;
  };

  const handleAddProduct = () => {
    if (!selectedStore || !newProduct.name || !newProduct.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const product: Product = {
      id: `${selectedStore.id}-${Date.now()}`,
      name: newProduct.name || '',
      description: newProduct.description || '',
      price: newProduct.price || 0,
      category: newProduct.category || 'General',
      image: newProduct.image || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
      popular: false,
      rating: 0,
      reviews: 0,
    };

    setStores(prev => ({
      ...prev,
      [selectedStore.id]: {
        ...prev[selectedStore.id],
        products: [...prev[selectedStore.id].products, product],
      },
    }));

    setSelectedStore(prev => prev ? {
      ...prev,
      products: [...prev.products, product],
    } : null);

    setNewProduct({ name: '', description: '', price: 0, category: '', image: '' });
    setIsAddProductOpen(false);
    toast.success(`${product.name} added to ${selectedStore.name}`);
  };

  const handleUpdateProduct = () => {
    if (!selectedStore || !editingProduct) return;

    setStores(prev => ({
      ...prev,
      [selectedStore.id]: {
        ...prev[selectedStore.id],
        products: prev[selectedStore.id].products.map(p => 
          p.id === editingProduct.id ? editingProduct : p
        ),
      },
    }));

    setSelectedStore(prev => prev ? {
      ...prev,
      products: prev.products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ),
    } : null);

    setEditingProduct(null);
    toast.success('Product updated successfully');
  };

  const handleDeleteProduct = (productId: string) => {
    if (!selectedStore) return;

    setStores(prev => ({
      ...prev,
      [selectedStore.id]: {
        ...prev[selectedStore.id],
        products: prev[selectedStore.id].products.filter(p => p.id !== productId),
      },
    }));

    setSelectedStore(prev => prev ? {
      ...prev,
      products: prev.products.filter(p => p.id !== productId),
    } : null);

    toast.success('Product deleted');
  };

  const getUniqueCategories = (products: Product[]) => {
    return [...new Set(products.map(p => p.category))];
  };

  return (
    <AdminLayout title="Stores">
      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px] bg-card">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="groceries">Groceries</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="pharmacy">Pharmacy</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">{storesList.length}</p>
            <p className="text-[10px] text-muted-foreground">Total Stores</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-orange-500">{storesList.filter(s => s.category === 'food').length}</p>
            <p className="text-[10px] text-muted-foreground">Food</p>
          </div>
          <div className="bg-green-500/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-500">{storesList.filter(s => s.category === 'groceries').length}</p>
            <p className="text-[10px] text-muted-foreground">Groceries</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-500">
              {storesList.reduce((acc, s) => acc + s.products.length, 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Products</p>
          </div>
        </div>

        {/* Stores List */}
        <div className="space-y-3">
          {filteredStores.map((store) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store)}
              className="w-full text-left bg-card rounded-2xl border border-border/50 overflow-hidden shadow-card hover:shadow-lg transition-all"
            >
              <div className={`h-20 ${store.coverColor} relative`}>
                <img 
                  src={store.logo} 
                  alt={store.name}
                  className="absolute bottom-0 left-4 translate-y-1/2 w-16 h-16 rounded-xl bg-white object-contain p-2 shadow-lg border-2 border-white"
                />
              </div>
              <div className="pt-10 pb-4 px-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-foreground text-lg">{store.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {getCategoryBadge(store.category)}
                      <div className="flex items-center gap-1 text-warning text-xs">
                        <Star className="w-3 h-3 fill-current" />
                        {store.rating}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{store.products.length}</p>
                    <p className="text-[10px] text-muted-foreground">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{store.deliveryTime}</p>
                    <p className="text-[10px] text-muted-foreground">Delivery</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(store.deliveryFee)}</p>
                    <p className="text-[10px] text-muted-foreground">Fee</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No stores found</p>
          </div>
        )}
      </div>

      {/* Store Detail Sheet - Product Management */}
      <Sheet open={!!selectedStore} onOpenChange={() => { setSelectedStore(null); setEditingProduct(null); }}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
          {selectedStore && (
            <>
              <div className={`h-24 ${selectedStore.coverColor} relative`}>
                <img 
                  src={selectedStore.logo} 
                  alt={selectedStore.name}
                  className="absolute bottom-0 left-4 translate-y-1/2 w-20 h-20 rounded-xl bg-white object-contain p-2 shadow-lg border-2 border-white"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white"
                  onClick={() => setSelectedStore(null)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="pt-14 px-4">
                <SheetHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <SheetTitle className="text-xl text-left">{selectedStore.name}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{selectedStore.address}</p>
                    </div>
                    <Button 
                      className="gradient-hero text-primary-foreground"
                      onClick={() => setIsAddProductOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Product
                    </Button>
                  </div>
                </SheetHeader>
              </div>

              <ScrollArea className="h-[calc(90vh-200px)] px-4">
                <div className="space-y-4 pb-8">
                  {/* Store Info */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-primary/10 rounded-xl p-3 text-center">
                      <Package className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-bold text-primary">{selectedStore.products.length}</p>
                      <p className="text-[8px] text-muted-foreground">Products</p>
                    </div>
                    <div className="bg-warning/10 rounded-xl p-3 text-center">
                      <Star className="w-4 h-4 text-warning mx-auto mb-1" />
                      <p className="text-sm font-bold text-warning">{selectedStore.rating}</p>
                      <p className="text-[8px] text-muted-foreground">Rating</p>
                    </div>
                    <div className="bg-success/10 rounded-xl p-3 text-center">
                      <Clock className="w-4 h-4 text-success mx-auto mb-1" />
                      <p className="text-xs font-bold text-success">{selectedStore.deliveryTime}</p>
                      <p className="text-[8px] text-muted-foreground">Delivery</p>
                    </div>
                    <div className="bg-coral/10 rounded-xl p-3 text-center">
                      <DollarSign className="w-4 h-4 text-coral mx-auto mb-1" />
                      <p className="text-sm font-bold text-coral">{selectedStore.minOrder}</p>
                      <p className="text-[8px] text-muted-foreground">Min Order</p>
                    </div>
                  </div>

                  {/* Products by Category */}
                  {getUniqueCategories(selectedStore.products).map(category => (
                    <div key={category}>
                      <h3 className="font-semibold text-foreground mb-3">{category}</h3>
                      <div className="space-y-2">
                        {selectedStore.products
                          .filter(p => p.category === category)
                          .map(product => (
                            <div 
                              key={product.id}
                              className="bg-secondary/30 rounded-xl p-3 flex gap-3"
                            >
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-foreground text-sm">{product.name}</h4>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                                    <p className="text-sm font-bold text-primary mt-1">{formatCurrency(product.price)}</p>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => handleDeleteProduct(product.id)}
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                {product.popular && (
                                  <Badge className="mt-2 bg-warning/10 text-warning text-[10px]">Popular</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}

                  {selectedStore.products.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground text-sm">No products yet</p>
                      <Button 
                        className="mt-4 gradient-hero text-primary-foreground"
                        onClick={() => setIsAddProductOpen(true)}
                      >
                        Add First Product
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product to {selectedStore?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-foreground">Product Name *</label>
              <Input
                placeholder="e.g., Zinger Burger"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea
                placeholder="Product description..."
                value={newProduct.description}
                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1.5"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Price (GH₵) *</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newProduct.price || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Category</label>
                <Input
                  placeholder="e.g., Burgers"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={newProduct.image}
                onChange={(e) => setNewProduct(prev => ({ ...prev, image: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddProductOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1 gradient-hero text-primary-foreground" onClick={handleAddProduct}>
                <Plus className="w-4 h-4 mr-1" /> Add Product
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-foreground">Product Name</label>
                <Input
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground">Price (GH₵)</label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: Number(e.target.value) } : null)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <Input
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct(prev => prev ? { ...prev, category: e.target.value } : null)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Image URL</label>
                <Input
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, image: e.target.value } : null)}
                  className="mt-1.5"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditingProduct(null)}>
                  Cancel
                </Button>
                <Button className="flex-1 gradient-hero text-primary-foreground" onClick={handleUpdateProduct}>
                  <Save className="w-4 h-4 mr-1" /> Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminStores;
