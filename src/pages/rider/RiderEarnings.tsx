import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  ArrowLeft, Wallet, Zap, Clock, User, TrendingUp, ArrowDownLeft,
  Calendar, ChevronRight, Loader2, DollarSign, Bike, Building2, 
  CheckCircle2, CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRiderWallet } from '@/hooks/useWallet';
import { useRiderDeliveryStats } from '@/hooks/useAdminData';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

// Note: Platform fee is handled separately - rider keeps full delivery fee

interface BankDetails {
  bank_name: string | null;
  bank_code: string | null;
  account_number: string | null;
  account_name: string | null;
  subaccount_code: string | null;
}

const RiderEarnings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  
  const { data: walletData, isLoading: walletLoading } = useRiderWallet();
  const { data: stats, isLoading: statsLoading } = useRiderDeliveryStats(profile?.id || '');

  const isLoading = walletLoading || statsLoading;

  // Fetch bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!profile?.id) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('bank_name, bank_code, account_number, account_name, subaccount_code')
        .eq('id', profile.id)
        .single();
      
      if (data) {
        setBankDetails(data);
      }
    };
    
    fetchBankDetails();
  }, [profile?.id]);

  // Calculate daily earnings for the week chart
  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 0 }),
    end: endOfWeek(new Date(), { weekStartsOn: 0 }),
  });

  const dailyEarnings = weekDays.map(day => {
    const dayEarnings = walletData?.transactions
      ?.filter(tx => isSameDay(new Date(tx.created_at), day))
      .reduce((sum, tx) => sum + tx.amount, 0) || 0;
    return {
      day: format(day, 'EEE'),
      earnings: dayEarnings,
      isToday: isSameDay(day, new Date()),
    };
  });

  const maxDailyEarning = Math.max(...dailyEarnings.map(d => d.earnings), 100);

  const formatCurrency = (amount: number) => `GH₵ ${amount.toFixed(2)}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-dark text-white px-4 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Earnings</h1>
        </div>

        {/* Balance Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Total Earnings</p>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <p className="text-3xl font-bold">{formatCurrency(walletData?.totalEarnings || 0)}</p>
              )}
            </div>
            <div className="w-14 h-14 rounded-2xl bg-success/20 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-success" />
            </div>
          </div>
          
          {/* Bank Details Display */}
          {bankDetails?.subaccount_code ? (
            <div className="bg-white/10 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-medium">Payout Account Active</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Building2 className="w-4 h-4" />
                <span>{bankDetails.bank_name}</span>
              </div>
              <p className="text-white/60 text-xs mt-1 ml-6">
                {bankDetails.account_number} • {bankDetails.account_name}
              </p>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/rider/profile')}
              className="w-full bg-warning/20 text-warning rounded-xl p-3 text-sm text-left"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="font-medium">Set up bank details to receive payouts</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </div>
            </button>
          )}
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        {/* Period Selector */}
        <div className="flex gap-2 p-1 bg-secondary rounded-xl">
          {(['today', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize',
                selectedPeriod === period 
                  ? 'bg-primary text-primary-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">
                {selectedPeriod === 'today' ? "Today's" : selectedPeriod === 'week' ? "This Week's" : "This Month's"} Earnings
              </span>
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(selectedPeriod === 'today' 
                  ? (walletData?.todayEarnings || 0)
                  : selectedPeriod === 'week'
                  ? (walletData?.weekEarnings || 0)
                  : (walletData?.totalEarnings || 0)
                )}
              </p>
            )}
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bike className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Deliveries</span>
            </div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <p className="text-xl font-bold text-foreground">
                {selectedPeriod === 'today' 
                  ? (stats?.todayDeliveries || 0)
                  : selectedPeriod === 'week'
                  ? (stats?.weekDeliveries || 0)
                  : (stats?.totalDeliveries || 0)
                }
              </p>
            )}
          </div>
        </div>

        {/* Payout Info */}
        <div className="bg-success/10 rounded-xl border border-success/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="font-medium text-foreground">Direct bank payouts!</p>
              <p className="text-sm text-muted-foreground mt-1">
                Earnings are sent directly to your bank/MoMo account after each completed delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">This Week</h3>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
            </div>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-32">
            {dailyEarnings.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  {day.earnings > 0 && (
                    <span className="text-xs text-muted-foreground mb-1">
                      {day.earnings.toFixed(0)}
                    </span>
                  )}
                  <div 
                    className={cn(
                      'w-full rounded-t-lg transition-all',
                      day.isToday ? 'bg-primary' : 'bg-primary/30'
                    )}
                    style={{ 
                      height: `${Math.max((day.earnings / maxDailyEarning) * 80, 4)}px`,
                      minHeight: '4px'
                    }}
                  />
                </div>
                <span className={cn(
                  'text-xs',
                  day.isToday ? 'text-primary font-medium' : 'text-muted-foreground'
                )}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Recent Earnings</h3>
            <Link to="/rider/history" className="text-sm text-primary flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : walletData?.transactions?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No earnings yet</p>
              <p className="text-sm">Complete deliveries to start earning</p>
            </div>
          ) : (
            <div className="space-y-3">
              {walletData?.transactions?.slice(0, 10).map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <ArrowDownLeft className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {tx.description || 'Delivery Earning'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM d • h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">+{formatCurrency(tx.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border px-6 py-3 safe-area-pb">
        <div className="flex items-center justify-around">
          <Link to="/rider" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Zap className="w-5 h-5" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/rider/earnings" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider/earnings' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Wallet className="w-5 h-5" />
            <span className="text-xs">Earnings</span>
          </Link>
          <Link to="/rider/deliveries" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider/deliveries' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Clock className="w-5 h-5" />
            <span className="text-xs">History</span>
          </Link>
          <Link to="/rider/profile" className={cn("flex flex-col items-center gap-1", location.pathname === '/rider/profile' ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default RiderEarnings;
