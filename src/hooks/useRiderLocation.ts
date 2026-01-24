import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';

type RiderLocation = Database['public']['Tables']['rider_locations']['Row'];

export const useRiderLocation = (riderId: string) => {
  const [realtimeLocation, setRealtimeLocation] = useState<RiderLocation | null>(null);

  const query = useQuery({
    queryKey: ['rider-location', riderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rider_locations')
        .select('*')
        .eq('rider_id', riderId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as RiderLocation | null;
    },
    enabled: !!riderId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!riderId) return;

    const channel = supabase
      .channel(`rider-location-${riderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rider_locations',
          filter: `rider_id=eq.${riderId}`,
        },
        (payload) => {
          if (payload.new) {
            setRealtimeLocation(payload.new as RiderLocation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [riderId]);

  return {
    ...query,
    data: realtimeLocation || query.data,
  };
};

export const useUpdateRiderLocation = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (location: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      is_online?: boolean;
    }) => {
      if (!profile) throw new Error('Not authenticated');

      const { data: existing } = await supabase
        .from('rider_locations')
        .select('id')
        .eq('rider_id', profile.id)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('rider_locations')
          .update(location)
          .eq('rider_id', profile.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('rider_locations')
          .insert({
            rider_id: profile.id,
            ...location,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-location'] });
    },
  });
};

export const useOnlineRiders = () => {
  const [riders, setRiders] = useState<RiderLocation[]>([]);

  const query = useQuery({
    queryKey: ['online-riders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rider_locations')
        .select('*, profiles(*)')
        .eq('is_online', true);

      if (error) throw error;
      return data;
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('online-riders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rider_locations',
        },
        () => {
          query.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [query]);

  return query;
};
