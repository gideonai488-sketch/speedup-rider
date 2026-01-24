import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Locate } from 'lucide-react';

interface UberStyleMapProps {
  riderLocation?: { lat: number; lng: number; heading?: number };
  destinationLocation: { lat: number; lng: number };
  eta?: number;
  currentStreet?: string;
  isMoving?: boolean;
  showRecenterButton?: boolean;
}

export interface UberStyleMapRef {
  recenterToRider: () => void;
}

const UberStyleMap = forwardRef<UberStyleMapRef, UberStyleMapProps>(({
  riderLocation,
  destinationLocation,
  eta = 15,
  currentStreet = 'En route',
  isMoving = true,
  showRecenterButton = true,
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);

  const recenterToRider = useCallback(() => {
    if (map.current && riderLocation) {
      map.current.flyTo({
        center: [riderLocation.lng, riderLocation.lat],
        zoom: 16,
        duration: 1000,
      });
    }
  }, [riderLocation]);

  useImperativeHandle(ref, () => ({
    recenterToRider,
  }), [recenterToRider]);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        setMapboxToken(data.token);
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError('Map unavailable');
      }
    };
    fetchToken();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const centerLat = riderLocation?.lat || destinationLocation.lat;
    const centerLng = riderLocation?.lng || destinationLocation.lng;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [centerLng, centerLat],
      zoom: 15,
      pitch: 0,
      bearing: 0,
    });

    // Add destination marker (customer location) - Green pin
    const destEl = document.createElement('div');
    destEl.innerHTML = `
      <div style="width: 32px; height: 32px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(16,185,129,0.4);">
        <div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
      </div>
    `;
    new mapboxgl.Marker({ element: destEl })
      .setLngLat([destinationLocation.lng, destinationLocation.lat])
      .addTo(map.current);

    // Add rider marker - Animated motorcycle rider
    if (riderLocation) {
      const riderEl = document.createElement('div');
      riderEl.className = 'rider-marker-uber';
      riderEl.innerHTML = `
        <style>
          @keyframes riderPulse {
            0%, 100% { box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
            50% { box-shadow: 0 4px 20px rgba(249, 115, 22, 0.6), 0 0 30px rgba(249, 115, 22, 0.3); }
          }
          @keyframes riderBounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .rider-marker-container {
            animation: riderPulse 2s ease-in-out infinite;
          }
          .rider-icon {
            animation: riderBounce 1s ease-in-out infinite;
          }
        </style>
        <div class="rider-marker-container" style="width: 52px; height: 52px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white;">
          <div class="rider-icon" style="display: flex; flex-direction: column; align-items: center;">
            <!-- Rider on motorcycle -->
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <!-- Motorcycle wheels -->
              <circle cx="5" cy="18" r="3" fill="none"/>
              <circle cx="19" cy="18" r="3" fill="none"/>
              <!-- Motorcycle body -->
              <path d="M5 18h2l1-3h8l1 3h2"/>
              <path d="M8 15l2-4h4l1 2"/>
              <!-- Rider body -->
              <circle cx="12" cy="6" r="2" fill="white"/>
              <path d="M12 8v3"/>
              <path d="M10 10l2 1 2-1"/>
              <!-- Helmet -->
              <path d="M10 5.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5" fill="white"/>
            </svg>
          </div>
        </div>
        <!-- Direction indicator -->
        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 10px solid #ea580c;"></div>
      `;
      riderMarker.current = new mapboxgl.Marker({ element: riderEl, rotationAlignment: 'map' })
        .setLngLat([riderLocation.lng, riderLocation.lat])
        .addTo(map.current);
    }

    // Fetch and display route
    map.current.on('load', async () => {
      if (!map.current) return;

      const bounds = new mapboxgl.LngLatBounds();
      if (riderLocation) bounds.extend([riderLocation.lng, riderLocation.lat]);
      bounds.extend([destinationLocation.lng, destinationLocation.lat]);

      try {
        map.current.fitBounds(bounds, {
          padding: { top: 60, bottom: 100, left: 30, right: 30 },
          maxZoom: 16,
        });
      } catch (e) {
        // Fallback if bounds fitting fails
        console.warn('Could not fit bounds, centering on destination');
        map.current.setCenter([destinationLocation.lng, destinationLocation.lat]);
        map.current.setZoom(14);
      }

      // Fetch route between rider and customer
      if (riderLocation) {
        try {
          const waypoints = `${riderLocation.lng},${riderLocation.lat};${destinationLocation.lng},${destinationLocation.lat}`;

          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${mapboxToken}`
          );
          const data = await response.json();

          if (data.routes && data.routes[0] && map.current) {
            // Store distance for display
            setRouteDistance(data.routes[0].distance / 1000);

            // Remove existing route if present
            if (map.current.getSource('route')) {
              if (map.current.getLayer('route')) {
                map.current.removeLayer('route');
              }
              map.current.removeSource('route');
            }

            map.current.addSource('route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry,
              },
            });

            // Route line - dark like Uber
            map.current.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round',
                'line-cap': 'round',
              },
              paint: {
                'line-color': '#1a1a1a',
                'line-width': 5,
                'line-opacity': 0.9,
              },
            });
          }
        } catch (err) {
          console.error('Failed to fetch route:', err);
        }
      }
    });

    return () => {
      if (map.current) {
        // Clean up layers and sources before removing map
        if (map.current.getLayer('route')) {
          map.current.removeLayer('route');
        }
        if (map.current.getSource('route')) {
          map.current.removeSource('route');
        }
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken, destinationLocation]);

  // Update rider position smoothly
  useEffect(() => {
    if (riderMarker.current && riderLocation && map.current) {
      riderMarker.current.setLngLat([riderLocation.lng, riderLocation.lat]);

      // Update rider heading
      const el = riderMarker.current.getElement();
      if (el && riderLocation.heading) {
        const innerDiv = el.querySelector('div');
        if (innerDiv) {
          (innerDiv as HTMLElement).style.transform = `rotate(${riderLocation.heading}deg)`;
        }
      }
    }
  }, [riderLocation]);

  if (error) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapContainer} 
        className="w-full h-full"
      />

      {/* Recenter Button */}
      {showRecenterButton && riderLocation && (
        <button
          onClick={recenterToRider}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-card rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
          aria-label="Recenter to rider"
        >
          <Locate className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* ETA Bubble - Uber style */}
      {riderLocation && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-full z-10">
          <div className="bg-card rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            <div>
              <p className="text-lg font-bold text-foreground">{eta} mins</p>
              <p className="text-xs text-muted-foreground">{currentStreet}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          {/* Arrow pointing down */}
          <div className="absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-card" />
        </div>
      )}

      {/* Current status overlay */}
      {isMoving && riderLocation && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-card rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">DRIVING</p>
            <p className="text-sm font-semibold text-foreground">{currentStreet}</p>
          </div>
        </div>
      )}
    </div>
  );
});

UberStyleMap.displayName = 'UberStyleMap';

export default UberStyleMap;
