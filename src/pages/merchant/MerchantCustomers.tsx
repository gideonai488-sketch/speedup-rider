import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/context/CountryContext';
import BottomNav from '@/components/layout/BottomNav';
import { ArrowLeft, Loader2, Users, Search, ShoppingCart, Star } from 'lucide-react';

interface CustomerData {
  id: string;
  name: string;
  phone: string | null;
  orderCount: number;
  totalSpent: number;
  lastOrder: string;
}

const MerchantCustomers: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { formatPrice } = useCountry();
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!profile) return;
    fetchCustomers();
  }, [profile]);

  const fetchCustomers = async () => {
    if (!profile) return;
    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', profile.id).maybeSingle();
    if (!store) { setLoading(false); return; }

    const { data: orders } = await supabase
      .from('orders')
      .select('customer_id, subtotal, created_at, profiles!orders_customer_id_fkey(full_name, phone)')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    if (!orders) { setLoading(false); return; }

    const customerMap = new Map<string, CustomerData>();
    for (const order of orders) {
      const existing = customerMap.get(order.customer_id);
      const p = order.profiles as any;
      if (existing) {
        existing.orderCount++;
        existing.totalSpent += order.subtotal || 0;
      } else {
        customerMap.set(order.customer_id, {
          id: order.customer_id,
          name: p?.full_name || 'Unknown',
          phone: p?.phone || null,
          orderCount: 1,
          totalSpent: order.subtotal || 0,
          lastOrder: order.created_at,
        });
      }
    }

    setCustomers(Array.from(customerMap.values()).sort((a, b) => b.totalSpent - a.totalSpent));
    setLoading(false);
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Customers ({customers.length})</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 mx-auto text-primary mb-1" />
              <p className="text-lg font-bold">{customers.length}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-lg font-bold">{customers.filter(c => c.orderCount >= 3).length}</p>
              <p className="text-[10px] text-muted-foreground">Loyal</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <ShoppingCart className="w-5 h-5 mx-auto text-green-600 mb-1" />
              <p className="text-lg font-bold">{customers.reduce((s, c) => s + c.orderCount, 0)}</p>
              <p className="text-[10px] text-muted-foreground">Orders</p>
            </CardContent>
          </Card>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No customers yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">{customer.name[0]}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{customer.name}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone || 'No phone'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatPrice(customer.totalSpent)}</p>
                    <p className="text-[10px] text-muted-foreground">{customer.orderCount} orders</p>
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

export default MerchantCustomers;
