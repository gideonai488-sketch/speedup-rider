import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface UserStats {
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  walletBalance: number;
  pendingOrders: number;
}

export const useUserStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['user-stats', profile?.id],
    queryFn: async (): Promise<UserStats> => {
      if (!profile?.id) {
        return {
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          walletBalance: 0,
          pendingOrders: 0,
        };
      }

      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id, total, status')
        .eq('customer_id', profile.id);

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
      }

      // Fetch wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', profile.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') {
        console.error('Error fetching wallet:', walletError);
      }

      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
      const pendingOrders = orders?.filter(o => 
        !['delivered', 'cancelled'].includes(o.status)
      ).length || 0;

      // Calculate loyalty points (1 point per GH₵ spent)
      const loyaltyPoints = Math.floor(totalSpent);

      return {
        totalOrders,
        totalSpent,
        loyaltyPoints,
        walletBalance: Number(wallet?.balance || 0),
        pendingOrders,
      };
    },
    enabled: !!profile?.id,
  });
};

export const useUserOrders = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['user-orders', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          stores (name, logo_url),
          order_items (*),
          rider:profiles!orders_rider_id_fkey (full_name, phone)
        `)
        .eq('customer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profile?.id,
  });
};
