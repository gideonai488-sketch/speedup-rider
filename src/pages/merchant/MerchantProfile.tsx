import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';
import {
  ArrowLeft, User, Phone, Mail, MapPin, LogOut, Save, Loader2, Store, Settings,
} from 'lucide-react';

const MerchantProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: name,
      phone,
      address,
    } as any);
    setSaving(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated!');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Profile & Settings</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Avatar */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-primary" />
            )}
          </div>
          <h2 className="font-bold text-lg text-foreground">{profile.full_name}</h2>
          <p className="text-sm text-muted-foreground">Merchant Account</p>
        </div>

        {/* Edit Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/merchant/store')}>
              <Store className="w-4 h-4 mr-3" /> Store Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start" onClick={() => navigate('/merchant/finance')}>
              <Settings className="w-4 h-4 mr-3" /> Finance & Payouts
            </Button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button variant="outline" className="w-full text-destructive border-destructive/30" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default MerchantProfile;
