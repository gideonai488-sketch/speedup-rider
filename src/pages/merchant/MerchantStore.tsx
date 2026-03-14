import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import { ArrowLeft, Store, Save, Loader2, Upload, MapPin } from 'lucide-react';

const MerchantStore: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<any>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('food');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [openingHours, setOpeningHours] = useState('8:00 AM - 10:00 PM');
  const [deliveryFee, setDeliveryFee] = useState('10');
  const [deliveryTime, setDeliveryTime] = useState('30-45 min');
  const [minOrder, setMinOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    if (!profile) return;
    fetchStore();
  }, [profile]);

  const fetchStore = async () => {
    if (!profile) return;
    const { data } = await supabase.from('stores').select('*').eq('owner_id', profile.id).maybeSingle();
    if (data) {
      setStore(data);
      setName(data.name);
      setDescription(data.description || '');
      setCategory(data.category);
      setAddress(data.address || '');
      setCity(data.city || profile.city || '');
      setOpeningHours(data.opening_hours || '8:00 AM - 10:00 PM');
      setDeliveryFee(String(data.delivery_fee || 10));
      setDeliveryTime(data.delivery_time || '30-45 min');
      setMinOrder(String(data.min_order || 0));
      setIsActive(data.is_active ?? true);
      setLogoUrl(data.logo_url || '');
    } else {
      setCity(profile.city || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Store name is required');
      return;
    }
    if (!profile) return;
    setSaving(true);

    const storeData = {
      name: name.trim(),
      description: description.trim(),
      category: category as any,
      address,
      city,
      opening_hours: openingHours,
      delivery_fee: parseFloat(deliveryFee) || 10,
      delivery_time: deliveryTime,
      min_order: parseFloat(minOrder) || 0,
      is_active: isActive,
      logo_url: logoUrl || null,
      owner_id: profile.id,
    };

    let error;
    if (store) {
      ({ error } = await supabase.from('stores').update(storeData).eq('id', store.id));
    } else {
      ({ error } = await supabase.from('stores').insert(storeData));
    }

    setSaving(false);
    if (error) {
      toast.error('Failed to save store: ' + error.message);
    } else {
      toast.success(store ? 'Store updated!' : 'Store created successfully!');
      fetchStore();
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/store-logo.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) {
      toast.error('Failed to upload logo');
      return;
    }
    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    toast.success('Logo uploaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">{store ? 'Edit Store' : 'Create Store'}</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Logo */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm font-semibold mb-3 block">Store Logo</Label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Store className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" asChild>
                  <span><Upload className="w-4 h-4 mr-2" /> Upload Logo</span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Store Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="My Awesome Store" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell customers about your store..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">🍔 Food & Restaurant</SelectItem>
                  <SelectItem value="groceries">🛒 Groceries</SelectItem>
                  <SelectItem value="pharmacy">💊 Pharmacy</SelectItem>
                  <SelectItem value="electronics">📱 Electronics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle className="text-base">Location & Hours</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Accra" />
            </div>
            <div className="space-y-2">
              <Label>Opening Hours</Label>
              <Input value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="8:00 AM - 10:00 PM" />
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader><CardTitle className="text-base">Delivery Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Delivery Fee</Label>
                <Input type="number" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Delivery Time</Label>
                <Input value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="30-45 min" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Minimum Order</Label>
              <Input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-semibold">Store Active</Label>
                <p className="text-xs text-muted-foreground">Customers can see and order from your store</p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {store ? 'Save Changes' : 'Create Store'}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default MerchantStore;
