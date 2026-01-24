import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Store = Database['public']['Tables']['stores']['Row'];
type RiderLocation = Database['public']['Tables']['rider_locations']['Row'];

// Fetch all orders for admin
export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          stores(name, logo_url),
          profiles!orders_customer_id_fkey(full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status, riderId }: { 
      orderId: string; 
      status: string; 
      riderId?: string;
    }) => {
      const updateData: any = { status };
      if (riderId) updateData.rider_id = riderId;
      if (status === 'delivered') updateData.delivered_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
};

// Fetch all riders
export const useAdminRiders = () => {
  return useQuery({
    queryKey: ['admin-riders'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'rider');

      if (profilesError) throw profilesError;

      const riderIds = profiles?.map(p => p.id) || [];
      
      if (riderIds.length === 0) return [];

      const { data: locations, error: locationsError } = await supabase
        .from('rider_locations')
        .select('*')
        .in('rider_id', riderIds);

      if (locationsError) throw locationsError;

      // Get delivery counts
      const { data: deliveryCounts, error: countError } = await supabase
        .from('orders')
        .select('rider_id, status')
        .in('rider_id', riderIds);

      if (countError) throw countError;

      return profiles?.map(profile => {
        const location = locations?.find(l => l.rider_id === profile.id);
        const completedDeliveries = deliveryCounts?.filter(
          o => o.rider_id === profile.id && o.status === 'delivered'
        ).length || 0;
        const currentOrders = deliveryCounts?.filter(
          o => o.rider_id === profile.id && !['delivered', 'cancelled'].includes(o.status)
        ).length || 0;

        return {
          ...profile,
          location,
          completedDeliveries,
          currentOrders,
          isOnline: location?.is_online || false,
        };
      });
    },
  });
};

// Fetch all users
export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get order counts and spending per user
      const { data: orders } = await supabase
        .from('orders')
        .select('customer_id, total, status');

      return profiles?.map(profile => {
        const userOrders = orders?.filter(o => o.customer_id === profile.id) || [];
        const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const orderCount = userOrders.length;

        return {
          ...profile,
          totalSpent,
          orderCount,
        };
      });
    },
  });
};

// Fetch all stores
export const useAdminStores = () => {
  return useQuery({
    queryKey: ['admin-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select(`
          *,
          products(*)
        `)
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

// Update store
export const useUpdateStore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, updates }: { 
      storeId: string; 
      updates: Partial<Store>;
    }) => {
      const { data, error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', storeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stores'] });
    },
  });
};

// Analytics data
export const useAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Get orders for analytics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      // Get online riders count
      const { data: onlineRiders } = await supabase
        .from('rider_locations')
        .select('rider_id')
        .eq('is_online', true);

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const deliveredOrders = orders?.filter(o => o.status === 'delivered') || [];
      const activeRiders = onlineRiders?.length || 0;

      // Average delivery time (mock - would need delivered_at - created_at calculation)
      const avgDeliveryTime = 4.2;

      // Revenue by day (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const revenueByDay = last7Days.map(date => {
        const dayOrders = orders?.filter(o => 
          o.created_at.split('T')[0] === date
        ) || [];
        const revenue = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        return { date, revenue };
      });

      // Orders by status
      const statusCounts: Record<string, number> = {};
      orders?.forEach(o => {
        statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      });

      const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
      }));

      // Top stores by orders
      const { data: stores } = await supabase.from('stores').select('id, name');
      const storeOrderCounts: Record<string, { name: string; orders: number; revenue: number }> = {};
      
      orders?.forEach(o => {
        if (o.store_id) {
          const store = stores?.find(s => s.id === o.store_id);
          if (store) {
            if (!storeOrderCounts[o.store_id]) {
              storeOrderCounts[o.store_id] = { name: store.name, orders: 0, revenue: 0 };
            }
            storeOrderCounts[o.store_id].orders++;
            storeOrderCounts[o.store_id].revenue += Number(o.total) || 0;
          }
        }
      });

      const topServices = Object.values(storeOrderCounts)
        .sort((a, b) => b.orders - a.orders)
        .slice(0, 7);

      return {
        totalRevenue,
        totalOrders,
        activeRiders,
        avgDeliveryTime,
        revenueByDay,
        ordersByStatus,
        topServices,
      };
    },
  });
};

// Pending orders for riders - includes 'pending' status since delivery orders need riders immediately
export const useRiderPendingOrders = () => {
  return useQuery({
    queryKey: ['rider-pending-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          stores(name, address, logo_url),
          profiles!orders_customer_id_fkey(full_name, phone, address)
        `)
        .in('status', ['pending', 'confirmed', 'ready_for_pickup'])
        .is('rider_id', null)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds to get new orders quickly
  });
};

// Accept order as rider
export const useAcceptOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, riderId }: { orderId: string; riderId: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          rider_id: riderId, 
          status: 'picked_up',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['rider-active-orders'] });
    },
  });
};

// Active orders for a rider
export const useRiderActiveOrders = (riderId: string) => {
  return useQuery({
    queryKey: ['rider-active-orders', riderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          stores(name, address)
        `)
        .eq('rider_id', riderId)
        .not('status', 'in', '(delivered,cancelled)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!riderId,
  });
};

// Rider earnings
export const useRiderEarnings = (riderId: string) => {
  return useQuery({
    queryKey: ['rider-earnings', riderId],
    queryFn: async () => {
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'rider_earning');

      if (error) throw error;

      // Get wallet for this rider
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', riderId)
        .maybeSingle();

      // Get completed deliveries today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('rider_id', riderId)
        .eq('status', 'delivered')
        .gte('delivered_at', `${today}T00:00:00`);

      const todayEarnings = (todayOrders?.length || 0) * 15; // GH₵15 per delivery

      return {
        balance: wallet?.balance || 0,
        todayEarnings,
        todayDeliveries: todayOrders?.length || 0,
        transactions: transactions || [],
      };
    },
    enabled: !!riderId,
  });
};

// Pending riders (for approval)
export const usePendingRiders = (status?: string) => {
  return useQuery({
    queryKey: ['pending-riders', status],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'rider')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('rider_status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

// Update rider status
export const useUpdateRiderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ riderId, status }: { riderId: string; status: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ rider_status: status })
        .eq('id', riderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-riders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
    },
  });
};

// Rider delivery stats
export const useRiderDeliveryStats = (riderId: string) => {
  return useQuery({
    queryKey: ['rider-delivery-stats', riderId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStr = weekStart.toISOString();

      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthStr = monthStart.toISOString();

      // Get all delivered orders for this rider
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('rider_id', riderId)
        .eq('status', 'delivered');

      if (error) throw error;

      const todayDeliveries = orders?.filter(o => 
        new Date(o.delivered_at || o.updated_at) >= today
      ).length || 0;

      const weekDeliveries = orders?.filter(o => 
        new Date(o.delivered_at || o.updated_at) >= weekStart
      ).length || 0;

      const totalDeliveries = orders?.length || 0;

      return {
        todayDeliveries,
        weekDeliveries,
        totalDeliveries,
      };
    },
    enabled: !!riderId,
  });
};
