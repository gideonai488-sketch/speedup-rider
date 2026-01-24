import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, CheckCircle, XCircle, Clock, User, Phone, 
  Bike, Car, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePendingRiders, useUpdateRiderStatus } from '@/hooks/useAdminData';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminRiderApprovals: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const { data: riders = [], isLoading, refetch } = usePendingRiders(statusFilter === 'all' ? undefined : statusFilter);
  const updateStatus = useUpdateRiderStatus();

  const filteredRiders = riders.filter(rider => 
    rider.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.phone?.includes(searchQuery)
  );

  const handleAction = async () => {
    if (!selectedRider || !actionType) return;

    try {
      await updateStatus.mutateAsync({
        riderId: selectedRider.id,
        status: actionType === 'approve' ? 'approved' : 'rejected',
      });
      toast.success(`Rider ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      refetch();
    } catch (error) {
      toast.error('Failed to update rider status');
    } finally {
      setSelectedRider(null);
      setActionType(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning border-warning"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-success border-success"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-destructive border-destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car': return <Car className="w-4 h-4" />;
      default: return <Bike className="w-4 h-4" />;
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rider Approvals</h1>
            <p className="text-muted-foreground">Review and approve rider applications</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-warning border-warning">
              <Clock className="w-3 h-3 mr-1" />
              {riders.filter(r => r.rider_status === 'pending').length} Pending
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Riders List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredRiders.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No rider applications found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredRiders.map((rider) => (
              <div
                key={rider.id}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                      {rider.full_name?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{rider.full_name}</h3>
                        {getStatusBadge(rider.rider_status || 'pending')}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {rider.phone || 'No phone'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                      {getVehicleIcon(rider.vehicle_type || 'motorcycle')}
                      <span className="capitalize">{rider.vehicle_type || 'Motorcycle'}</span>
                      {rider.vehicle_plate && (
                        <span className="font-mono bg-background px-2 py-0.5 rounded">
                          {rider.vehicle_plate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Applied Date */}
                  <div className="text-sm text-muted-foreground">
                    Applied: {format(new Date(rider.created_at), 'MMM d, yyyy')}
                  </div>

                  {/* Actions */}
                  {rider.rider_status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setSelectedRider(rider);
                          setActionType('reject');
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90"
                        onClick={() => {
                          setSelectedRider(rider);
                          setActionType('approve');
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedRider && !!actionType} onOpenChange={() => { setSelectedRider(null); setActionType(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Rider Application' : 'Reject Rider Application'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' 
                ? `Are you sure you want to approve ${selectedRider?.full_name} as a rider? They will be able to start accepting delivery requests.`
                : `Are you sure you want to reject ${selectedRider?.full_name}'s application? They will need to reapply.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              className={actionType === 'approve' ? 'bg-success hover:bg-success/90' : 'bg-destructive hover:bg-destructive/90'}
            >
              {updateStatus.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminRiderApprovals;
