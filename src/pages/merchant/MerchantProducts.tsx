import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/context/CountryContext';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import { ArrowLeft, Plus, Package, Search, Edit2, Trash2, Loader2, Star, Upload, Image } from 'lucide-react';

const MerchantProducts: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { formatPrice } = useCountry();
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pImageUrl, setPImageUrl] = useState('');
  const [pIsPopular, setPIsPopular] = useState(false);
  const [pIsAvailable, setPIsAvailable] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchData();
  }, [profile]);

  const fetchData = async () => {
    if (!profile) return;
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', profile.id).maybeSingle();
    setStore(s);
    if (s) {
      const { data: p } = await supabase.from('products').select('*').eq('store_id', s.id).order('created_at', { ascending: false });
      setProducts(p || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setPName(''); setPDesc(''); setPPrice(''); setPImageUrl(''); setPIsPopular(false); setPIsAvailable(true);
    setEditProduct(null);
  };

  const openEdit = (product: any) => {
    setEditProduct(product);
    setPName(product.name);
    setPDesc(product.description || '');
    setPPrice(String(product.price));
    setPImageUrl(product.image_url || '');
    setPIsPopular(product.is_popular || false);
    setPIsAvailable(product.is_available ?? true);
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!pName.trim() || !pPrice) {
      toast.error('Name and price are required');
      return;
    }
    if (!store) {
      toast.error('Create a store first');
      return;
    }
    setSaving(true);

    const productData = {
      name: pName.trim(),
      description: pDesc.trim() || null,
      price: parseFloat(pPrice),
      image_url: pImageUrl || null,
      is_popular: pIsPopular,
      is_available: pIsAvailable,
      store_id: store.id,
    };

    let error;
    if (editProduct) {
      ({ error } = await supabase.from('products').update(productData).eq('id', editProduct.id));
    } else {
      ({ error } = await supabase.from('products').insert(productData));
    }

    setSaving(false);
    if (error) {
      toast.error('Failed: ' + error.message);
    } else {
      toast.success(editProduct ? 'Product updated!' : 'Product added!');
      setShowDialog(false);
      resetForm();
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Product deleted');
      fetchData();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/products/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) {
      toast.error('Upload failed');
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    setPImageUrl(data.publicUrl);
    toast.success('Image uploaded!');
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center gap-4 pb-20">
        <Package className="w-16 h-16 text-muted-foreground" />
        <p className="text-muted-foreground">Create a store first to manage products</p>
        <Button onClick={() => navigate('/merchant/store')}>Create Store</Button>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold">Products ({products.length})</h1>
          </div>
          <Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="Jollof Rice" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="Describe your product..." rows={2} />
                </div>
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input type="number" value={pPrice} onChange={(e) => setPPrice(e.target.value)} placeholder="25.00" />
                </div>
                <div className="space-y-2">
                  <Label>Product Image</Label>
                  <div className="flex gap-3 items-center">
                    {pImageUrl && <img src={pImageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />}
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span><Upload className="w-4 h-4 mr-1" /> Upload</span>
                      </Button>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                  <Input value={pImageUrl} onChange={(e) => setPImageUrl(e.target.value)} placeholder="Or paste image URL" className="mt-2" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Mark as Popular</Label>
                  <Switch checked={pIsPopular} onCheckedChange={setPIsPopular} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Available</Label>
                  <Switch checked={pIsAvailable} onCheckedChange={setPIsAvailable} />
                </div>
                <Button className="w-full" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {editProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No products yet. Add your first product!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
                      {product.is_popular && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                    </div>
                    <p className="text-sm font-bold text-primary">{formatPrice(product.price)}</p>
                    <Badge variant={product.is_available ? 'default' : 'secondary'} className="text-[10px]">
                      {product.is_available ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(product)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MerchantProducts;
