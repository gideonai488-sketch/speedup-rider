import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Locate } from 'lucide-react';

interface UberStyleMapProps {
  riderLocation?: { lat: number; lng: number; heading?: number };
  destinationLocation: { lat: number; lng: number };
  pickupLocation?: { lat: number; lng: number };
  eta?: number;
  currentStreet?: string;
  isMoving?: boolean;
  showRecenterButton?: boolean;
}

export interface UberStyleMapRef {
  recenterToRider: () => void;
}

// Smoothly interpolate between two coordinates
function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}

const UberStyleMap = forwardRef<UberStyleMapRef, UberStyleMapProps>(({
  riderLocation,
  destinationLocation,
  pickupLocation,
  eta = 15,
  currentStreet = 'En route',
  isMoving = true,
  showRecenterButton = true,
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);
  const pickupMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const prevRiderLoc = useRef<{ lat: number; lng: number } | null>(null);
  const animationFrame = useRef<number | null>(null);
  const routeAnimFrame = useRef<number | null>(null);

  const recenterToRider = useCallback(() => {
    if (map.current && riderLocation) {
      setIsFollowing(true);
      map.current.flyTo({
        center: [riderLocation.lng, riderLocation.lat],
        zoom: 16,
        pitch: 45,
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

  // Detect user interaction to stop auto-follow
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    const handleInteraction = () => setIsFollowing(false);
    map.current.on('dragstart', handleInteraction);
    map.current.on('zoomstart', handleInteraction);

    return () => {
      if (map.current) {
        map.current.off('dragstart', handleInteraction);
        map.current.off('zoomstart', handleInteraction);
      }
    };
  }, [isMapReady]);

  // Initialize map with navigation style
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    const centerLat = riderLocation?.lat || destinationLocation.lat;
    const centerLng = riderLocation?.lng || destinationLocation.lng;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-day-v1',
      center: [centerLng, centerLat],
      zoom: 15,
      pitch: 45,
      bearing: riderLocation?.heading || 0,
      antialias: true,
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Add 3D building layer for immersion
      const layers = map.current.getStyle().layers;
      if (layers) {
        const labelLayer = layers.find(
          (layer) => layer.type === 'symbol' && (layer.layout as any)?.['text-field']
        );
        if (labelLayer) {
          map.current.addLayer(
            {
              id: '3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 14,
              paint: {
                'fill-extrusion-color': '#e8e4de',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': ['get', 'min_height'],
                'fill-extrusion-opacity': 0.5,
              },
            },
            labelLayer.id
          );
        }
      }

      setIsMapReady(true);
    });

    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (routeAnimFrame.current) cancelAnimationFrame(routeAnimFrame.current);
      if (map.current) {
        setIsMapReady(false);
        map.current.remove();
        map.current = null;
        riderMarker.current = null;
        destMarker.current = null;
        pickupMarker.current = null;
      }
    };
  }, [mapboxToken]);

  // Add destination marker
  useEffect(() => {
    if (!map.current || !isMapReady) return;

    if (!destMarker.current) {
      const destEl = document.createElement('div');
      destEl.innerHTML = `
        <div style="position: relative;">
          <div style="width: 40px; height: 40px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(16,185,129,0.4); border: 3px solid white;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22" fill="rgba(255,255,255,0.3)" stroke="white" stroke-width="1"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #10b981;"></div>
          <div style="position: absolute; bottom: -12px; left: 50%; transform: translateX(-50%); width: 16px; height: 4px; background: rgba(16,185,129,0.3); border-radius: 50%; filter: blur(2px);"></div>
        </div>
      `;
      destMarker.current = new mapboxgl.Marker({ element: destEl, anchor: 'bottom' })
        .setLngLat([destinationLocation.lng, destinationLocation.lat])
        .addTo(map.current);
    } else {
      destMarker.current.setLngLat([destinationLocation.lng, destinationLocation.lat]);
    }
  }, [isMapReady, destinationLocation]);

  // Add pickup marker if provided
  useEffect(() => {
    if (!map.current || !isMapReady || !pickupLocation) return;

    if (!pickupMarker.current) {
      const pickupEl = document.createElement('div');
      pickupEl.innerHTML = `
        <div style="position: relative;">
          <div style="width: 36px; height: 36px; background: #f97316; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(249,115,22,0.4); border: 3px solid white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 7px solid #f97316;"></div>
        </div>
      `;
      pickupMarker.current = new mapboxgl.Marker({ element: pickupEl, anchor: 'bottom' })
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .addTo(map.current);
    }
  }, [isMapReady, pickupLocation]);

  // Smooth rider marker animation
  useEffect(() => {
    if (!map.current || !isMapReady || !riderLocation) return;

    // Create rider marker if doesn't exist
    if (!riderMarker.current) {
      const riderEl = document.createElement('div');
      riderEl.className = 'rider-marker-uber';
      riderEl.innerHTML = `
        <style>
          @keyframes riderGlow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.4); }
            50% { box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
          }
          .rider-glow {
            animation: riderGlow 2s ease-in-out infinite;
          }
        </style>
        <div class="rider-glow" style="width: 56px; height: 56px; background: linear-gradient(135deg, #f97316, #ea580c); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 16px rgba(249,115,22,0.4); transition: transform 0.3s ease;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="18" r="3" fill="none"/>
            <circle cx="19" cy="18" r="3" fill="none"/>
            <path d="M5 18h2l1-3h8l1 3h2"/>
            <path d="M8 15l2-4h4l1 2"/>
            <circle cx="12" cy="6" r="2" fill="white"/>
            <path d="M12 8v3"/>
            <path d="M10 10l2 1 2-1"/>
            <path d="M10 5.5c0-1.5 1-2.5 2-2.5s2 1 2 2.5" fill="white"/>
          </svg>
        </div>
        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 10px solid #ea580c;"></div>
        <div style="position: absolute; bottom: -14px; left: 50%; transform: translateX(-50%); width: 20px; height: 6px; background: rgba(0,0,0,0.15); border-radius: 50%; filter: blur(3px);"></div>
      `;
      riderMarker.current = new mapboxgl.Marker({ element: riderEl, rotationAlignment: 'map', anchor: 'center' })
        .setLngLat([riderLocation.lng, riderLocation.lat])
        .addTo(map.current);
      prevRiderLoc.current = { lat: riderLocation.lat, lng: riderLocation.lng };

      // Initial fit bounds
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([riderLocation.lng, riderLocation.lat]);
      bounds.extend([destinationLocation.lng, destinationLocation.lat]);
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 100, bottom: 140, left: 50, right: 50 },
          maxZoom: 16,
          pitch: 45,
        });
      } catch (e) {
        // fallback
      }
      return;
    }

    // Smooth animation between previous and new position
    const prev = prevRiderLoc.current || riderLocation;
    const startLat = prev.lat;
    const startLng = prev.lng;
    const endLat = riderLocation.lat;
    const endLng = riderLocation.lng;

    // Cancel any existing animation
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current);

    const duration = 1000; // 1 second smooth transition
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - t, 3);

      const currentLat = lerp(startLat, endLat, eased);
      const currentLng = lerp(startLng, endLng, eased);

      if (riderMarker.current) {
        riderMarker.current.setLngLat([currentLng, currentLat]);
      }

      // Auto-follow rider with smooth camera
      if (isFollowing && map.current && t < 0.1) {
        map.current.easeTo({
          center: [endLng, endLat],
          duration: 1500,
          pitch: 45,
          bearing: riderLocation.heading || map.current.getBearing(),
          easing: (t) => t * (2 - t), // ease-out
        });
      }

      if (t < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      }
    };

    animationFrame.current = requestAnimationFrame(animate);
    prevRiderLoc.current = { lat: endLat, lng: endLng };

    // Update heading rotation
    if (riderLocation.heading && riderMarker.current) {
      const el = riderMarker.current.getElement();
      if (el) {
        const container = el.querySelector('.rider-glow') as HTMLElement;
        if (container) {
          container.style.transform = `rotate(${riderLocation.heading}deg)`;
        }
      }
    }
  }, [isMapReady, riderLocation]);

  // Fetch and display animated route
  useEffect(() => {
    if (!map.current || !isMapReady || !riderLocation || !mapboxToken) return;

    const fetchRoute = async () => {
      try {
        const waypoints = `${riderLocation.lng},${riderLocation.lat};${destinationLocation.lng},${destinationLocation.lat}`;

        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${waypoints}?geometries=geojson&overview=full&access_token=${mapboxToken}`
        );
        const data = await response.json();

        if (data.routes?.[0] && map.current && map.current.isStyleLoaded()) {
          // Safely remove existing route layers
          try {
            ['route-glow', 'route-line', 'route-dash'].forEach(id => {
              if (map.current!.getLayer(id)) map.current!.removeLayer(id);
            });
            if (map.current.getSource('route')) map.current.removeSource('route');
          } catch (e) { /* ignore */ }

          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: data.routes[0].geometry,
            },
          });

          // Outer glow
          map.current.addLayer({
            id: 'route-glow',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#f97316',
              'line-width': 12,
              'line-opacity': 0.15,
              'line-blur': 4,
            },
          });

          // Main solid route
          map.current.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#f97316',
              'line-width': 5,
              'line-opacity': 0.9,
            },
          });

          // Animated dashes on top to show direction
          map.current.addLayer({
            id: 'route-dash',
            type: 'line',
            source: 'route',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#ffffff',
              'line-width': 2,
              'line-opacity': 0.6,
              'line-dasharray': [0, 4, 3],
            },
          });

          // Animate the dashes
          let dashOffset = 0;
          const animateDash = () => {
            if (!map.current) return;
            dashOffset += 0.5;
            // Cycle through dash patterns to create movement
            const phase = (dashOffset % 7);
            try {
              map.current.setPaintProperty('route-dash', 'line-dasharray', [
                Math.max(0, phase),
                4,
                Math.max(0.1, 3 - phase * 0.3),
              ]);
            } catch (e) { /* ignore if layer removed */ }
            routeAnimFrame.current = requestAnimationFrame(animateDash);
          };

          if (routeAnimFrame.current) cancelAnimationFrame(routeAnimFrame.current);
          routeAnimFrame.current = requestAnimationFrame(animateDash);

          // Fit to route on first load
          const coords = data.routes[0].geometry.coordinates;
          if (coords.length > 0 && isFollowing) {
            const routeBounds = new mapboxgl.LngLatBounds();
            coords.forEach((coord: [number, number]) => routeBounds.extend(coord));
            try {
              map.current.fitBounds(routeBounds, {
                padding: { top: 100, bottom: 150, left: 50, right: 50 },
                maxZoom: 16,
                pitch: 45,
                duration: 1500,
              });
            } catch (e) { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('Failed to fetch route:', err);
      }
    };

    const timer = setTimeout(fetchRoute, 300);
    return () => {
      clearTimeout(timer);
      if (routeAnimFrame.current) cancelAnimationFrame(routeAnimFrame.current);
    };
  }, [isMapReady, riderLocation, destinationLocation, mapboxToken]);

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
    <div className="w-full h-full relative" style={{ minHeight: '300px' }}>
      <div 
        ref={mapContainer} 
        className="absolute inset-0"
        style={{ width: '100%', height: '100%' }}
      />

      {/* Recenter Button - shows when user pans away */}
      {showRecenterButton && riderLocation && !isFollowing && (
        <button
          onClick={recenterToRider}
          className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-card rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-all active:scale-95 border border-border"
          aria-label="Recenter to rider"
        >
          <Locate className="w-5 h-5 text-primary" />
        </button>
      )}
    </div>
  );
});

UberStyleMap.displayName = 'UberStyleMap';

export default UberStyleMap;