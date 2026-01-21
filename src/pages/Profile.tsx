import React from 'react';
import { 
  User, MapPin, CreditCard, Bell, HelpCircle, 
  Settings, ChevronRight, LogOut, Star, Gift, ShieldCheck,
  Package, Clock, Heart, Wallet, FileText, MessageCircle
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';
import { useNavigate } from 'react-router-dom';

const menuSections = [
  {
    title: 'My Account',
    items: [
      { icon: Package, label: 'My Orders', badge: '3', path: '/orders' },
      { icon: MapPin, label: 'Saved Addresses', badge: '2' },
      { icon: CreditCard, label: 'Payment Methods' },
      { icon: Heart, label: 'Favorites' },
      { icon: Wallet, label: 'SpeedRush Wallet', value: 'GH₵ 125.00' },
    ]
  },
  {
    title: 'Rewards & Referrals',
    items: [
      { icon: Gift, label: 'Refer & Earn', highlight: true, subtitle: 'Get GH₵ 20 per referral' },
      { icon: Star, label: 'Loyalty Points', value: '1,250 pts' },
      { icon: Clock, label: 'Order History' },
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

const Profile: React.FC = () => {
  const { toggleAdminMode } = useAdmin();
  const navigate = useNavigate();

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
              <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-xl">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-3 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full" />
              </div>
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary-foreground">Kwame Asante</h1>
              <p className="text-sm text-primary-foreground/70">+233 20 123 4567</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="px-3 py-1 rounded-full bg-accent/80 backdrop-blur-sm">
                  <span className="text-xs font-bold text-accent-foreground">⚡ Gold Member</span>
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
            >
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Orders', value: '124', icon: '📦' },
            { label: 'Points Earned', value: '1,250', icon: '⭐' },
            { label: 'Money Saved', value: 'GH₵ 380', icon: '💰' },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="rounded-2xl bg-card border border-border/50 p-4 text-center shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
            </div>
          ))}
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
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
            Switch Mode
          </h3>
          
          <button 
            onClick={toggleAdminMode}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all group"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <span className="flex-1 text-left font-medium text-primary">Admin Dashboard</span>
            <ChevronRight className="w-5 h-5 text-primary" />
          </button>

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
        </div>

        {/* Logout */}
        <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-all mt-4 group">
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

      <BottomNav />
    </div>
  );
};

export default Profile;
