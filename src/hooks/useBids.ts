import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

// Fetch bids for an order (customer view)
export const useOrderBids = (orderId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`bids-${orderId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bids',
        filter: `order_id=eq.${orderId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['order-bids', orderId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [orderId, queryClient]);

  return useQuery({
    queryKey: ['order-bids', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          profiles:rider_id(id, full_name, phone, avatar_url, vehicle_type)
        `)
        .eq('order_id', orderId)
        .eq('status', 'pending')
        .order('amount', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 5000,
  });
};

// Create a bid (rider)
export const useCreateBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, riderId, amount, message }: {
      orderId: string;
      riderId: string;
      amount: number;
      message?: string;
    }) => {
      const { data, error } = await supabase
        .from('bids')
        .insert({
          order_id: orderId,
          rider_id: riderId,
          amount,
          message: message || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-pending-orders'] });
    },
  });
};

// Accept a bid (customer)
export const useAcceptBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bidId, orderId, riderId, amount }: {
      bidId: string;
      orderId: string;
      riderId: string;
      amount: number;
    }) => {
      // Accept the bid
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', bidId);

      if (bidError) throw bidError;

      // Reject all other bids
      await supabase
        .from('bids')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('order_id', orderId)
        .neq('id', bidId);

      // Assign rider to order with the bid amount as delivery fee
      const { data, error } = await supabase
        .from('orders')
        .update({
          rider_id: riderId,
          delivery_fee: amount,
          total: amount,
          status: 'confirmed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .is('rider_id', null)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Order already has a rider assigned');
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-bids'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['rider-pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['rider-active-orders'] });
    },
  });
};

// Get rider's own bids
export const useMyBids = (riderId: string) => {
  return useQuery({
    queryKey: ['my-bids', riderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          orders(id, order_number, pickup_address, delivery_address, status)
        `)
        .eq('rider_id', riderId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!riderId,
  });
};
