import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

export const useProducts = (storeId: string) => {
  return useQuery({
    queryKey: ['products', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_available', true)
        .order('is_popular', { ascending: false })
        .order('name');

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!storeId,
  });
};

export const useProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, stores(*)')
        .eq('id', productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId,
  });
};

export const usePopularProducts = (storeId?: string) => {
  return useQuery({
    queryKey: ['products', 'popular', storeId],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, stores(*)')
        .eq('is_available', true)
        .eq('is_popular', true)
        .order('rating', { ascending: false })
        .limit(10);

      if (storeId) {
        query = query.eq('store_id', storeId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
  });
};
