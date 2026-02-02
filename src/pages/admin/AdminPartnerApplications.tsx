import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Store, 
  Phone, 
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PartnerApplication {
  id: string;
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp: string | null;
  email: string | null;
  business_type: string;
  business_address: string;
  city: string;
  description: string | null;
  operating_hours: string | null;
  estimated_daily_orders: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

const AdminPartnerApplications: React.FC = () => {
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<PartnerApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('partner_applications')
        .update({ 
          status, 
          notes: adminNotes || null,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status, notes: adminNotes } : app
      ));

      if (selectedApplication?.id === id) {
        setSelectedApplication(prev => prev ? { ...prev, status, notes: adminNotes } : null);
      }

      toast.success(`Application ${status}`);
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-warning/10 text-warning border-warning/20',
      approved: 'bg-success/10 text-success border-success/20',
      rejected: 'bg-destructive/10 text-destructive border-destructive/20',
      contacted: 'bg-primary/10 text-primary border-primary/20',
    };
    return <Badge className={`${variants[status] || variants.pending} border`}>{status}</Badge>;
  };

  const getBusinessTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      food: 'bg-orange-500/10 text-orange-500',
      groceries: 'bg-green-500/10 text-green-500',
      electronics: 'bg-blue-500/10 text-blue-500',
      pharmacy: 'bg-teal-500/10 text-teal-500',
      other: 'bg-gray-500/10 text-gray-500',
    };
    return <Badge className={variants[type] || variants.other}>{type}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Partner Applications">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Partner Applications">
      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-card">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-warning/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-warning">
              {applications.filter(a => a.status === 'pending').length}
            </p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">
              {applications.filter(a => a.status === 'contacted').length}
            </p>
            <p className="text-[10px] text-muted-foreground">Contacted</p>
          </div>
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-success">
              {applications.filter(a => a.status === 'approved').length}
            </p>
            <p className="text-[10px] text-muted-foreground">Approved</p>
          </div>
          <div className="bg-destructive/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-destructive">
              {applications.filter(a => a.status === 'rejected').length}
            </p>
            <p className="text-[10px] text-muted-foreground">Rejected</p>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-3">
          {filteredApplications.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                setSelectedApplication(app);
                setAdminNotes(app.notes || '');
              }}
              className="w-full text-left bg-card rounded-xl p-4 border border-border/50 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{app.business_name}</h3>
                  <p className="text-sm text-muted-foreground">{app.contact_name}</p>
                </div>
                {getStatusBadge(app.status)}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {getBusinessTypeBadge(app.business_type)}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {app.city}
                </span>
                <span>{format(new Date(app.created_at), 'MMM d, yyyy')}</span>
              </div>
            </button>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No applications found</p>
          </div>
        )}
      </div>

      {/* Application Detail Sheet */}
      <Sheet open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
          {selectedApplication && (
            <ScrollArea className="h-full">
              <SheetHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-xl">{selectedApplication.business_name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{selectedApplication.contact_name}</p>
                  </div>
                  {getStatusBadge(selectedApplication.status)}
                </div>
              </SheetHeader>

              <div className="space-y-4 pb-8">
                {/* Contact Info */}
                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <a href={`tel:${selectedApplication.phone}`} className="text-sm text-foreground">
                        {selectedApplication.phone}
                      </a>
                    </div>
                    {selectedApplication.whatsapp && (
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-success" />
                        <a 
                          href={`https://wa.me/${selectedApplication.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-foreground"
                        >
                          WhatsApp
                        </a>
                      </div>
                    )}
                    {selectedApplication.email && (
                      <div className="flex items-center gap-2 col-span-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${selectedApplication.email}`} className="text-sm text-foreground">
                          {selectedApplication.email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Business Info */}
                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Business Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-primary" />
                      {getBusinessTypeBadge(selectedApplication.business_type)}
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm text-foreground">{selectedApplication.business_address}</p>
                        <p className="text-xs text-muted-foreground">{selectedApplication.city}</p>
                      </div>
                    </div>
                    {selectedApplication.operating_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm">{selectedApplication.operating_hours}</span>
                      </div>
                    )}
                    {selectedApplication.estimated_daily_orders && (
                      <p className="text-sm text-muted-foreground">
                        Est. {selectedApplication.estimated_daily_orders} daily orders
                      </p>
                    )}
                  </div>
                  {selectedApplication.description && (
                    <p className="text-sm text-muted-foreground border-t border-border/50 pt-3">
                      {selectedApplication.description}
                    </p>
                  )}
                </div>

                {/* Admin Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Admin Notes</label>
                  <Textarea
                    placeholder="Add notes about this application..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'contacted')}
                    disabled={isUpdating}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Mark Contacted
                  </Button>
                  <Button
                    className="bg-success hover:bg-success/90 text-white"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'approved')}
                    disabled={isUpdating}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    disabled={isUpdating}
                    className="col-span-2"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Application
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Submitted {format(new Date(selectedApplication.created_at), 'PPpp')}
                </p>
              </div>
            </ScrollArea>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminPartnerApplications;
