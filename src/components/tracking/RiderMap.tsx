import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';

interface RiderMapProps {
  riderLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number };
}

const RiderMap: React.FC<RiderMapProps> = ({ 
  riderLocation, 
  destinationLocation,
  pickupLocation 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Mapbox token from edge function
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

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [riderLocation.lng, riderLocation.lat],
      zoom: 14,
      pitch: 45,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );

    // Add destination marker (customer location)
    new mapboxgl.Marker({ color: '#22c55e' })
      .setLngLat([destinationLocation.lng, destinationLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<p class="font-medium p-2">Your Location</p>'))
      .addTo(map.current);

    // Add pickup marker (store location) if provided
    if (pickupLocation) {
      new mapboxgl.Marker({ color: '#3b82f6' })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<p class="font-medium p-2">Pickup Location</p>'))
        .addTo(map.current);
    }

    // Add rider marker with animated motorcycle
    const riderEl = document.createElement('div');
    riderEl.className = 'rider-marker';
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

    riderMarker.current = new mapboxgl.Marker({ element: riderEl })
      .setLngLat([riderLocation.lng, riderLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<p class="font-medium p-2">Rider Location</p>'))
      .addTo(map.current);

    // Add route line
    map.current.on('load', async () => {
      if (!map.current) return;

      // Create bounds to fit all markers
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([riderLocation.lng, riderLocation.lat]);
      bounds.extend([destinationLocation.lng, destinationLocation.lat]);
      if (pickupLocation) {
        bounds.extend([pickupLocation.lng, pickupLocation.lat]);
      }

      map.current.fitBounds(bounds, { 
        padding: { top: 80, bottom: 80, left: 40, right: 40 }
      });

      // Fetch and display route
      try {
        const waypoints = pickupLocation 
          ? `${riderLocation.lng},${riderLocation.lat};${pickupLocation.lng},${pickupLocation.lat};${destinationLocation.lng},${destinationLocation.lat}`
          : `${riderLocation.lng},${riderLocation.lat};${destinationLocation.lng},${destinationLocation.lat}`;

        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&access_token=${mapboxToken}`
        );
        const data = await response.json();

        if (data.routes && data.routes[0]) {
          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#f97316',
              'line-width': 4,
              'line-opacity': 0.8
            }
          });

          // Add dashed animation layer
          map.current.addLayer({
            id: 'route-dashed',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#ffffff',
              'line-width': 2,
              'line-dasharray': [2, 4]
            }
          });
        }
      } catch (err) {
        console.error('Failed to fetch route:', err);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, destinationLocation, pickupLocation]);

  // Update rider position smoothly
  useEffect(() => {
    if (riderMarker.current && map.current) {
      riderMarker.current.setLngLat([riderLocation.lng, riderLocation.lat]);
      
      // Optionally pan to follow rider
      // map.current.panTo([riderLocation.lng, riderLocation.lat]);
    }
  }, [riderLocation]);

  if (error) {
    return (
      <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-2xl overflow-hidden" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent rounded-2xl" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Rider</span>
        </div>
        {pickupLocation && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Pickup</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Delivery</span>
        </div>
      </div>
    </div>
  );
};

export default RiderMap;
