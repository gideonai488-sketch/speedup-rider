import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Search, 
  Plus,
  Phone,
  Mail,
  MoreVertical,
  UserCircle,
  MapPin,
  Calendar,
  ShoppingBag,
  Ban,
  CheckCircle,
  Trash2,
  Eye,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'suspended' | 'pending';
  role: 'customer' | 'rider' | 'admin';
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastActive: string;
  avatar?: string;
}

const mockUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Kwame Mensah',
    email: 'kwame.mensah@gmail.com',
    phone: '+233 20 123 4567',
    address: 'East Legon, Accra',
    status: 'active',
    role: 'customer',
    totalOrders: 45,
    totalSpent: 3450,
    joinedAt: '2023-06-15',
    lastActive: '2024-01-15',
  },
  {
    id: 'USR-002',
    name: 'Abena Osei',
    email: 'abena.osei@yahoo.com',
    phone: '+233 24 234 5678',
    address: 'Cantonments, Accra',
    status: 'active',
    role: 'customer',
    totalOrders: 32,
    totalSpent: 2890,
    joinedAt: '2023-08-20',
    lastActive: '2024-01-14',
  },
  {
    id: 'USR-003',
    name: 'Kofi Asante',
    email: 'kofi.asante@outlook.com',
    phone: '+233 27 345 6789',
    address: 'Labone, Accra',
    status: 'suspended',
    role: 'customer',
    totalOrders: 12,
    totalSpent: 890,
    joinedAt: '2023-10-01',
    lastActive: '2024-01-10',
  },
  {
    id: 'USR-004',
    name: 'Ama Darko',
    email: 'ama.darko@gmail.com',
    phone: '+233 50 456 7890',
    address: 'Ridge, Accra',
    status: 'active',
    role: 'customer',
    totalOrders: 67,
    totalSpent: 5670,
    joinedAt: '2023-04-10',
    lastActive: '2024-01-15',
  },
  {
    id: 'USR-005',
    name: 'Yaw Boateng',
    email: 'yaw.boateng@gmail.com',
    phone: '+233 55 567 8901',
    address: 'Spintex, Accra',
    status: 'pending',
    role: 'customer',
    totalOrders: 0,
    totalSpent: 0,
    joinedAt: '2024-01-14',
    lastActive: '2024-01-14',
  },
  {
    id: 'USR-006',
    name: 'Efua Amponsah',
    email: 'efua.amp@gmail.com',
    phone: '+233 20 678 9012',
    address: 'Dansoman, Accra',
    status: 'active',
    role: 'rider',
    totalOrders: 234,
    totalSpent: 0,
    joinedAt: '2023-05-20',
    lastActive: '2024-01-15',
  },
];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<{ name: string; email: string; phone: string; role: 'customer' | 'rider' | 'admin' }>({ name: '', email: '', phone: '', role: 'customer' });

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const formatCurrency = (value: number) => `GH₵ ${value.toLocaleString()}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.phone) {
      toast.error('Please fill in all fields');
      return;
    }

    const user: User = {
      id: `USR-${String(users.length + 1).padStart(3, '0')}`,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      address: '',
      status: 'pending',
      role: newUser.role,
      totalOrders: 0,
      totalSpent: 0,
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
    };

    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '', phone: '', role: 'customer' });
    setIsAddDialogOpen(false);
    toast.success(`${user.name} added successfully`);
  };

  const handleStatusChange = (userId: string, status: User['status']) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status } : user
    ));
    toast.success('User status updated');
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
    toast.success('User deleted');
  };

  const getStatusBadge = (status: User['status']) => {
    const variants = {
      active: 'bg-success/10 text-success border-success/20',
      suspended: 'bg-destructive/10 text-destructive border-destructive/20',
      pending: 'bg-warning/10 text-warning border-warning/20',
    };
    return <Badge className={`${variants[status]} border`}>{status}</Badge>;
  };

  const getRoleBadge = (role: User['role']) => {
    const variants = {
      customer: 'bg-primary/10 text-primary border-primary/20',
      rider: 'bg-coral/10 text-coral border-coral/20',
      admin: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    };
    return <Badge className={`${variants[role]} border`}>{role}</Badge>;
  };

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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-hero text-primary-foreground">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Full Name</label>
                  <Input
                    placeholder="Enter user's name"
                    value={newUser.name}
                    onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Email</label>
                  <Input
                    type="email"
                    placeholder="user@email.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    placeholder="+233 xxx xxx xxxx"
                    value={newUser.phone}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <Select value={newUser.role} onValueChange={(value: 'customer' | 'rider' | 'admin') => setNewUser(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="rider">Rider</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gradient-hero text-primary-foreground" onClick={handleAddUser}>
                    Add User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters Row */}
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-card">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px] bg-card">
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
            <p className="text-xl font-bold text-primary">{users.length}</p>
            <p className="text-[10px] text-muted-foreground">Total</p>
          </div>
          <div className="bg-success/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-success">{users.filter(u => u.status === 'active').length}</p>
            <p className="text-[10px] text-muted-foreground">Active</p>
          </div>
          <div className="bg-warning/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-warning">{users.filter(u => u.status === 'pending').length}</p>
            <p className="text-[10px] text-muted-foreground">Pending</p>
          </div>
          <div className="bg-destructive/10 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-destructive">{users.filter(u => u.status === 'suspended').length}</p>
            <p className="text-[10px] text-muted-foreground">Suspended</p>
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
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                    {getStatusBadge(user.status)}
                    {getRoleBadge(user.role)}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-0.5">
                    <Mail className="w-3 h-3" /> {user.email}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3 h-3" /> {user.phone}
                  </p>
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'active')}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Set Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(user.id, 'suspended')}>
                      <Ban className="w-4 h-4 mr-2" /> Suspend
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold">{user.totalOrders}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(user.totalSpent)}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Spent</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-foreground">{formatDate(user.joinedAt)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase">Joined</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
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
                    <UserCircle className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <SheetTitle className="text-lg text-left">{selectedUser.name}</SheetTitle>
                    <div className="flex gap-2 mt-1">
                      {getStatusBadge(selectedUser.status)}
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
                      <Mail className="w-4 h-4" /> {selectedUser.email}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {selectedUser.phone}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {selectedUser.address || 'No address set'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedUser.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="bg-success/10 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-success">{formatCurrency(selectedUser.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold text-foreground">Activity</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm font-medium">{formatDate(selectedUser.joinedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Active</p>
                      <p className="text-sm font-medium">{formatDate(selectedUser.lastActive)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedUser.status !== 'active' && (
                      <Button 
                        variant="outline" 
                        className="border-success text-success hover:bg-success/10"
                        onClick={() => {
                          handleStatusChange(selectedUser.id, 'active');
                          setSelectedUser(prev => prev ? { ...prev, status: 'active' } : null);
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" /> Activate
                      </Button>
                    )}
                    {selectedUser.status !== 'suspended' && (
                      <Button 
                        variant="outline" 
                        className="border-destructive text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          handleStatusChange(selectedUser.id, 'suspended');
                          setSelectedUser(prev => prev ? { ...prev, status: 'suspended' } : null);
                        }}
                      >
                        <Ban className="w-4 h-4 mr-2" /> Suspend
                      </Button>
                    )}
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setSelectedUser(null)}
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

export default AdminUsers;
