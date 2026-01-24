import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DeliverySettings {
  base_fee: number;
  per_km_fee: number;
  service_fee: number;
  surge_enabled: boolean;
  max_surge: number;
}

interface PlatformSettings {
  rider_platform_fee: number;
  min_order_amount: number;
  max_delivery_radius_km: number;
}

interface NotificationSettings {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
}

interface PaymentSettings {
  wallet_enabled: boolean;
  momo_enabled: boolean;
  card_enabled: boolean;
  cash_enabled: boolean;
}

interface AppSettings {
  delivery: DeliverySettings;
  platform: PlatformSettings;
  notifications: NotificationSettings;
  payments: PaymentSettings;
}

const defaultSettings: AppSettings = {
  delivery: {
    base_fee: 5,
    per_km_fee: 2,
    service_fee: 2,
    surge_enabled: true,
    max_surge: 2.5,
  },
  platform: {
    rider_platform_fee: 5,
    min_order_amount: 20,
    max_delivery_radius_km: 25,
  },
  notifications: {
    push_enabled: true,
    email_enabled: true,
    sms_enabled: false,
  },
  payments: {
    wallet_enabled: true,
    momo_enabled: true,
    card_enabled: true,
    cash_enabled: true,
  },
};

export const useAppSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: Record<string, any> = {};
      data?.forEach((row) => {
        settingsMap[row.key] = row.value;
      });

      return {
        delivery: settingsMap.delivery || defaultSettings.delivery,
        platform: settingsMap.platform || defaultSettings.platform,
        notifications: settingsMap.notifications || defaultSettings.notifications,
        payments: settingsMap.payments || defaultSettings.payments,
      } as AppSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
  });

  return {
    settings: settings || defaultSettings,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
  };
};

// Hook for specific setting categories
export const useDeliverySettings = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useAppSettings();
  
  return {
    settings: settings.delivery,
    isLoading,
    update: (value: Partial<DeliverySettings>) => 
      updateSettings({ key: 'delivery', value: { ...settings.delivery, ...value } }),
    isUpdating,
  };
};

export const usePlatformSettings = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useAppSettings();
  
  return {
    settings: settings.platform,
    isLoading,
    update: (value: Partial<PlatformSettings>) => 
      updateSettings({ key: 'platform', value: { ...settings.platform, ...value } }),
    isUpdating,
  };
};

export const useNotificationSettings = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useAppSettings();
  
  return {
    settings: settings.notifications,
    isLoading,
    update: (value: Partial<NotificationSettings>) => 
      updateSettings({ key: 'notifications', value: { ...settings.notifications, ...value } }),
    isUpdating,
  };
};

export const usePaymentSettings = () => {
  const { settings, isLoading, updateSettings, isUpdating } = useAppSettings();
  
  return {
    settings: settings.payments,
    isLoading,
    update: (value: Partial<PaymentSettings>) => 
      updateSettings({ key: 'payments', value: { ...settings.payments, ...value } }),
    isUpdating,
  };
};