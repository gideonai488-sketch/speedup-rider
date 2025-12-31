import React from 'react';
import { 
  User, MapPin, CreditCard, Bell, HelpCircle, 
  Settings, ChevronRight, LogOut, Star, Gift, ShieldCheck
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/context/AdminContext';

const menuItems = [
  { icon: MapPin, label: 'Saved Addresses', badge: '2' },
  { icon: CreditCard, label: 'Payment Methods' },
  { icon: Bell, label: 'Notifications' },
  { icon: Gift, label: 'Refer & Earn', highlight: true },
  { icon: Star, label: 'Rate Us' },
  { icon: HelpCircle, label: 'Help & Support' },
  { icon: Settings, label: 'Settings' },
];

const Profile: React.FC = () => {
  const { toggleAdminMode } = useAdmin();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Profile Header */}
      <div className="gradient-hero pt-12 pb-8 px-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-foreground">Kwame Asante</h1>
            <p className="text-sm text-primary-foreground/70">+233 20 123 4567</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
                <span className="text-xs font-medium text-primary-foreground">Gold Member</span>
              </div>
            </div>
          </div>
          <Button variant="glass" size="sm">
            Edit
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-lg mx-auto px-4 -mt-4">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Orders', value: '24' },
            { label: 'Points', value: '1,250' },
            { label: 'Saved', value: 'GH₵ 180' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl bg-card border border-border/50 p-4 text-center shadow-card"
            >
              <p className="text-lg font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-2">
        {menuItems.map(({ icon: Icon, label, badge, highlight }) => (
          <button
            key={label}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
              highlight
                ? 'bg-coral/10 border border-coral/20'
                : 'bg-card border border-border/50 hover:border-primary/30'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                highlight ? 'bg-coral/20 text-coral' : 'bg-muted text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className={cn('flex-1 text-left font-medium', highlight && 'text-coral')}>
              {label}
            </span>
            {badge && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary">
                {badge}
              </span>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        ))}

        {/* Admin Mode */}
        <button 
          onClick={toggleAdminMode}
          className="w-full flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <span className="flex-1 text-left font-medium text-primary">Admin Dashboard</span>
          <ChevronRight className="w-5 h-5 text-primary" />
        </button>

        {/* Logout */}
        <button className="w-full flex items-center gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/20 mt-4">
          <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <span className="flex-1 text-left font-medium text-destructive">Log Out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
