import React, { useState } from 'react';
import { Star, Bike, MapPin, MessageSquare, Phone, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBrowseOnlineRiders } from '@/hooks/useOnlineRiders';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import RiderProfileModal from '@/components/rider/RiderProfileModal';

const OnlineRidersPreview: React.FC = () => {
  const { data: riders = [], isLoading } = useBrowseOnlineRiders();
  const [selectedRider, setSelectedRider] = useState<any>(null);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground">Riders Online</h2>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-success">{riders.length}</span>
          </div>
        </div>
        <Link to="/customer/book" className="text-sm text-primary font-medium flex items-center gap-0.5">
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 pb-3">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-36">
                <Skeleton className="h-44 rounded-xl" />
              </div>
            ))
          ) : riders.length === 0 ? (
            <div className="w-full text-center py-8">
              <Bike className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">No riders online right now</p>
            </div>
          ) : (
            riders.slice(0, 8).map((rider) => (
              <button
                key={rider.rider_id}
                onClick={() => setSelectedRider(rider)}
                className="flex-shrink-0 w-36 bg-card rounded-xl border border-border p-3 hover:border-primary/50 transition-colors text-left"
              >
                {/* Avatar */}
                <div className="relative mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-2 overflow-hidden">
                  {rider.profile?.avatar_url ? (
                    <img src={rider.profile.avatar_url} alt={rider.profile.full_name || 'Rider'} className="w-full h-full object-cover" />
                  ) : (
                    rider.profile?.full_name?.charAt(0) || 'R'
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-card" />
                </div>

                {/* Info */}
                <p className="text-sm font-semibold text-foreground text-center truncate">
                  {rider.profile?.full_name?.split(' ')[0] || 'Rider'}
                </p>

                <div className="flex items-center justify-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-warning fill-warning" />
                  <span className="text-xs font-medium">{rider.rating?.toFixed(1) || '5.0'}</span>
                  <span className="text-xs text-muted-foreground">({rider.deliveryCount || 0})</span>
                </div>

                <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
                  <Bike className="w-3 h-3" />
                  <span className="capitalize">{rider.vehicle_type || 'motorcycle'}</span>
                </div>

                {/* Quick actions */}
                <div className="flex gap-1.5 mt-3">
                  <div className="flex-1 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  {rider.profile?.phone && (
                    <div className="flex-1 h-7 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <RiderProfileModal
        open={!!selectedRider}
        onClose={() => setSelectedRider(null)}
        rider={selectedRider}
      />
    </section>
  );
};

export default OnlineRidersPreview;
