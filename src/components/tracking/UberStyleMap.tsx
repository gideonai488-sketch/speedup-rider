import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Navigation, ChevronRight } from 'lucide-react';

interface UberStyleMapProps {
  riderLocation?: { lat: number; lng: number; heading?: number };
  destinationLocation: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number };
  eta?: number;
  currentStreet?: string;
  isMoving?: boolean;
}

const UberStyleMap: React.FC<UberStyleMapProps> = ({
  riderLocation,
  destinationLocation,
  pickupLocation,
  eta = 15,
  currentStreet = 'En route',
  isMoving = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeDistance, setRouteDistance] = useState<number | null>(null);

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

    // Add pickup marker if provided - Blue pin
    if (pickupLocation) {
      const pickupEl = document.createElement('div');
      pickupEl.innerHTML = `
        <div style="width: 28px; height: 28px; background: #3b82f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(59,130,246,0.4);">
          <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
        </div>
      `;
      new mapboxgl.Marker({ element: pickupEl })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .addTo(map.current);
    }

    // Add rider marker - Uber-style car icon
    if (riderLocation) {
      const riderEl = document.createElement('div');
      riderEl.className = 'rider-marker-uber';
      riderEl.innerHTML = `
        <div style="width: 44px; height: 44px; background: #1a1a1a; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transform: rotate(${riderLocation.heading || 0}deg);">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M12 2L4 12l8 10 8-10L12 2z"/>
          </svg>
        </div>
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
      if (pickupLocation) bounds.extend([pickupLocation.lng, pickupLocation.lat]);

      map.current.fitBounds(bounds, {
        padding: { top: 120, bottom: 200, left: 50, right: 50 },
        maxZoom: 16,
      });

      // Fetch route
      if (riderLocation) {
        try {
          const waypoints = pickupLocation
            ? `${riderLocation.lng},${riderLocation.lat};${pickupLocation.lng},${pickupLocation.lat};${destinationLocation.lng},${destinationLocation.lat}`
            : `${riderLocation.lng},${riderLocation.lat};${destinationLocation.lng},${destinationLocation.lat}`;

          const response = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${mapboxToken}`
          );
          const data = await response.json();

          if (data.routes && data.routes[0]) {
            // Store distance for fee calculation
            setRouteDistance(data.routes[0].distance / 1000); // Convert to km

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
      map.current?.remove();
    };
  }, [mapboxToken, destinationLocation, pickupLocation]);

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
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0" />

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
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-card rounded-full shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">DRIVING</p>
            <p className="text-sm font-semibold text-foreground">{currentStreet}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UberStyleMap;
