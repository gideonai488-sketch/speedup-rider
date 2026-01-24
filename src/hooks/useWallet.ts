import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

type Wallet = Database['public']['Tables']['wallets']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];

export const useWallet = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['wallet', profile?.id],
    queryFn: async () => {
      if (!profile) return null;

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Wallet | null;
    },
    enabled: !!profile,
  });
};

export const useTransactions = () => {
  const { profile } = useAuth();
  const { data: wallet } = useWallet();

  return useQuery({
    queryKey: ['transactions', wallet?.id],
    queryFn: async () => {
      if (!wallet) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('*, orders(*)')
        .eq('wallet_id', wallet.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as (Transaction & { orders: Database['public']['Tables']['orders']['Row'] | null })[];
    },
    enabled: !!wallet,
  });
};

export const useTopUpWallet = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { data: wallet } = useWallet();

  return useMutation({
    mutationFn: async (amount: number) => {
      if (!wallet || !profile) throw new Error('Wallet not found');

      // Create transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'deposit' as const,
          amount: amount,
          description: 'Wallet Top-up',
        });

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: (wallet.balance || 0) + amount })
        .eq('id', wallet.id);

      if (walletError) throw walletError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

export const usePayWithWallet = () => {
  const queryClient = useQueryClient();
  const { data: wallet } = useWallet();

  return useMutation({
    mutationFn: async ({ amount, orderId, description }: { amount: number; orderId: string; description?: string }) => {
      if (!wallet) throw new Error('Wallet not found');
      if ((wallet.balance || 0) < amount) throw new Error('Insufficient balance');

      // Create transaction
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          wallet_id: wallet.id,
          type: 'order_payment' as const,
          amount: -amount,
          order_id: orderId,
          description: description || 'Order Payment',
        });

      if (txError) throw txError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: (wallet.balance || 0) - amount })
        .eq('id', wallet.id);

      if (walletError) throw walletError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
};

// Rider earnings hook
export const useRiderWallet = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['rider-wallet', profile?.id],
    queryFn: async () => {
      if (!profile) return null;

      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (walletError && walletError.code !== 'PGRST116') throw walletError;
      if (!wallet) return null;

      // Get earnings transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', wallet.id)
        .eq('type', 'rider_earning')
        .order('created_at', { ascending: false });

      if (txError) throw txError;

      // Calculate today's earnings
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEarnings = transactions
        ?.filter(tx => new Date(tx.created_at) >= today)
        .reduce((sum, tx) => sum + tx.amount, 0) || 0;

      // Calculate this week's earnings
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEarnings = transactions
        ?.filter(tx => new Date(tx.created_at) >= weekStart)
        .reduce((sum, tx) => sum + tx.amount, 0) || 0;

      return {
        wallet,
        transactions: transactions || [],
        todayEarnings,
        weekEarnings,
        totalEarnings: wallet.balance || 0,
      };
    },
    enabled: !!profile,
  });
};
