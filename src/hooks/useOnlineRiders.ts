import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBrowseOnlineRiders = () => {
  return useQuery({
    queryKey: ['browse-online-riders'],
    queryFn: async () => {
      const { data: locations, error } = await supabase
        .from('rider_locations')
        .select(`
          *,
          profiles:rider_id(id, full_name, phone, avatar_url, vehicle_type, city)
        `)
        .eq('is_online', true);

      if (error) throw error;

      // Get ratings for each rider
      const riderIds = locations?.map(l => l.rider_id) || [];
      let ratingsMap: Record<string, { avg: number; count: number }> = {};
      
      if (riderIds.length > 0) {
        const { data: ratings } = await supabase
          .from('ratings')
          .select('rider_id, rider_rating')
          .in('rider_id', riderIds)
          .not('rider_rating', 'is', null);

        ratings?.forEach(r => {
          if (!ratingsMap[r.rider_id!]) {
            ratingsMap[r.rider_id!] = { avg: 0, count: 0 };
          }
          ratingsMap[r.rider_id!].count++;
          ratingsMap[r.rider_id!].avg += Number(r.rider_rating);
        });

        Object.keys(ratingsMap).forEach(id => {
          ratingsMap[id].avg = ratingsMap[id].avg / ratingsMap[id].count;
        });
      }

      // Get delivery counts
      const { data: deliveryCounts } = await supabase
        .from('orders')
        .select('rider_id')
        .in('rider_id', riderIds)
        .eq('status', 'delivered');

      const countMap: Record<string, number> = {};
      deliveryCounts?.forEach(o => {
        countMap[o.rider_id!] = (countMap[o.rider_id!] || 0) + 1;
      });

      return locations?.map(loc => ({
        ...loc,
        profile: loc.profiles,
        rating: ratingsMap[loc.rider_id]?.avg || 4.5,
        ratingCount: ratingsMap[loc.rider_id]?.count || 0,
        deliveryCount: countMap[loc.rider_id] || 0,
      })) || [];
    },
    refetchInterval: 15000,
  });
};
