import React, { useState } from 'react';
import { Star, Phone, MessageSquare, Bike, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBrowseOnlineRiders } from '@/hooks/useOnlineRiders';
import { cn } from '@/lib/utils';

interface OnlineRider {
  rider_id: string;
  latitude: number;
  longitude: number;
  vehicle_type: string | null;
  profile: any;
  rating: number;
  ratingCount: number;
  deliveryCount: number;
}

interface BrowseRidersProps {
  onSelectRider: (rider: OnlineRider) => void;
  onChat: (rider: OnlineRider) => void;
  userLat?: number;
  userLng?: number;
}

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const BrowseRiders: React.FC<BrowseRidersProps> = ({ onSelectRider, onChat, userLat, userLng }) => {
  const { data: riders = [], isLoading } = useBrowseOnlineRiders();

  const sortedRiders = [...riders].sort((a, b) => {
    if (!userLat || !userLng) return 0;
    const distA = calculateDistance(userLat, userLng, Number(a.latitude), Number(a.longitude));
    const distB = calculateDistance(userLat, userLng, Number(b.latitude), Number(b.longitude));
    return distA - distB;
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-secondary/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (sortedRiders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Navigation className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">No Riders Online</p>
        <p className="text-sm text-muted-foreground mt-1">Check back in a few minutes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {sortedRiders.length} rider{sortedRiders.length !== 1 ? 's' : ''} online
        </p>
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
      </div>

      {sortedRiders.map((rider) => {
        const distance = userLat && userLng
          ? calculateDistance(userLat, userLng, Number(rider.latitude), Number(rider.longitude))
          : null;

        return (
          <div
            key={rider.rider_id}
            className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {rider.profile?.full_name?.charAt(0) || 'R'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {rider.profile?.full_name || 'Rider'}
                </p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                    <span className="font-medium">{rider.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{rider.deliveryCount} trips</span>
                  {distance !== null && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{distance.toFixed(1)} km</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Bike className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize">
                    {rider.vehicle_type || 'motorcycle'}
                  </span>
                  {rider.profile?.city && (
                    <>
                      <MapPin className="w-3 h-3 text-muted-foreground ml-1" />
                      <span className="text-xs text-muted-foreground">{rider.profile.city}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onChat(rider)}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </Button>
              {rider.profile?.phone && (
                <a href={`tel:${rider.profile.phone}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="w-4 h-4 mr-1" />
                    Call
                  </Button>
                </a>
              )}
              <Button
                size="sm"
                className="flex-1 gradient-hero text-white"
                onClick={() => onSelectRider(rider)}
              >
                Select
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BrowseRiders;
