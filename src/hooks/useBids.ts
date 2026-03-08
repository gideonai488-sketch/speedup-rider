import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { createNotification } from '@/hooks/useNotifications';

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
      // First get the order to know the subtotal
      const { data: orderData, error: orderFetchError } = await supabase
        .from('orders')
        .select('subtotal')
        .eq('id', orderId)
        .single();

      if (orderFetchError) throw orderFetchError;
      const subtotal = Number(orderData?.subtotal) || 0;

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

      // Send notification to the rider
      await createNotification(
        riderId,
        '🎉 Bid Accepted!',
        `Your bid of GH₵ ${amount.toFixed(2)} has been accepted. Head to the pickup location now!`,
        'bid_accepted',
        { order_id: orderId, bid_id: bidId, amount }
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-bids'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['rider-pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['rider-active-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-bids'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// Get rider's own bids (all statuses)
export const useMyBids = (riderId: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!riderId) return;
    const channel = supabase
      .channel(`my-bids-${riderId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bids',
        filter: `rider_id=eq.${riderId}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['my-bids', riderId] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [riderId, queryClient]);

  return useQuery({
    queryKey: ['my-bids', riderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          orders(id, order_number, pickup_address, delivery_address, status, delivery_fee, stores(name, logo_url))
        `)
        .eq('rider_id', riderId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!riderId,
  });
};
