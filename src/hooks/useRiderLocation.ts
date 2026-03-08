import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';
import { watchPosition, requestPermissions } from '@/lib/nativeGeolocation';

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
  const pendingUpdate = useRef(false);

  return useMutation({
    mutationFn: async (location: {
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
      is_online?: boolean;
    }) => {
      if (!profile) throw new Error('Not authenticated');
      
      // Prevent overlapping updates
      if (pendingUpdate.current) return null;
      pendingUpdate.current = true;

      try {
        // Use upsert to avoid race condition between check + insert/update
        const { data, error } = await supabase
          .from('rider_locations')
          .upsert(
            {
              rider_id: profile.id,
              latitude: location.latitude,
              longitude: location.longitude,
              heading: location.heading ?? null,
              speed: location.speed ?? null,
              is_online: location.is_online ?? true,
            },
            { onConflict: 'rider_id' }
          )
          .select()
          .single();

        if (error) throw error;
        return data;
      } finally {
        pendingUpdate.current = false;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-location'] });
    },
    onError: (error) => {
      console.error('Location update failed:', error);
    },
  });
};

export const useOnlineRiders = () => {
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
    refetchInterval: 15000,
  });

  // Subscribe to realtime updates - use stable refetch reference
  const refetchRef = useRef(query.refetch);
  refetchRef.current = query.refetch;

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
          refetchRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Stable deps - refetchRef handles the changing reference

  return query;
};
