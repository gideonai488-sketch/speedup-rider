import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Trophy, Medal, Crown, Loader2 } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const AmbassadorLeaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading, user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/ambassador/auth');
  }, [authLoading, user]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ambassador_stats' as any)
      .select('*, ambassador_id(full_name, avatar_url, university)')
      .order('total_signups', { ascending: false })
      .limit(20);

    setLeaders(data || []);
    setLoading(false);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  const getRankBg = (index: number) => {
    if (index === 0) return 'border-yellow-500/30 bg-yellow-500/5';
    if (index === 1) return 'border-gray-400/30 bg-gray-400/5';
    if (index === 2) return 'border-amber-700/30 bg-amber-700/5';
    return 'border-border';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/ambassador')} className="p-2 rounded-lg hover:bg-accent">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span className="font-bold text-foreground">Leaderboard</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {leaders.length === 0 ? (
          <Card className="border-border">
            <CardContent className="p-10 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Leaderboard is empty</p>
              <p className="text-sm text-muted-foreground">Be the first to climb the ranks!</p>
            </CardContent>
          </Card>
        ) : (
          leaders.map((leader: any, index: number) => {
            const isMe = leader.ambassador_id?.id === profile?.id || leader.ambassador_id === profile?.id;
            return (
              <Card key={leader.id} className={`${getRankBg(index)} ${isMe ? 'ring-2 ring-primary/50' : ''}`}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-8 flex justify-center shrink-0">
                    {getRankIcon(index)}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {leader.ambassador_id?.avatar_url ? (
                      <img src={leader.ambassador_id.avatar_url} className="w-10 h-10 rounded-full object-cover" alt="" />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {(leader.ambassador_id?.full_name || '?')[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {leader.ambassador_id?.full_name || 'Ambassador'}
                      {isMe && <Badge className="ml-2 text-[10px] bg-primary/10 text-primary border-primary/20">You</Badge>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {leader.ambassador_id?.university || 'Campus Rep'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-foreground">{leader.total_signups}</p>
                    <p className="text-[10px] text-muted-foreground">signups</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AmbassadorLeaderboard;
