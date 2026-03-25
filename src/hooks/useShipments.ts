import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface ShipmentRate {
  productName: string;
  productCode: string;
  totalPrice: number;
  currency: string;
  estimatedDeliveryDate: string;
  deliveryDays: number;
}

export interface ServicePoint {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  distance: number;
  openingHours: string;
  services: string[];
}

export interface TrackingEvent {
  timestamp: string;
  location: string;
  description: string;
  statusCode: string;
}

export const useShipmentRates = () => {
  return useMutation({
    mutationFn: async (params: {
      packageWeight: number;
      packageLength: number;
      packageWidth: number;
      packageHeight: number;
      destinationCountry: string;
      destinationCity: string;
      destinationPostalCode?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('dhl-rate-quote', {
        body: params,
      });
      if (error) throw error;
      return data as { success: boolean; products: ShipmentRate[]; source: string };
    },
  });
};

export const useCreateShipment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      shipmentId: string;
      shippingDetails: any;
      selectedRate: ShipmentRate;
      pickupAddress: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('dhl-create-shipment', {
        body: params,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });
};

export const useShipmentTracking = (trackingNumber: string | null) => {
  return useQuery({
    queryKey: ['shipment-tracking', trackingNumber],
    queryFn: async () => {
      if (!trackingNumber) return null;
      const { data, error } = await supabase.functions.invoke('dhl-tracking', {
        body: { trackingNumber },
      });
      if (error) throw error;
      return data as {
        success: boolean;
        status: string;
        statusDescription: string;
        estimatedDelivery: string;
        events: TrackingEvent[];
      };
    },
    enabled: !!trackingNumber,
    refetchInterval: 60000, // Refresh every minute
  });
};

export const useServicePoints = () => {
  return useMutation({
    mutationFn: async (params: { latitude: number; longitude: number; countryCode?: string }) => {
      const { data, error } = await supabase.functions.invoke('dhl-service-points', {
        body: params,
      });
      if (error) throw error;
      return data as { success: boolean; locations: ServicePoint[] };
    },
  });
};

export const useUserShipments = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['shipments', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id,
  });
};
