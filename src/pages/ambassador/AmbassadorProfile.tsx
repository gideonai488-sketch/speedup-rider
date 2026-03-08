import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeft, GraduationCap, User, Phone, Mail, MapPin,
  Edit3, Save, LogOut, Camera, Loader2
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const AmbassadorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user, signOut, updateProfile, loading: authLoading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState(profile?.address || '');

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setSaving(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated! ✅');
      setEditing(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed');
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    await updateProfile({ avatar_url: urlData.publicUrl });
    toast.success('Photo updated! 📸');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/ambassador/auth');
  };

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/ambassador')} className="p-2 rounded-lg hover:bg-accent">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <span className="font-bold text-foreground">Profile</span>
          </div>
          {editing ? (
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
              Save
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
              <Edit3 className="w-4 h-4 mr-1" /> Edit
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-background shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
              ) : (
                <GraduationCap className="w-10 h-10 text-primary" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer shadow-md">
              <Camera className="w-4 h-4 text-primary-foreground" />
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <h2 className="text-xl font-bold text-foreground mt-3">{profile.full_name}</h2>
          <Badge className="mt-1 bg-primary/10 text-primary border-primary/20">
            <GraduationCap className="w-3 h-3 mr-1" /> Campus Ambassador
          </Badge>
          {(profile as any).university && (
            <p className="text-sm text-muted-foreground mt-1">{(profile as any).university}</p>
          )}
        </div>

        {/* Info Card */}
        <Card className="border-border">
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Full Name</label>
              {editing ? (
                <Input value={fullName} onChange={e => setFullName(e.target.value)} className="bg-card" />
              ) : (
                <p className="text-foreground font-medium">{profile.full_name}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{user?.email || '-'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Phone</label>
              {editing ? (
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="bg-card" />
              ) : (
                <p className="text-foreground">{profile.phone || '-'}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">University</label>
              <p className="text-foreground">{(profile as any).university || profile.city || '-'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AmbassadorProfile;
