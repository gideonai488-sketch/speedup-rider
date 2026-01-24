import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import { useAdminOrders, useAdminRiders, useUpdateOrderStatus } from '@/hooks/useAdminData';
import { Database } from '@/integrations/supabase/types';
import { 
  Search, 
  Filter, 
  ChevronRight,
  MapPin,
  Phone,
  User,
  Package,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { format } from 'date-fns';

type OrderStatus = Database['public']['Enums']['order_status'];

const statusOptions: OrderStatus[] = [
  'pending', 'confirmed', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled'
];

const AdminOrders: React.FC = () => {
  const { data: orders = [], isLoading: ordersLoading } = useAdminOrders();
  const { data: riders = [] } = useAdminRiders();
  const updateOrderStatus = useUpdateOrderStatus();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = orders.filter(order => {
    const customerName = (order as any).profiles?.full_name || '';
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => `GH₵ ${value?.toLocaleString() || 0}`;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, h:mm a');
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus, riderId?: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: newStatus, riderId });
      toast.success(`Order updated to ${newStatus.replace('_', ' ')}`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: 'confirmed', riderId });
      const rider = riders.find((r: any) => r.id === riderId);
      toast.success(`${rider?.full_name} assigned to order`);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev: any) => prev ? { ...prev, rider_id: riderId } : null);
      }
    } catch (error) {
      toast.error('Failed to assign rider');
    }
  };

  if (ordersLoading) {
    return (
      <AdminLayout title="Orders">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders">
      <div className="p-4 space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-card">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>
                  {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Orders Count */}
        <p className="text-sm text-muted-foreground">
          {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
        </p>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const customerName = (order as any).profiles?.full_name || 'Unknown Customer';
            const orderItems = (order as any).order_items || [];
            
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left bg-card rounded-2xl border border-border/50 p-4 shadow-card hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-primary">{order.order_number}</span>
                      <OrderStatusBadge status={order.status as any} size="sm" />
                    </div>
                    <p className="text-base font-semibold text-foreground mt-1">
                      {customerName}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {orderItems.length} item{orderItems.length !== 1 ? 's' : ''} • {formatDate(order.created_at)}
                  </span>
                  <span className="font-bold text-foreground">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        )}
      </div>

      {/* Order Detail Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          {selectedOrder && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg">Order {selectedOrder.order_number}</SheetTitle>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>
              </SheetHeader>

              <div className="space-y-6 overflow-y-auto h-[calc(100%-80px)] pb-6">
                {/* Customer Info */}
                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Details
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-foreground">{selectedOrder.profiles?.full_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> {selectedOrder.profiles?.phone || 'No phone'}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> {selectedOrder.delivery_address}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Order Items</h4>
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatCurrency(item.total_price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery Fee</span>
                      <span>{formatCurrency(selectedOrder.delivery_fee)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Status */}
                <div className="bg-secondary/30 rounded-xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment Status</span>
                    <span className={`text-sm font-medium ${selectedOrder.payment_status === 'paid' ? 'text-success' : 'text-warning'}`}>
                      {selectedOrder.payment_status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Update Status</h4>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value: OrderStatus) => handleStatusUpdate(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assign Rider */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Assign Rider</h4>
                  <Select 
                    value={selectedOrder.rider_id || ''} 
                    onValueChange={(value) => handleAssignRider(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select a rider" />
                    </SelectTrigger>
                    <SelectContent>
                      {riders.filter((r: any) => r.is_online).map((rider: any) => (
                        <SelectItem key={rider.id} value={rider.id}>
                          {rider.full_name} (Online)
                        </SelectItem>
                      ))}
                      {riders.filter((r: any) => !r.is_online).map((rider: any) => (
                        <SelectItem key={rider.id} value={rider.id}>
                          {rider.full_name} (Offline)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Close Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminOrders;
