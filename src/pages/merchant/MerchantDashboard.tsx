import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/context/CountryContext';
import BottomNav from '@/components/layout/BottomNav';
import {
  Store, Package, ShoppingCart, DollarSign, TrendingUp, Users, Bell, Plus, ArrowRight, BarChart3, Sparkles, Clock, CheckCircle2,
} from 'lucide-react';
import owlLogo from '@/assets/speedup-owl-logo.png';

const MerchantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { formatPrice } = useCountry();
  const [store, setStore] = useState<any>(null);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalProducts: 0, pendingOrders: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (profile.role !== 'merchant') {
      navigate('/');
      return;
    }
    fetchMerchantData();
  }, [profile]);

  const fetchMerchantData = async () => {
    if (!profile) return;
    setLoading(true);

    // Fetch merchant's store
    const { data: storeData } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', profile.id)
      .maybeSingle();

    setStore(storeData);

    if (storeData) {
      // Fetch product count
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeData.id);

      // Fetch orders for this store
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
        .limit(10);

      const totalRevenue = orders?.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.subtotal || 0), 0) || 0;
      const pendingOrders = orders?.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length || 0;

      setStats({
        totalOrders: orders?.length || 0,
        totalRevenue,
        totalProducts: productCount || 0,
        pendingOrders,
      });
      setRecentOrders(orders?.slice(0, 5) || []);
    }

    setLoading(false);
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready_for_pickup: 'bg-green-100 text-green-800',
      picked_up: 'bg-indigo-100 text-indigo-800',
      out_for_delivery: 'bg-purple-100 text-purple-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return map[status] || 'bg-muted text-muted-foreground';
  };

  if (!profile || profile.role !== 'merchant') return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={owlLogo} alt="SpeedUp" className="w-10 h-10" />
            <div>
              <h1 className="text-lg font-bold">Merchant Portal</h1>
              <p className="text-xs opacity-80">{profile.full_name}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => navigate('/merchant/notifications')}>
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {!store && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <Store className="w-10 h-10 mx-auto mb-2 text-white" />
              <p className="text-white font-semibold mb-2">Set Up Your Store</p>
              <p className="text-white/70 text-sm mb-3">Create your store to start receiving orders</p>
              <Button className="bg-white text-primary hover:bg-white/90" onClick={() => navigate('/merchant/store')}>
                <Plus className="w-4 h-4 mr-2" /> Create Store
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="p-4 space-y-6">
        {store && (
          <>
            {/* Store Quick Info */}
            <Card className="border-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="w-10 h-10 rounded-lg object-contain" />
                  ) : (
                    <Store className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="font-bold text-foreground">{store.name}</h2>
                  <p className="text-xs text-muted-foreground">{store.category} • {store.city}</p>
                </div>
                <Badge variant={store.is_active ? 'default' : 'secondary'}>
                  {store.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ShoppingCart, label: 'Orders', value: stats.totalOrders, color: 'text-blue-600 bg-blue-100' },
                { icon: DollarSign, label: 'Revenue', value: formatPrice(stats.totalRevenue), color: 'text-green-600 bg-green-100' },
                { icon: Package, label: 'Products', value: stats.totalProducts, color: 'text-purple-600 bg-purple-100' },
                { icon: Clock, label: 'Pending', value: stats.pendingOrders, color: 'text-orange-600 bg-orange-100' },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Package, label: 'Products', path: '/merchant/products', desc: 'Manage catalog' },
                { icon: ShoppingCart, label: 'Orders', path: '/merchant/orders', desc: 'View & manage' },
                { icon: BarChart3, label: 'Finance', path: '/merchant/finance', desc: 'Revenue & payouts' },
                { icon: Sparkles, label: 'AI Tools', path: '/merchant/ai', desc: 'Smart insights' },
                { icon: Users, label: 'Customers', path: '/merchant/customers', desc: 'Customer data' },
                { icon: Store, label: 'Store', path: '/merchant/store', desc: 'Store settings' },
              ].map((action) => (
                <Card key={action.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(action.path)}>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <action.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{action.label}</p>
                      <p className="text-[10px] text-muted-foreground">{action.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Orders</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/merchant/orders')}>
                      View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{order.order_number || order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{formatPrice(order.subtotal)}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(order.status)}`}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MerchantDashboard;
