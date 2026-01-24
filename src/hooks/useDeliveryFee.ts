import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeeBreakdown {
  baseFee: number;
  distanceFee: number;
  serviceFee: number;
  surgeMultiplier: number;
  totalFee: number;
  distanceKm: number;
  estimatedMinutes: number;
  riderEarnings: number;
  riderFee: number;
}

interface Coordinates {
  lat: number;
  lng: number;
}

export const useDeliveryFee = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  const BASE_FEE = 5; // GH₵ 5 base fee
  const PER_KM_FEE = 2; // GH₵ 2 per km
  const SERVICE_FEE = 2; // GH₵ 2 service fee
  const RIDER_FEE = 5; // Flat GH₵ 5 taken from rider per order

  const calculateFee = useCallback(async (
    pickup: Coordinates,
    dropoff: Coordinates
  ): Promise<FeeBreakdown | null> => {
    setIsCalculating(true);
    setError(null);

    try {
      // Get Mapbox token
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
      if (tokenError) throw tokenError;

      // Calculate route distance using Mapbox Directions API
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?access_token=${tokenData.token}`
      );
      const routeData = await response.json();

      if (!routeData.routes || !routeData.routes[0]) {
        throw new Error('Unable to calculate route');
      }

      const distanceMeters = routeData.routes[0].distance;
      const durationSeconds = routeData.routes[0].duration;
      const distanceKm = distanceMeters / 1000;
      const estimatedMinutes = Math.ceil(durationSeconds / 60);

      // Get surge multiplier from database
      let surgeMultiplier = 1;
      try {
        const { data: surgeData } = await supabase.rpc('get_surge_multiplier');
        if (surgeData) surgeMultiplier = Number(surgeData);
      } catch {
        // Default to 1 if function fails
        surgeMultiplier = 1;
      }

      // Calculate fees
      const distanceFee = distanceKm * PER_KM_FEE;
      const subtotal = BASE_FEE + distanceFee + SERVICE_FEE;
      const totalFee = Math.round(subtotal * surgeMultiplier * 100) / 100;
      
      // Rider gets total minus the flat rider fee
      const riderEarnings = Math.max(0, totalFee - RIDER_FEE);

      const breakdown: FeeBreakdown = {
        baseFee: BASE_FEE,
        distanceFee: Math.round(distanceFee * 100) / 100,
        serviceFee: SERVICE_FEE,
        surgeMultiplier,
        totalFee,
        distanceKm: Math.round(distanceKm * 10) / 10,
        estimatedMinutes,
        riderEarnings: Math.round(riderEarnings * 100) / 100,
        riderFee: RIDER_FEE,
      };

      setFeeBreakdown(breakdown);
      return breakdown;
    } catch (err) {
      console.error('Failed to calculate delivery fee:', err);
      setError('Unable to calculate delivery fee');
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const formatFee = (amount: number) => `GH₵ ${amount.toFixed(2)}`;

  return {
    calculateFee,
    feeBreakdown,
    isCalculating,
    error,
    formatFee,
    SERVICE_FEE,
    RIDER_FEE,
  };
};

export default useDeliveryFee;
