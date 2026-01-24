import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Package, Truck, CheckCircle2, Gift, Wallet, Info, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data: any;
  created_at: string;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
      setIsLoading(false);
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id)
      .eq('is_read', false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return Package;
      case 'delivery':
        return Truck;
      case 'completed':
        return CheckCircle2;
      case 'promo':
        return Gift;
      case 'wallet':
        return Wallet;
      default:
        return Info;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-primary/10 text-primary';
      case 'delivery':
        return 'bg-orange-500/10 text-orange-500';
      case 'completed':
        return 'bg-success/10 text-success';
      case 'promo':
        return 'bg-purple-500/10 text-purple-500';
      case 'wallet':
        return 'bg-emerald-500/10 text-emerald-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </header>

      {/* Notifications List */}
      <div className="p-4 space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 p-4 bg-card rounded-xl">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">No notifications yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We'll notify you when there are updates about your orders or special offers
            </p>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            const iconColor = getIconColor(notification.type);

            return (
              <button
                key={notification.id}
                onClick={() => {
                  if (!notification.is_read) markAsRead(notification.id);
                  // Navigate based on notification type/data
                  if (notification.data?.order_id) {
                    navigate(`/track/${notification.data.order_id}`);
                  }
                }}
                className={cn(
                  'w-full flex gap-3 p-4 rounded-xl text-left transition-all',
                  notification.is_read
                    ? 'bg-card'
                    : 'bg-primary/5 border border-primary/20'
                )}
              >
                <div className={cn('w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0', iconColor)}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={cn(
                      'font-medium text-foreground',
                      !notification.is_read && 'font-semibold'
                    )}>
                      {notification.title}
                    </h3>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;