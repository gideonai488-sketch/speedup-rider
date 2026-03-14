import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/context/CountryContext';
import BottomNav from '@/components/layout/BottomNav';
import {
  ArrowLeft, Loader2, DollarSign, TrendingUp, TrendingDown, Calendar, Wallet, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';

const MerchantFinance: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { formatPrice } = useCountry();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    pendingPayouts: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;
    fetchFinance();
  }, [profile]);

  const fetchFinance = async () => {
    if (!profile) return;
    const { data: store } = await supabase.from('stores').select('id').eq('owner_id', profile.id).maybeSingle();
    if (!store) { setLoading(false); return; }

    const { data: orders } = await supabase
      .from('orders')
      .select('subtotal, payment_status, created_at, status')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false });

    const paidOrders = orders?.filter(o => o.payment_status === 'paid') || [];
    const now = new Date();
    const thisMonth = paidOrders.filter(o => new Date(o.created_at).getMonth() === now.getMonth() && new Date(o.created_at).getFullYear() === now.getFullYear());
    const lastMonth = paidOrders.filter(o => {
      const d = new Date(o.created_at);
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    });

    const totalRevenue = paidOrders.reduce((s, o) => s + (o.subtotal || 0), 0);
    const thisMonthRevenue = thisMonth.reduce((s, o) => s + (o.subtotal || 0), 0);
    const lastMonthRevenue = lastMonth.reduce((s, o) => s + (o.subtotal || 0), 0);

    setStats({
      totalRevenue,
      thisMonthRevenue,
      lastMonthRevenue,
      totalOrders: paidOrders.length,
      avgOrderValue: paidOrders.length ? totalRevenue / paidOrders.length : 0,
      pendingPayouts: 0,
    });

    setRecentTransactions(
      (orders || []).slice(0, 20).map(o => ({
        date: o.created_at,
        amount: o.subtotal,
        status: o.payment_status,
        orderStatus: o.status,
      }))
    );

    setLoading(false);
  };

  const growthPercent = stats.lastMonthRevenue > 0
    ? Math.round(((stats.thisMonthRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100)
    : stats.thisMonthRevenue > 0 ? 100 : 0;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Finance</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Revenue Overview */}
        <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <CardContent className="p-6">
            <p className="text-sm opacity-80 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold mb-4">{formatPrice(stats.totalRevenue)}</p>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs opacity-70">This Month</p>
                <p className="text-lg font-bold">{formatPrice(stats.thisMonthRevenue)}</p>
              </div>
              <div className="flex items-center gap-1">
                {growthPercent >= 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-300" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-300" />
                )}
                <span className={`text-sm font-bold ${growthPercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {growthPercent}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: DollarSign, label: 'Avg Order', value: formatPrice(stats.avgOrderValue) },
            { icon: TrendingUp, label: 'Total Orders', value: stats.totalOrders },
            { icon: Wallet, label: 'Pending', value: formatPrice(stats.pendingPayouts) },
          ].map((m) => (
            <Card key={m.label}>
              <CardContent className="p-3 text-center">
                <m.icon className="w-5 h-5 mx-auto text-primary mb-1" />
                <p className="text-lg font-bold text-foreground">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-6">No transactions yet</p>
            ) : (
              recentTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Order Sale</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatPrice(tx.amount)}</p>
                    <Badge variant={tx.status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default MerchantFinance;
