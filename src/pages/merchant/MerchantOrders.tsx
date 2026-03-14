import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/context/CountryContext';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import {
  ArrowLeft, Loader2, ShoppingCart, Clock, CheckCircle2, Truck, XCircle, Package, MapPin, Phone,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'New Order', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
  preparing: { label: 'Preparing', color: 'bg-orange-100 text-orange-800', icon: Package },
  ready_for_pickup: { label: 'Ready', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  picked_up: { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-800', icon: Truck },
  out_for_delivery: { label: 'Delivering', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle },
};

const MerchantOrders: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { formatPrice } = useCountry();
  const [store, setStore] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => {
    if (!profile) return;
    fetchOrders();
  }, [profile]);

  const fetchOrders = async () => {
    if (!profile) return;
    const { data: s } = await supabase.from('stores').select('*').eq('owner_id', profile.id).maybeSingle();
    setStore(s);
    if (s) {
      const { data } = await supabase.from('orders').select('*, profiles!orders_customer_id_fkey(full_name, phone)').eq('store_id', s.id).order('created_at', { ascending: false });
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus as any }).eq('id', orderId);
    if (error) {
      toast.error('Failed to update order');
    } else {
      toast.success(`Order ${newStatus.replace(/_/g, ' ')}`);
      fetchOrders();
    }
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));
  const displayOrders = tab === 'active' ? activeOrders : completedOrders;

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
          <h1 className="text-lg font-bold">Orders</h1>
          <Badge variant="outline" className="ml-auto">{activeOrders.length} active</Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="completed">History ({completedOrders.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        {displayOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">{tab === 'active' ? 'No active orders' : 'No order history'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayOrders.map((order) => {
              const config = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = config.icon;
              const customer = order.profiles;

              return (
                <Card key={order.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-foreground">{order.order_number || `#${order.id.slice(0, 8)}`}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold flex items-center gap-1 ${config.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {config.label}
                      </span>
                    </div>

                    {customer && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-3 h-3" />
                        <span>{customer.full_name}</span>
                        {customer.phone && <span>• {customer.phone}</span>}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{order.delivery_address}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="text-lg font-bold text-foreground">{formatPrice(order.subtotal)}</p>
                        <p className="text-xs text-muted-foreground">
                          Payment: <span className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>{order.payment_status}</span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus(order.id, 'cancelled')}>Reject</Button>
                            <Button size="sm" onClick={() => updateStatus(order.id, 'confirmed')}>Accept</Button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <Button size="sm" onClick={() => updateStatus(order.id, 'preparing')}>Start Preparing</Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button size="sm" onClick={() => updateStatus(order.id, 'ready_for_pickup')}>Mark Ready</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MerchantOrders;
