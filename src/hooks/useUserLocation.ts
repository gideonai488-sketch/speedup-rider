import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentPosition, requestPermissions } from '@/lib/nativeGeolocation';

interface UserLocation {
  city: string | null;
  region: string | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  setManualCity: (city: string) => void;
  isManual: boolean;
}

// Map of Ghana regions/cities for better matching
const GHANA_CITIES = [
  'Accra', 'Tema', 'Kumasi', 'Tamale', 'Takoradi', 'Sekondi',
  'Cape Coast', 'Koforidua', 'Sunyani', 'Ho', 'Bolgatanga',
  'Wa', 'Techiman', 'Obuasi', 'Teshie', 'Madina', 'Ashaiman',
  'Nungua', 'Kasoa', 'Aflao', 'Hohoe', 'Keta', 'Kpando',
  'Winneba', 'Nsawam', 'Swedru', 'Agona', 'Axim', 'Elmina',
  'Prestea', 'Tarkwa', 'Dunkwa', 'Nkawkaw', 'Mpraeso', 'Akim Oda',
  'Suhum', 'Kibi', 'Akwatia', 'Asamankese', 'Berekum', 'Dormaa',
  'Wenchi', 'Goaso', 'Mampong', 'Ejura', 'Konongo', 'Agogo',
  'Bekwai', 'Juaben', 'Bawku', 'Navrongo', 'Zebilla', 'Damongo',
  'Yendi', 'Salaga', 'Bimbilla', 'Kintampo', 'Atebubu', 'Yeji',
  'East Legon', 'Ejisu', 'Nalerigu', 'Sefwi Wiawso', 'Dambai'
];

const extractCityFromContext = (context: any[] | undefined, placeName: string): string | null => {
  if (!context) return null;

  for (const ctx of context) {
    if (ctx.id?.startsWith('place.') || ctx.id?.startsWith('locality.')) {
      const cityName = ctx.text;
      const matchedCity = GHANA_CITIES.find(
        c => cityName?.toLowerCase().includes(c.toLowerCase()) ||
             c.toLowerCase().includes(cityName?.toLowerCase())
      );
      if (matchedCity) return matchedCity;
      return cityName;
    }
  }

  for (const city of GHANA_CITIES) {
    if (placeName?.toLowerCase().includes(city.toLowerCase())) {
      return city;
    }
  }

  for (const ctx of context) {
    if (ctx.id?.startsWith('region.')) {
      const region = ctx.text?.toLowerCase();
      if (region?.includes('greater accra')) return 'Accra';
      if (region?.includes('ashanti')) return 'Kumasi';
      if (region?.includes('western')) return 'Takoradi';
      if (region?.includes('central')) return 'Cape Coast';
      if (region?.includes('eastern')) return 'Koforidua';
      if (region?.includes('volta') || region?.includes('oti')) return 'Ho';
      if (region?.includes('northern')) return 'Tamale';
      if (region?.includes('upper east')) return 'Bolgatanga';
      if (region?.includes('upper west')) return 'Wa';
      if (region?.includes('bono') || region?.includes('ahafo')) return 'Sunyani';
      if (region?.includes('savannah')) return 'Damongo';
      if (region?.includes('north east')) return 'Nalerigu';
    }
  }

  return null;
};

const MANUAL_CITY_KEY = 'user_manual_city';

export const useUserLocation = (): UserLocation => {
  const [city, setCity] = useState<string | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);

  // Check for manual override on mount
  useEffect(() => {
    const manualCity = localStorage.getItem(MANUAL_CITY_KEY);
    if (manualCity) {
      setCity(manualCity);
      setIsManual(true);
      setIsLoading(false);
    }
  }, []);

  const setManualCity = useCallback((newCity: string) => {
    localStorage.setItem(MANUAL_CITY_KEY, newCity);
    sessionStorage.removeItem('user_location');
    setCity(newCity);
    setIsManual(true);
  }, []);

  const detectLocation = useCallback(async () => {
    // Clear manual override when user requests auto-detect
    localStorage.removeItem(MANUAL_CITY_KEY);
    setIsManual(false);
    setIsLoading(true);
    setError(null);

    const cachedLocation = sessionStorage.getItem('user_location');
    if (cachedLocation) {
      try {
        const parsed = JSON.parse(cachedLocation);
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setCity(parsed.city);
          setRegion(parsed.region);
          setCoordinates(parsed.coordinates);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        sessionStorage.removeItem('user_location');
      }
    }

    try {
      const granted = await requestPermissions();
      if (!granted) {
        setError('Location permission denied');
        setCity('Accra');
        setIsLoading(false);
        return;
      }

      const position = await getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 10000,
      });

      const coords = {
        lat: position.latitude,
        lng: position.longitude,
      };
      setCoordinates(coords);

      const { data, error: geocodeError } = await supabase.functions.invoke('mapbox-geocode', {
        body: {
          query: `${coords.lng},${coords.lat}`,
          types: 'place,locality,region',
        },
      });

      if (geocodeError) {
        console.error('Geocode error:', geocodeError);
        throw geocodeError;
      }

      if (data?.features?.[0]) {
        const feature = data.features[0];
        const detectedCity = extractCityFromContext(feature.context, feature.place_name);
        
        let detectedRegion: string | null = null;
        if (feature.context) {
          for (const ctx of feature.context) {
            if (ctx.id?.startsWith('region.')) {
              detectedRegion = ctx.text;
              break;
            }
          }
        }

        setCity(detectedCity || 'Accra');
        setRegion(detectedRegion);

        sessionStorage.setItem('user_location', JSON.stringify({
          city: detectedCity || 'Accra',
          region: detectedRegion,
          coordinates: coords,
          timestamp: Date.now(),
        }));
      } else {
        setCity('Accra');
      }
    } catch (err: any) {
      console.error('Location detection error:', err);
      setError(err?.message || 'Location detection failed');
      setCity('Accra');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only auto-detect if no manual city is set
    const manualCity = localStorage.getItem(MANUAL_CITY_KEY);
    if (!manualCity) {
      detectLocation();
    }
  }, [detectLocation]);

  return {
    city,
    region,
    coordinates,
    isLoading,
    error,
    refetch: detectLocation,
    setManualCity,
    isManual,
  };
};

export default useUserLocation;
