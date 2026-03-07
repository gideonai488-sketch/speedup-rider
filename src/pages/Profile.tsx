import React, { useState } from 'react';
import { 
  User, MapPin, CreditCard, Bell, HelpCircle, 
  Settings, ChevronRight, LogOut, Star, Gift, ShieldCheck,
  Package, Clock, Heart, Wallet, FileText, MessageCircle,
  Mail, Phone, Edit2, Camera, X, Check
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useUserStats } from '@/hooks/useUserStats';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, signOut, updateProfile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
  });

  // Update form when profile loads
  React.useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    setIsEditing(true);
    try {
      const { error } = await updateProfile({
        full_name: editForm.full_name,
        phone: editForm.phone,
        address: editForm.address,
      });

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setIsEditOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsEditing(false);
    }
  };

  const menuSections = [
    {
      title: 'My Account',
      items: [
        { icon: Package, label: 'My Orders', badge: stats?.pendingOrders ? String(stats.pendingOrders) : undefined, path: '/orders' },
        { icon: MapPin, label: 'Saved Addresses' },
        { icon: CreditCard, label: 'Payment Methods' },
        { icon: Heart, label: 'Favorites' },
        { icon: Wallet, label: 'SpeedRush Wallet', value: `GH₵ ${stats?.walletBalance?.toFixed(2) || '0.00'}`, path: '/customer/wallet' },
      ]
    },
    {
      title: 'Rewards & Referrals',
      items: [
        { icon: Gift, label: 'Refer & Earn', highlight: true, subtitle: 'Get GH₵ 20 per referral', path: '/customer/referral' },
        { icon: Star, label: 'Loyalty Points', value: `${stats?.loyaltyPoints?.toLocaleString() || 0} pts` },
        { icon: Clock, label: 'Order History', path: '/orders' },
      ]
    },
    {
      title: 'Support & Settings',
      items: [
        { icon: MessageCircle, label: 'Chat Support', online: true },
        { icon: HelpCircle, label: 'Help Center' },
        { icon: FileText, label: 'Terms & Privacy' },
        { icon: Bell, label: 'Notifications' },
        { icon: Settings, label: 'App Settings' },
      ]
    }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Calculate membership tier based on total spent
  const getMembershipTier = () => {
    const spent = stats?.totalSpent || 0;
    if (spent >= 5000) return { name: 'Platinum', emoji: '💎', color: 'from-purple-500 to-purple-700' };
    if (spent >= 2000) return { name: 'Gold', emoji: '⚡', color: 'from-yellow-500 to-orange-500' };
    if (spent >= 500) return { name: 'Silver', emoji: '🥈', color: 'from-gray-400 to-gray-500' };
    return { name: 'Bronze', emoji: '🥉', color: 'from-orange-700 to-orange-900' };
  };

  const tier = getMembershipTier();

  // Get user email from Supabase auth
  const [userEmail, setUserEmail] = useState<string | null>(null);
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email || null);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent pt-12 pb-8 px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/20 rounded-full blur-2xl" />
        </div>

        <div className="max-w-lg mx-auto relative">
          <div className="flex items-center gap-4">
            {/* Avatar with status */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-xl overflow-hidden">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-primary-foreground" />
                )}
              </div>
              {/* Camera icon for changing photo */}
              <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <Camera className="w-3.5 h-3.5 text-accent-foreground" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary-foreground">
                {profile?.full_name || 'Guest User'}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="px-3 py-1 rounded-full bg-accent/80 backdrop-blur-sm">
                  <span className="text-xs font-bold text-accent-foreground">
                    {tier.emoji} {tier.name} Member
                  </span>
                </div>
                <div className="flex items-center gap-1 text-primary-foreground/80">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium">4.9</span>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/20 border-white/30 text-primary-foreground hover:bg-white/30"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit2 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </div>

          {/* Contact Details Card */}
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-foreground/60">Email</p>
                <p className="text-sm font-medium text-primary-foreground truncate">
                  {userEmail || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-foreground/60">Phone</p>
                <p className="text-sm font-medium text-primary-foreground">
                  {profile?.phone || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary-foreground/60">Address</p>
                <p className="text-sm font-medium text-primary-foreground truncate">
                  {profile?.address || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          {statsLoading ? (
            <>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </>
          ) : (
            [
              { label: 'Total Orders', value: stats?.totalOrders?.toString() || '0', icon: '📦' },
              { label: 'Points Earned', value: stats?.loyaltyPoints?.toLocaleString() || '0', icon: '⭐' },
              { label: 'Money Saved', value: `GH₵ ${Math.floor((stats?.totalSpent || 0) * 0.05)}`, icon: '💰' },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                className="rounded-2xl bg-card border border-border/50 p-4 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h3>
            <div className="space-y-2">
              {section.items.map(({ icon: Icon, label, badge, highlight, value, subtitle, online, path }) => (
                <button
                  key={label}
                  onClick={() => path && navigate(path)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group',
                    highlight
                      ? 'bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30'
                      : 'bg-card border border-border/50 hover:border-primary/30 hover:shadow-md'
                  )}
                >
                  <div
                    className={cn(
                      'w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
                      highlight 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={cn('font-medium', highlight && 'text-accent-foreground')}>
                        {label}
                      </span>
                      {online && (
                        <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      )}
                    </div>
                    {subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                    )}
                  </div>
                  {badge && (
                    <span className="px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {badge}
                    </span>
                  )}
                  {value && (
                    <span className="text-sm font-semibold text-primary">
                      {value}
                    </span>
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Admin & Rider Mode */}
        {profile?.role === 'admin' || profile?.role === 'rider' ? (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              Switch Mode
            </h3>
            
            

            {profile?.role === 'rider' && (
              <button 
                onClick={() => navigate('/rider')}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/40 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-xl">🏍️</span>
                </div>
                <span className="flex-1 text-left font-medium text-accent-foreground">Rider Mode</span>
                <ChevronRight className="w-5 h-5 text-accent" />
              </button>
            )}
          </div>
        ) : null}

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-all mt-4 group"
        >
          <div className="w-11 h-11 rounded-xl bg-destructive/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <span className="flex-1 text-left font-medium text-destructive">Log Out</span>
        </button>

        {/* App version */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          SpeedRush v1.0.0 • Made with ❤️ in Ghana
        </p>
      </div>

      {/* Edit Profile Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center justify-between">
              <span>Edit Profile</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6 py-4">
            {/* Avatar section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Tap to change photo</p>
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Phone Number</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  className="h-12"
                  type="tel"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Address</label>
                <Input
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your address"
                  className="h-12"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                <Input
                  value={userEmail || ''}
                  disabled
                  className="h-12 bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Save button */}
            <Button 
              onClick={handleSaveProfile} 
              className="w-full h-12"
              disabled={isEditing}
            >
              {isEditing ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
};

export default Profile;