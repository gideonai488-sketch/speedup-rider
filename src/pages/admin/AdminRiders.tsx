import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminRiders } from '@/hooks/useAdminData';
import { 
  Search, 
  Phone,
  Star,
  Package,
  MoreVertical,
  UserCircle,
  Loader2,
  MapPin,
  Car,
  Bike
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const AdminRiders: React.FC = () => {
  const { data: riders, isLoading, error } = useAdminRiders();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRiders = riders?.filter(rider => 
    rider.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.phone?.includes(searchQuery)
  ) || [];

  const getStatusBadge = (isOnline: boolean, riderStatus?: string | null) => {
    if (riderStatus === 'pending') {
      return <Badge className="bg-warning/10 text-warning border-warning/20 border">Pending</Badge>;
    }
    if (riderStatus === 'rejected') {
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 border">Rejected</Badge>;
    }
    if (isOnline) {
      return <Badge className="bg-success/10 text-success border-success/20 border">Online</Badge>;
    }
    return <Badge className="bg-muted text-muted-foreground border-border border">Offline</Badge>;
  };

  const getVehicleIcon = (type?: string | null) => {
    if (type === 'car') return <Car className="w-4 h-4" />;
    return <Bike className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Riders">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const onlineCount = riders?.filter(r => r.isOnline).length || 0;
  const offlineCount = riders?.filter(r => !r.isOnline && r.rider_status === 'approved').length || 0;
  const pendingCount = riders?.filter(r => r.rider_status === 'pending').length || 0;

  return (
    <AdminLayout title="Riders">
      <div className="p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search riders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">{onlineCount}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{offlineCount}</p>
            <p className="text-xs text-muted-foreground">Offline</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warning">{pendingCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>

        {/* Riders List */}
        <div className="space-y-3">
          {filteredRiders.map((rider) => (
            <div
              key={rider.id}
              className="bg-card rounded-2xl border border-border/50 p-4 shadow-card"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {rider.avatar_url ? (
                    <img src={rider.avatar_url} alt={rider.full_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <UserCircle className="w-8 h-8 text-primary" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{rider.full_name}</h3>
                    {getStatusBadge(rider.isOnline, rider.rider_status)}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {rider.phone || 'No phone'}
                  </p>
                  {rider.vehicle_type && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                      {getVehicleIcon(rider.vehicle_type)} {rider.vehicle_type} • {rider.vehicle_plate || 'No plate'}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      View Deliveries
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-warning mb-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-sm font-bold">5.0</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{rider.completedDeliveries}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Deliveries</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    <span className="text-sm font-bold text-foreground">{rider.currentOrders}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">Active</p>
                </div>
              </div>

              {/* Joined date */}
              <p className="text-xs text-muted-foreground text-center mt-3">
                Joined {format(new Date(rider.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          ))}
        </div>

        {filteredRiders.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <UserCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No riders found</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRiders;