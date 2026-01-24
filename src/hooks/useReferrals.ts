import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

type Referral = Database['public']['Tables']['referrals']['Row'];

export const useReferralCode = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['referral-code', profile?.id],
    queryFn: async () => {
      if (!profile) return null;

      const { data, error } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', profile.id)
        .is('referred_id', null)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.referral_code || null;
    },
    enabled: !!profile,
  });
};

export const useReferralStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['referral-stats', profile?.id],
    queryFn: async () => {
      if (!profile) return { totalReferrals: 0, totalEarnings: 0 };

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .eq('is_used', true);

      if (error) throw error;

      const totalReferrals = data?.length || 0;
      const totalEarnings = data?.reduce((sum, r) => sum + (r.bonus_amount || 0), 0) || 0;

      return { totalReferrals, totalEarnings };
    },
    enabled: !!profile,
  });
};
