import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const isNative = () => Capacitor.isNativePlatform();

export interface PhotoResult {
  dataUrl: string;
  format: string;
}

/**
 * Take a photo using native camera or file picker fallback
 */
export async function takePhoto(): Promise<PhotoResult | null> {
  if (isNative()) {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        width: 1024,
        height: 1024,
      });

      if (photo.dataUrl) {
        return {
          dataUrl: photo.dataUrl,
          format: photo.format,
        };
      }
      return null;
    } catch (err) {
      console.error('Camera error:', err);
      return null;
    }
  }

  // Browser fallback using file input
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          format: file.type.split('/')[1] || 'jpeg',
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    input.click();
  });
}

/**
 * Pick a photo from gallery
 */
export async function pickPhoto(): Promise<PhotoResult | null> {
  if (isNative()) {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        width: 1024,
        height: 1024,
      });

      if (photo.dataUrl) {
        return {
          dataUrl: photo.dataUrl,
          format: photo.format,
        };
      }
      return null;
    } catch (err) {
      console.error('Photo picker error:', err);
      return null;
    }
  }

  // Browser fallback
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          format: file.type.split('/')[1] || 'jpeg',
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    input.click();
  });
}
