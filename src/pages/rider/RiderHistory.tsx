import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Clock, MapPin, ChevronRight, Filter, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

type FilterPeriod = 'today' | 'week' | 'month' | 'all';

const RiderHistory: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<FilterPeriod>('week');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['rider-history', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores(name, logo_url),
          customer:profiles!orders_customer_id_fkey(full_name, phone)
        `)
        .eq('rider_id', profile.id)
        .in('status', ['delivered', 'cancelled'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile,
  });

  const getFilteredOrders = () => {
    if (!orders) return [];
    
    const now = new Date();
    return orders.filter((order) => {
      const orderDate = new Date(order.created_at);
      switch (filter) {
        case 'today':
          return format(orderDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        case 'week':
          return isWithinInterval(orderDate, { start: subDays(now, 7), end: now });
        case 'month':
          return isWithinInterval(orderDate, { start: subDays(now, 30), end: now });
        default:
          return true;
      }
    });
  };

  const filteredOrders = getFilteredOrders();
  
  const stats = {
    total: filteredOrders.length,
    delivered: filteredOrders.filter((o) => o.status === 'delivered').length,
    cancelled: filteredOrders.filter((o) => o.status === 'cancelled').length,
    earnings: filteredOrders
      .filter((o) => o.status === 'delivered')
      .reduce((sum, o) => sum + (Number(o.delivery_fee) || 0), 0),
  };

  const formatCurrency = (value: number) => `GH₵ ${value.toFixed(2)}`;

  const filterOptions: { label: string; value: FilterPeriod }[] = [
    { label: 'Today', value: 'today' },
    { label: '7 Days', value: 'week' },
    { label: '30 Days', value: 'month' },
    { label: 'All Time', value: 'all' },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 p-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Delivery History</h1>
            <p className="text-sm text-muted-foreground">{stats.total} deliveries</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                filter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {/* Stats Summary */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-success/10 rounded-xl p-4">
            <p className="text-2xl font-bold text-success">{stats.delivered}</p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-4">
            <p className="text-2xl font-bold text-primary">{formatCurrency(stats.earnings)}</p>
            <p className="text-sm text-muted-foreground">Earned</p>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No deliveries yet</h3>
            <p className="text-sm text-muted-foreground">
              Your delivery history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/track/${order.order_number}`)}
                className="w-full bg-card rounded-xl p-4 text-left border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {(order as any).stores?.name || 'Pickup Order'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Order #{order.order_number}
                    </p>
                  </div>
                  <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    order.status === 'delivered' 
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  )}>
                    {order.status === 'delivered' ? 'Completed' : 'Cancelled'}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{order.delivery_address}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                  </div>
                  {order.status === 'delivered' && (
                    <span className="font-bold text-success">
                      +{formatCurrency(Number(order.delivery_fee) || 0)}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RiderHistory;