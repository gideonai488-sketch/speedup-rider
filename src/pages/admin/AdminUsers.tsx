import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminUsers } from '@/hooks/useAdminData';
import { 
  Search, 
  Phone,
  Mail,
  MoreVertical,
  UserCircle,
  MapPin,
  Calendar,
  ShoppingBag,
  Ban,
  CheckCircle,
  Eye,
  Filter,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { format } from 'date-fns';

const AdminUsers: React.FC = () => {
  const { data: users, isLoading } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

  const getRoleBadge = (role: string) => {
    const variants: Record<string, string> = {
      customer: 'bg-primary/10 text-primary border-primary/20',
      rider: 'bg-coral/10 text-coral border-coral/20',
      admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    return <Badge className={`${variants[role] || variants.customer} border`}>{role}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Users">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const customerCount = users?.filter(u => u.role === 'customer').length || 0;
  const riderCount = users?.filter(u => u.role === 'rider').length || 0;
  const adminCount = users?.filter(u => u.role === 'admin').length || 0;

  return (
    <AdminLayout title="Users">
      <div className="p-4 space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card"
            />
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex gap-2">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px] bg-card">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="rider">Rider</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-primary/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-primary">{users?.length || 0}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-success">{customerCount}</p>
            <p className="text-[10px] text-muted-foreground">Customers</p>
          </div>
          <div className="bg-coral/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-coral">{riderCount}</p>
            <p className="text-[10px] text-muted-foreground">Riders</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-500">{adminCount}</p>
            <p className="text-[10px] text-muted-foreground">Admins</p>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-card rounded-2xl border border-border/50 p-4 shadow-card"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-coral/20 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <UserCircle className="w-8 h-8 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{user.full_name}</h3>
                    {getRoleBadge(user.role)}
                  </div>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> {user.phone}
                    </p>
                  )}
                  {user.address && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3 h-3" /> {user.address}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                      <Eye className="w-4 h-4 mr-2" /> View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold">{user.orderCount || 0}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(user.totalSpent || 0)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Spent</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">
                      {format(new Date(user.created_at), 'MMM d, yy')}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">Joined</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <UserCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>

      {/* User Detail Sheet */}
      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
          {selectedUser && (
            <>
              <SheetHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-coral/20 flex items-center justify-center">
                    {selectedUser.avatar_url ? (
                      <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <UserCircle className="w-10 h-10 text-primary" />
                    )}
                  </div>
                  <div>
                    <SheetTitle className="text-lg text-left">{selectedUser.full_name}</SheetTitle>
                    <div className="flex gap-2 mt-1">
                      {getRoleBadge(selectedUser.role)}
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 overflow-y-auto h-[calc(100%-120px)] pb-6">
                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Contact Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {selectedUser.phone || 'No phone'}
                    </p>
                    {selectedUser.address && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> {selectedUser.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Activity Summary</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{selectedUser.orderCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{formatCurrency(selectedUser.totalSpent || 0)}</p>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Account Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">User ID</span>
                      <span className="text-sm font-mono text-foreground">{selectedUser.id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Joined</span>
                      <span className="text-sm text-foreground">
                        {format(new Date(selectedUser.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
};

export default AdminUsers;