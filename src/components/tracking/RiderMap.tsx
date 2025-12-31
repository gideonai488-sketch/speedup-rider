import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface RiderMapProps {
  riderLocation: { lat: number; lng: number };
  destinationLocation: { lat: number; lng: number };
  mapboxToken: string;
}

const RiderMap: React.FC<RiderMapProps> = ({ 
  riderLocation, 
  destinationLocation, 
  mapboxToken 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const riderMarker = useRef<mapboxgl.Marker | null>(null);

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

    // Add destination marker
    new mapboxgl.Marker({ color: '#0066FF' })
      .setLngLat([destinationLocation.lng, destinationLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<p class="font-medium">Your Location</p>'))
      .addTo(map.current);

    // Add rider marker with custom element
    const riderEl = document.createElement('div');
    riderEl.className = 'rider-marker';
    riderEl.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-coral flex items-center justify-center shadow-lg animate-pulse">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="18.5" cy="17.5" r="3.5"/>
          <circle cx="5.5" cy="17.5" r="3.5"/>
          <circle cx="15" cy="5" r="1"/>
          <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
        </svg>
      </div>
    `;

    riderMarker.current = new mapboxgl.Marker({ element: riderEl })
      .setLngLat([riderLocation.lng, riderLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<p class="font-medium">Rider Location</p>'))
      .addTo(map.current);

    // Fit bounds to show both markers
    const bounds = new mapboxgl.LngLatBounds()
      .extend([riderLocation.lng, riderLocation.lat])
      .extend([destinationLocation.lng, destinationLocation.lat]);
    
    map.current.fitBounds(bounds, { padding: 80 });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  // Update rider position
  useEffect(() => {
    if (riderMarker.current) {
      riderMarker.current.setLngLat([riderLocation.lng, riderLocation.lat]);
    }
  }, [riderLocation]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full bg-muted rounded-2xl flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Map requires Mapbox token</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-2xl overflow-hidden" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent rounded-2xl" />
    </div>
  );
};

export default RiderMap;
