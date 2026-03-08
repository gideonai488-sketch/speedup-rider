import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';

const isNative = () => Capacitor.isNativePlatform();

export async function initPushNotifications(userId?: string) {
  if (!isNative()) {
    console.log('Push notifications only available on native platforms');
    return;
  }

  try {
    // Request permission
    const permResult = await PushNotifications.requestPermissions();
    if (permResult.receive !== 'granted') {
      console.warn('Push notification permission denied');
      return;
    }

    // Register with APNS/FCM
    await PushNotifications.register();

    // Listen for registration token
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push token:', token.value);
      
      // Store token in database for sending notifications later
      if (userId) {
        try {
          await supabase
            .from('profiles')
            .update({ push_token: token.value } as any)
            .eq('user_id', userId);
        } catch (err) {
          console.error('Failed to store push token:', err);
        }
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('Push registration error:', error);
    });

    // Handle received notifications
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', notification);
    });

    // Handle notification tap
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      console.log('Push notification action:', action);
      const data = action.notification.data;
      
      // Navigate based on notification type
      if (data?.orderId) {
        window.location.href = `/customer/track/${data.orderId}`;
      }
    });
  } catch (err) {
    console.error('Push notification init error:', err);
  }
}

export async function removePushListeners() {
  if (!isNative()) return;
  await PushNotifications.removeAllListeners();
}
