import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type Store = Database['public']['Tables']['stores']['Row'] & { city?: string | null };
type StoreCategory = Database['public']['Enums']['store_category'];

interface UseStoresOptions {
  category?: StoreCategory;
  city?: string | null;
}

export const useStores = (options?: UseStoresOptions) => {
  const { category, city } = options || {};
  
  return useQuery({
    queryKey: ['stores', category, city],
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

      // Filter by city if provided
      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Store[];
    },
  });
};

// Hook to get stores by city with fallback to all stores if none in city
export const useStoresByCity = (city: string | null, category?: StoreCategory) => {
  return useQuery({
    queryKey: ['stores-by-city', city, category],
    queryFn: async () => {
      // First try to get stores in the user's city
      let query = supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      if (city) {
        query = query.eq('city', city);
      }

      const { data, error } = await query;

      if (error) throw error;

      // If no stores in user's city, return all stores
      if ((!data || data.length === 0) && city) {
        const fallbackQuery = supabase
          .from('stores')
          .select('*')
          .eq('is_active', true)
          .order('is_featured', { ascending: false })
          .order('rating', { ascending: false });

        if (category) {
          fallbackQuery.eq('category', category);
        }

        const { data: allStores, error: fallbackError } = await fallbackQuery;
        if (fallbackError) throw fallbackError;
        return { stores: allStores as Store[], isFiltered: false, city: null };
      }

      return { stores: data as Store[], isFiltered: !!city, city };
    },
    enabled: city !== undefined,
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
        .maybeSingle();

      if (error) throw error;
      return data as Store | null;
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
