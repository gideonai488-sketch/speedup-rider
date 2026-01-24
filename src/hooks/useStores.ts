import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Store = Database['public']['Tables']['stores']['Row'];
type StoreCategory = Database['public']['Enums']['store_category'];

export const useStores = (category?: StoreCategory) => {
  return useQuery({
    queryKey: ['stores', category],
    queryFn: async () => {
      let query = supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Store[];
    },
  });
};

export const useStore = (storeId: string) => {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single();

      if (error) throw error;
      return data as Store;
    },
    enabled: !!storeId,
  });
};

export const useFeaturedStores = () => {
  return useQuery({
    queryKey: ['stores', 'featured'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data as Store[];
    },
  });
};
