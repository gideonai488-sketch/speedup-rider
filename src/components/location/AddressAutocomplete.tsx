import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface AddressResult {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string, coords?: { lat: number; lng: number }) => void;
  placeholder?: string;
  className?: string;
  icon?: 'pickup' | 'dropoff';
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Enter address',
  className,
  icon = 'pickup',
}) => {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AddressResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get user's current location for proximity bias
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(`${position.coords.longitude},${position.coords.latitude}`);
        },
        () => {
          // Default to Accra center if geolocation fails
          setUserLocation('-0.1870,5.6037');
        }
      );
    }
  }, []);

  // Sync external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddresses = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mapbox-geocode', {
        body: {
          query: searchQuery,
          proximity: userLocation,
        },
      });

      if (error) {
        console.error('Geocoding error:', error);
        setResults([]);
        return;
      }

      setResults(data.features || []);
    } catch (err) {
      console.error('Failed to search addresses:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setShowSuggestions(true);

    // Debounce API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddresses(newValue);
    }, 300);
  };

  const handleSelectAddress = (result: AddressResult) => {
    setQuery(result.place_name);
    onChange(result.place_name, {
      lng: result.center[0],
      lat: result.center[1],
    });
    setShowSuggestions(false);
    setResults([]);
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // Reverse geocode to get address
            const { data, error } = await supabase.functions.invoke('mapbox-geocode', {
              body: {
                query: `${position.coords.longitude},${position.coords.latitude}`,
                types: 'address,poi,place',
              },
            });

            if (data?.features?.[0]) {
              const result = data.features[0];
              setQuery(result.place_name);
              onChange(result.place_name, {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            }
          } catch (err) {
            console.error('Reverse geocoding failed:', err);
          } finally {
            setIsLoading(false);
            setShowSuggestions(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsLoading(false);
        }
      );
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
          icon === 'pickup' ? 'text-primary' : 'text-coral'
        )} />
        <Input
          ref={inputRef}
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", className)}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Current Location Option */}
          <button
            onClick={handleUseCurrentLocation}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Use current location</span>
          </button>

          {/* Search Results */}
          {results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleSelectAddress(result)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{result.text}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.place_name}</p>
                </div>
              </button>
            ))
          ) : query.length >= 2 && !isLoading ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              No addresses found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
