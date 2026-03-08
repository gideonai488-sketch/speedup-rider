import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, DollarSign, TrendingUp, Wallet, Loader2, Calendar } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';
import { useCountry } from '@/context/CountryContext';

const AmbassadorEarnings: React.FC = () => {
  const navigate = useNavigate();
  const { profile, loading: authLoading, user } = useAuth();
  const { formatPrice } = useCountry();
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate('/ambassador/auth');
  }, [authLoading, user]);

  useEffect(() => {
    if (!profile) return;
    loadEarnings();
  }, [profile]);

  const loadEarnings = async () => {
    if (!profile) return;
    setLoading(true);

    const { data: statsData } = await supabase
      .from('ambassador_stats' as any)
      .select('*')
      .eq('ambassador_id', profile.id)
      .single();

    if (statsData) setStats(statsData);

    // Get wallet transactions
    const { data: walletData } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', profile.id)
      .single();

    if (walletData) {
      const { data: txns } = await supabase
        .from('transactions')
        .select('*')
        .eq('wallet_id', walletData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setTransactions(txns || []);
    }

    setLoading(false);
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
          <span className="font-bold text-foreground">Earnings</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Balance Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Earned</p>
            <p className="text-4xl font-bold text-foreground mb-1">
              ${(stats?.total_earnings || 0).toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              This month: <span className="text-primary font-semibold">${(stats?.current_month_earnings || 0).toFixed(2)}</span>
            </p>
          </CardContent>
        </Card>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border">
            <CardContent className="p-4">
              <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-lg font-bold text-foreground">${((stats?.total_signups || 0) * 5).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">From Signups</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <DollarSign className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-lg font-bold text-foreground">${((stats?.total_orders_generated || 0) * 0.5).toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">From Orders</p>
            </CardContent>
          </Card>
        </div>

        {/* Payout */}
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Withdraw Earnings</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Minimum withdrawal: $20. Payouts are processed weekly via mobile money or bank transfer.
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              disabled={(stats?.total_earnings || 0) < 20}
            >
              {(stats?.total_earnings || 0) < 20
                ? `Need $${(20 - (stats?.total_earnings || 0)).toFixed(0)} more`
                : 'Request Payout'
              }
            </Button>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Transaction History</h3>
          {transactions.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-8 text-center">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No transactions yet. Start earning by sharing your code!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx: any) => (
                <Card key={tx.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`font-semibold text-sm ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toFixed(2)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default AmbassadorEarnings;
