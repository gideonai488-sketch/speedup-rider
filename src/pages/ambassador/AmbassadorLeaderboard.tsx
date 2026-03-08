import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Trophy, Medal, Crown, Loader2, School } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const AmbassadorLeaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading, user } = useAuth();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [campuses, setCampuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/ambassador/auth');
  }, [authLoading, user, navigate]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ambassador_stats' as any)
      .select('*, ambassador_id(id, full_name, avatar_url, university)')
      .order('total_signups', { ascending: false })
      .limit(100);

    const ambassadorData = data || [];
    
    // Top Reps
    setLeaders(ambassadorData.slice(0, 20));

    // Grouping individual stats into university-level stats
    const uniMap: Record<string, { name: string, ambassadors: number, signups: number, orders: number }> = {};
    
    ambassadorData.forEach((stat: any) => {
      const uniName = stat.ambassador_id?.university || 'Unknown Campus';
      if (!uniMap[uniName]) uniMap[uniName] = { name: uniName, ambassadors: 0, signups: 0, orders: 0 };
      uniMap[uniName].ambassadors += 1;
      uniMap[uniName].signups += stat.total_signups || 0;
      uniMap[uniName].orders += stat.total_orders_generated || 0;
    });

    const sortedCampuses = Object.values(uniMap).sort((a, b) => b.signups - a.signups);
    setCampuses(sortedCampuses);

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

  const userUniversity = (profile as any)?.university;

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

      <div className="container mx-auto px-4 py-6 space-y-4">
        <Tabs defaultValue="reps" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="reps">Top Reps</TabsTrigger>
            <TabsTrigger value="campuses">Top Campuses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reps" className="space-y-3">
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
                const isMe = leader.ambassador_id?.id === profile?.id;
                return (
                  <Card key={leader.id} className={`${getRankBg(index)} ${isMe ? 'ring-2 ring-primary/50' : ''}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-8 flex justify-center shrink-0">
                        {getRankIcon(index)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {leader.ambassador_id?.avatar_url ? (
                          <img src={leader.ambassador_id.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <span className="text-sm font-bold text-primary">
                            {(leader.ambassador_id?.full_name || '?')[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate flex items-center gap-2">
                          {leader.ambassador_id?.full_name || 'Ambassador'}
                          {isMe && <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">You</Badge>}
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
          </TabsContent>

          <TabsContent value="campuses" className="space-y-3">
            {campuses.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-10 text-center">
                  <School className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-medium text-foreground mb-1">No campuses yet</p>
                  <p className="text-sm text-muted-foreground">Get your university on the map!</p>
                </CardContent>
              </Card>
            ) : (
              campuses.map((campus: any, index: number) => {
                const isMyUni = campus.name === userUniversity && userUniversity;
                return (
                  <Card key={campus.name} className={`${getRankBg(index)} ${isMyUni ? 'ring-2 ring-primary/50' : ''}`}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-8 flex justify-center shrink-0">
                        {getRankIcon(index)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <School className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate flex items-center gap-2">
                          {campus.name}
                          {isMyUni && <Badge variant="outline" className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-primary/20">Your Uni</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {campus.ambassadors} rep{campus.ambassadors !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-foreground">{campus.signups}</p>
                        <p className="text-[10px] text-muted-foreground">total signups</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default AmbassadorLeaderboard;
