import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import { mockOrders, mockRiders } from '@/data/adminMockData';
import { AdminOrder, AdminOrderStatus } from '@/types/admin';
import { 
  Search, 
  Filter, 
  ChevronRight,
  MapPin,
  Phone,
  User,
  Package
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

const statusOptions: AdminOrderStatus[] = [
  'pending', 'confirmed', 'picked_up', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'
];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = (orderId: string, newStatus: AdminOrderStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    toast.success(`Order ${orderId} updated to ${newStatus.replace('_', ' ')}`);
  };

  const handleAssignRider = (orderId: string, riderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, assignedRider: riderId } : order
    ));
    if (selectedOrder?.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, assignedRider: riderId } : null);
    }
    const rider = mockRiders.find(r => r.id === riderId);
    toast.success(`${rider?.name} assigned to order ${orderId}`);
  };

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
          {filteredOrders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="w-full text-left bg-card rounded-2xl border border-border/50 p-4 shadow-card hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{order.id}</span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <p className="text-base font-semibold text-foreground mt-1">
                    {order.customerName}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formatDate(order.createdAt)}
                </span>
                <span className="font-bold text-foreground">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </button>
          ))}
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
                  <SheetTitle className="text-lg">Order {selectedOrder.id}</SheetTitle>
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
                    <p className="text-sm text-foreground">{selectedOrder.customerName}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> {selectedOrder.customerPhone}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> {selectedOrder.pickupAddress}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Order Items</h4>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {item.serviceName} × {item.quantity}
                      </span>
                      <span className="font-medium">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Update Status */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Update Status</h4>
                  <Select 
                    value={selectedOrder.status} 
                    onValueChange={(value: AdminOrderStatus) => handleStatusUpdate(selectedOrder.id, value)}
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
                    value={selectedOrder.assignedRider || ''} 
                    onValueChange={(value) => handleAssignRider(selectedOrder.id, value)}
                  >
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select a rider" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockRiders.filter(r => r.status !== 'offline').map(rider => (
                        <SelectItem key={rider.id} value={rider.id}>
                          {rider.name} ({rider.status})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedOrder(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    className="flex-1 gradient-hero text-primary-foreground"
                    onClick={() => {
                      toast.success('Order updated successfully');
                      setSelectedOrder(null);
                    }}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminOrders;
