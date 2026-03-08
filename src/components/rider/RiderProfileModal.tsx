import React from 'react';
import { Star, Bike, MapPin, Phone, MessageSquare, X, Shield, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface RiderProfileModalProps {
  open: boolean;
  onClose: () => void;
  rider: {
    rider_id: string;
    profile?: {
      full_name?: string;
      phone?: string;
      avatar_url?: string;
      vehicle_type?: string;
      city?: string;
    };
    vehicle_type?: string | null;
    rating: number;
    ratingCount: number;
    deliveryCount: number;
  } | null;
}

const RiderProfileModal: React.FC<RiderProfileModalProps> = ({ open, onClose, rider }) => {
  if (!rider) return null;

  const name = rider.profile?.full_name || 'Rider';
  const phone = rider.profile?.phone;
  const vehicle = rider.profile?.vehicle_type || rider.vehicle_type || 'motorcycle';
  const city = rider.profile?.city;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="gradient-hero px-6 pt-8 pb-12 text-center relative">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold text-white mx-auto border-4 border-white/30">
            {rider.profile?.avatar_url ? (
              <img src={rider.profile.avatar_url} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              name.charAt(0)
            )}
          </div>
          <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-success text-success-foreground text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            Online
          </div>
        </div>

        <div className="px-6 pt-8 pb-6 space-y-5">
          {/* Name & rating */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-foreground">{name}</h2>
            <div className="flex items-center justify-center gap-2 mt-1.5">
              <div className="flex items-center gap-0.5">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-semibold text-foreground">{rider.rating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground text-sm">({rider.ratingCount} reviews)</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Package className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-bold text-foreground">{rider.deliveryCount}</p>
              <p className="text-[10px] text-muted-foreground">Deliveries</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Bike className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-bold text-foreground capitalize">{vehicle}</p>
              <p className="text-[10px] text-muted-foreground">Vehicle</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-bold text-foreground">Verified</p>
              <p className="text-[10px] text-muted-foreground">Status</p>
            </div>
          </div>

          {/* Details */}
          {city && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{city}</span>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-foreground font-medium">{phone}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {phone && (
              <a href={`tel:${phone}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
              </a>
            )}
            <Button className="flex-1 gradient-hero text-white" onClick={onClose}>
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiderProfileModal;
