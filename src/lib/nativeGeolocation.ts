import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';

interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  heading: number | null;
  speed: number | null;
}

const isNative = () => Capacitor.isNativePlatform();

export async function requestPermissions(): Promise<boolean> {
  if (!isNative()) return true; // Browser handles its own prompts
  
  try {
    const status = await Geolocation.requestPermissions();
    return status.location === 'granted';
  } catch {
    return false;
  }
}

export async function getCurrentPosition(options?: {
  enableHighAccuracy?: boolean;
  timeout?: number;
}): Promise<GeoPosition> {
  if (isNative()) {
    const pos: Position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 15000,
    });
    return {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
    };
  }

  // Browser fallback
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        heading: pos.coords.heading,
        speed: pos.coords.speed,
      }),
      (err) => reject(err),
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? false,
        timeout: options?.timeout ?? 10000,
        maximumAge: 300000,
      }
    );
  });
}

export function watchPosition(
  callback: (position: GeoPosition) => void,
  errorCallback?: (error: any) => void,
  options?: { enableHighAccuracy?: boolean }
): () => void {
  if (isNative()) {
    let watchId: string | undefined;
    
    Geolocation.watchPosition(
      {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        minimumUpdateInterval: 3000,
      },
      (pos, err) => {
        if (err) {
          errorCallback?.(err);
          return;
        }
        if (pos) {
          callback({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            heading: pos.coords.heading,
            speed: pos.coords.speed,
          });
        }
      }
    ).then((id) => {
      watchId = id;
    });

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }

  // Browser fallback
  if (!navigator.geolocation) {
    errorCallback?.(new Error('Geolocation not supported'));
    return () => {};
  }

  const id = navigator.geolocation.watchPosition(
    (pos) => callback({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy,
      heading: pos.coords.heading,
      speed: pos.coords.speed,
    }),
    (err) => errorCallback?.(err),
    {
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: 15000,
      maximumAge: 5000,
    }
  );

  return () => navigator.geolocation.clearWatch(id);
}
