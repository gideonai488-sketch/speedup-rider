import { useQuery } from '@tanstack/react-query';
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
