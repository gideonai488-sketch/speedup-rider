import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  GraduationCap, Users, DollarSign, TrendingUp, Copy, Share2,
  Trophy, Bell, LogOut, Loader2, ChevronRight, Star, Target, BarChart3
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useCountry } from '@/context/CountryContext';

interface AmbassadorStats {
  total_signups: number;
  total_earnings: number;
  current_month_signups: number;
  current_month_earnings: number;
  rank: number | null;
}

const AmbassadorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AmbassadorStats | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [recentSignups, setRecentSignups] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/ambassador/auth');
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!profile) return;
    loadDashboardData();
  }, [profile]);

  const loadDashboardData = async () => {
    if (!profile) return;
    setLoadingStats(true);

    try {
      // Get referral code
      const { data: referralData } = await supabase
        .from('referrals')
        .select('referral_code')
        .eq('referrer_id', profile.id)
        .limit(1)
        .single();

      if (referralData) {
        setReferralCode(referralData.referral_code);
      }

      // Get ambassador stats
      const { data: statsData } = await supabase
        .from('ambassador_stats' as any)
        .select('*')
        .eq('ambassador_id', profile.id)
        .single();

      if (statsData) {
        setStats(statsData as any);
      } else {
        // Create initial stats record
        await supabase.from('ambassador_stats' as any).insert([{
          ambassador_id: profile.id,
          total_signups: 0,
          total_earnings: 0,
          current_month_signups: 0,
          current_month_earnings: 0,
        }]);
        setStats({
          total_signups: 0,
          total_earnings: 0,
          current_month_signups: 0,
          current_month_earnings: 0,
          rank: null,
        });
      }

      // Get recent signups
      const { data: signupsData } = await supabase
        .from('ambassador_signups' as any)
        .select('*, signed_up_user_id(full_name, created_at)')
        .eq('ambassador_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (signupsData) {
        setRecentSignups(signupsData);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const copyReferralCode = () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied! 🔗');
  };

  const shareReferralCode = async () => {
    const link = `${window.location.origin}/auth?ref=${referralCode}`;
    const text = `Join SpeedUp and get your first delivery free! Use my code: ${referralCode}\n${link}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join SpeedUp!', text, url: link });
      } catch {}
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Share text copied! 📋');
    }
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">Ambassador</span>
            <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
              {(profile as any).university || 'Campus Rep'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/ambassador/notifications')} className="p-2 rounded-lg hover:bg-accent relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
            </button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-accent">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Hey, {profile.full_name?.split(' ')[0]}! 🎓
          </h1>
          <p className="text-muted-foreground text-sm">Campus Ambassador Dashboard</p>
        </div>

        {/* Referral Code Card */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">Your Referral Code</span>
              <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold text-foreground tracking-wider font-mono">
                {referralCode || '--------'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyReferralCode} className="flex-1">
                <Copy className="w-4 h-4 mr-1.5" /> Copy Link
              </Button>
              <Button size="sm" onClick={shareReferralCode} className="flex-1 bg-primary hover:bg-primary/90">
                <Share2 className="w-4 h-4 mr-1.5" /> Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Signups', value: stats?.total_signups || 0, icon: <Users className="w-5 h-5" />, color: 'text-blue-500' },
            { label: 'Total Earned', value: `$${(stats?.total_earnings || 0).toFixed(0)}`, icon: <DollarSign className="w-5 h-5" />, color: 'text-green-500' },
            { label: 'This Month', value: stats?.current_month_signups || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'text-primary' },
            { label: 'Rank', value: stats?.rank ? `#${stats.rank}` : '--', icon: <Trophy className="w-5 h-5" />, color: 'text-yellow-500' },
          ].map((stat, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className={`${stat.color} mb-2`}>{stat.icon}</div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'View Referrals', desc: 'Track all your signups', icon: <Users className="w-5 h-5" />, path: '/ambassador/referrals' },
              { label: 'Earnings', desc: 'View earnings & payouts', icon: <DollarSign className="w-5 h-5" />, path: '/ambassador/earnings' },
              { label: 'Leaderboard', desc: 'See top ambassadors', icon: <Trophy className="w-5 h-5" />, path: '/ambassador/leaderboard' },
              { label: 'Resources', desc: 'Marketing kit & flyers', icon: <Target className="w-5 h-5" />, path: '/ambassador/resources' },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Signups */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Signups</h3>
            <button onClick={() => navigate('/ambassador/referrals')} className="text-xs text-primary font-medium">
              View All
            </button>
          </div>
          {recentSignups.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No signups yet. Share your referral code!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentSignups.map((signup: any) => (
                <Card key={signup.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {signup.signed_up_user_id?.full_name || 'Student'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(signup.created_at).toLocaleDateString()}
                      </p>
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

        {/* Earning Potential */}
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-foreground">Earning Potential</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Per student signup</span>
                <span className="font-medium text-foreground">$5.00</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Per order from your signups</span>
                <span className="font-medium text-foreground">$0.50</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Monthly top ambassador bonus</span>
                <span className="font-medium text-foreground">$200</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold">
                <span className="text-foreground">Potential monthly (100 signups)</span>
                <span className="text-primary">$500+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default AmbassadorDashboard;
