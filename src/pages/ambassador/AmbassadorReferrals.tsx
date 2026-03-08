import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Loader2, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import BottomNav from '@/components/layout/BottomNav';

const AmbassadorReferrals: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading, user } = useAuth();
  const [signups, setSignups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/ambassador/auth');
  }, [authLoading, user]);

  useEffect(() => {
    if (!profile) return;
    loadSignups();
  }, [profile]);

  const loadSignups = async () => {
    if (!profile) return;
    setLoading(true);
    const { data } = await supabase
      .from('ambassador_signups' as any)
      .select('*, signed_up_user_id(full_name, created_at, role)')
      .eq('ambassador_id', profile.id)
      .order('created_at', { ascending: false });

    setSignups(data || []);
    setLoading(false);
  };

  const filtered = signups.filter((s: any) =>
    !search || (s.signed_up_user_id?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  const totalEarned = signups.reduce((sum: number, s: any) => sum + (s.bonus_earned || 5), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/ambassador')} className="p-2 rounded-lg hover:bg-accent">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-bold text-foreground">My Referrals</span>
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20">{signups.length} signups</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-4">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{signups.length}</p>
              <p className="text-xs text-muted-foreground">Total Signups</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">${totalEarned}</p>
              <p className="text-xs text-muted-foreground">Total Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search signups..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-10 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">No signups yet</p>
              <p className="text-sm text-muted-foreground">Share your referral code to start earning!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((signup: any) => (
              <Card key={signup.id} className="border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {signup.signed_up_user_id?.full_name || 'Student'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(signup.created_at).toLocaleDateString()} · {signup.signed_up_user_id?.role || 'customer'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    +${signup.bonus_earned || 5}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AmbassadorReferrals;
