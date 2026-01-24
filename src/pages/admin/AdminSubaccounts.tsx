import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Building2,
  Phone,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RiderSubaccount {
  id: string;
  full_name: string;
  phone: string | null;
  bank_name: string | null;
  bank_code: string | null;
  account_number: string | null;
  account_name: string | null;
  subaccount_code: string | null;
  rider_status: string | null;
}

const AdminSubaccounts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: riders = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-rider-subaccounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, bank_name, bank_code, account_number, account_name, subaccount_code, rider_status')
        .eq('role', 'rider')
        .order('full_name');

      if (error) throw error;
      return data as RiderSubaccount[];
    }
  });

  const filteredRiders = riders.filter(rider =>
    rider.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rider.phone?.includes(searchQuery) ||
    rider.account_number?.includes(searchQuery)
  );

  const stats = {
    total: riders.length,
    withSubaccount: riders.filter(r => r.subaccount_code).length,
    withBankDetails: riders.filter(r => r.bank_code && r.account_number).length,
    pending: riders.filter(r => r.bank_code && !r.subaccount_code).length,
  };

  const getStatusBadge = (rider: RiderSubaccount) => {
    if (rider.subaccount_code) {
      return (
        <Badge className="bg-success/10 text-success border-success/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (rider.bank_code && rider.account_number) {
      return (
        <Badge className="bg-warning/10 text-warning border-warning/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending Setup
        </Badge>
      );
    }
    return (
      <Badge className="bg-muted text-muted-foreground">
        <XCircle className="w-3 h-3 mr-1" />
        No Bank Details
      </Badge>
    );
  };

  const handleRetrySubaccount = async (rider: RiderSubaccount) => {
    if (!rider.bank_code || !rider.account_number || !rider.account_name) {
      toast.error('Rider has incomplete bank details');
      return;
    }

    toast.loading('Creating subaccount...');
    
    try {
      // Get the rider's auth user_id first
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', rider.id)
        .single();

      if (!profile) {
        throw new Error('Profile not found');
      }

      // We need to call the edge function with the rider's auth token
      // For admin, we'll create a simplified version that works with service role
      const { data, error } = await supabase.functions.invoke('create-subaccount', {
        body: {
          bank_code: rider.bank_code,
          account_number: rider.account_number,
          business_name: `${rider.full_name} - SpeedRush Rider`,
          rider_id: rider.id, // Pass rider_id for admin override
        }
      });

      toast.dismiss();
      
      if (error) {
        toast.error(error.message || 'Failed to create subaccount');
        return;
      }

      if (data?.success) {
        toast.success('Subaccount created successfully');
        refetch();
      } else {
        toast.error(data?.error || 'Failed to create subaccount');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to create subaccount');
      console.error(error);
    }
  };

  return (
    <AdminLayout title="Subaccounts">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Rider Subaccounts</h1>
            <p className="text-muted-foreground">Monitor Paystack subaccounts for rider payouts</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Riders</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{stats.withSubaccount}</p>
                <p className="text-xs text-muted-foreground">Active Subaccounts</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending Setup</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.withBankDetails}</p>
                <p className="text-xs text-muted-foreground">With Bank Details</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or account number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Riders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRiders.map((rider) => (
              <div
                key={rider.id}
                className="bg-card rounded-xl border border-border/50 p-4 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Rider Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{rider.full_name}</h3>
                        {getStatusBadge(rider)}
                      </div>
                      {rider.phone && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {rider.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bank Details */}
                  <div className="flex-1 bg-muted/30 rounded-lg p-3">
                    {rider.bank_name ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{rider.bank_name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {rider.account_number} • {rider.account_name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No bank details added</p>
                    )}
                  </div>

                  {/* Subaccount Info */}
                  <div className="flex items-center gap-3">
                    {rider.subaccount_code ? (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Subaccount ID</p>
                        <p className="font-mono text-sm text-foreground">{rider.subaccount_code}</p>
                      </div>
                    ) : rider.bank_code && rider.account_number ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetrySubaccount(rider)}
                        className="gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Create Subaccount
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {filteredRiders.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No riders found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSubaccounts;
