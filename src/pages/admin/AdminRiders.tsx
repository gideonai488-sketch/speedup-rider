import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import RiderStatusBadge from '@/components/admin/RiderStatusBadge';
import { mockRiders } from '@/data/adminMockData';
import { Rider } from '@/types/admin';
import { 
  Search, 
  Plus,
  Phone,
  Star,
  Package,
  MoreVertical,
  UserCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const AdminRiders: React.FC = () => {
  const [riders, setRiders] = useState<Rider[]>(mockRiders);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRider, setNewRider] = useState({ name: '', phone: '' });

  const filteredRiders = riders.filter(rider => 
    rider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.phone.includes(searchQuery)
  );

  const handleAddRider = () => {
    if (!newRider.name || !newRider.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const rider: Rider = {
      id: `RID-${String(riders.length + 1).padStart(3, '0')}`,
      name: newRider.name,
      phone: newRider.phone,
      status: 'available',
      currentOrders: 0,
      totalDeliveries: 0,
      rating: 5.0,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    setRiders(prev => [...prev, rider]);
    setNewRider({ name: '', phone: '' });
    setIsAddDialogOpen(false);
    toast.success(`${rider.name} added successfully`);
  };

  const handleStatusChange = (riderId: string, status: Rider['status']) => {
    setRiders(prev => prev.map(rider => 
      rider.id === riderId ? { ...rider, status } : rider
    ));
    toast.success('Rider status updated');
  };

  const handleRemoveRider = (riderId: string) => {
    setRiders(prev => prev.filter(rider => rider.id !== riderId));
    toast.success('Rider removed');
  };

  return (
    <AdminLayout title="Riders">
      <div className="p-4 space-y-4">
        {/* Search and Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search riders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-primary-foreground">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Rider</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    placeholder="Enter rider's name"
                    value={newRider.name}
                    onChange={(e) => setNewRider(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    placeholder="+234 xxx xxx xxxx"
                    value={newRider.phone}
                    onChange={(e) => setNewRider(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 gradient-hero text-primary-foreground"
                    onClick={handleAddRider}
                  >
                    Add Rider
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-success">
              {riders.filter(r => r.status === 'available').length}
            </p>
            <p className="text-xs text-muted-foreground">Available</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-warning">
              {riders.filter(r => r.status === 'busy').length}
            </p>
            <p className="text-xs text-muted-foreground">Busy</p>
          </div>
          <div className="bg-muted rounded-xl p-3 text-center">
            <p className="text-2xl font-bold text-muted-foreground">
              {riders.filter(r => r.status === 'offline').length}
            </p>
            <p className="text-xs text-muted-foreground">Offline</p>
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
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{rider.name}</h3>
                    <RiderStatusBadge status={rider.status} />
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {rider.phone}
                  </p>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStatusChange(rider.id, 'available')}>
                      Set Available
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(rider.id, 'busy')}>
                      Set Busy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(rider.id, 'offline')}>
                      Set Offline
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleRemoveRider(rider.id)}
                    >
                      Remove Rider
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-warning mb-0.5">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-sm font-bold">{rider.rating}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{rider.totalDeliveries}</p>
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
            </div>
          ))}
        </div>

        {filteredRiders.length === 0 && (
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
