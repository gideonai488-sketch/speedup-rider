import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft,
  CreditCard, Smartphone, Building2, Gift, Sparkles, ChevronRight, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWallet, useTransactions, useTopUpWallet } from '@/hooks/useWallet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import BottomNav from '@/components/layout/BottomNav';

const topUpOptions = [50, 100, 200, 500];

const getTransactionIcon = (type: string): string => {
  switch (type) {
    case 'deposit': return '💳';
    case 'withdrawal': return '💸';
    case 'order_payment': return '🛒';
    case 'order_refund': return '↩️';
    case 'rider_earning': return '🏍️';
    case 'referral_bonus': return '🎁';
    default: return '💰';
  }
};

const getTransactionLabel = (type: string): string => {
  switch (type) {
    case 'deposit': return 'Wallet Top-up';
    case 'withdrawal': return 'Withdrawal';
    case 'order_payment': return 'Order Payment';
    case 'order_refund': return 'Order Refund';
    case 'rider_earning': return 'Delivery Earning';
    case 'referral_bonus': return 'Referral Bonus';
    default: return 'Transaction';
  }
};

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  
  const { data: wallet, isLoading: walletLoading } = useWallet();
  const { data: transactions = [], isLoading: txLoading } = useTransactions();
  const topUpMutation = useTopUpWallet();

  const handleTopUp = (amount: number) => {
    setTopUpAmount(amount.toString());
  };

  const handleConfirmTopUp = async () => {
    const amount = parseFloat(topUpAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await topUpMutation.mutateAsync(amount);
      toast.success(`GH₵ ${amount} added to your wallet!`);
      setShowTopUp(false);
      setTopUpAmount('');
    } catch (error) {
      toast.error('Failed to top up wallet');
    }
  };

  const balance = wallet?.balance || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-accent pt-12 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-10 w-60 h-60 bg-accent/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-lg mx-auto relative">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">SpeedUp Wallet</h1>
          </div>

          {/* Balance Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Available Balance</p>
                {walletLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-white" />
                ) : (
                  <p className="text-3xl font-bold text-white">GH₵ {balance.toFixed(2)}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowTopUp(true)}
                className="flex-1 bg-white text-primary hover:bg-white/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Money
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-white/30 text-white hover:bg-white/20"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Transfer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8">
        {/* Quick Actions */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-lg mb-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              { icon: <CreditCard className="w-5 h-5" />, label: 'Card' },
              { icon: <Smartphone className="w-5 h-5" />, label: 'MoMo' },
              { icon: <Building2 className="w-5 h-5" />, label: 'Bank' },
              { icon: <Gift className="w-5 h-5" />, label: 'Gift Card' },
            ].map((item) => (
              <button
                key={item.label}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-accent/20 to-accent/10 rounded-2xl p-4 border border-accent/30 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">10% Cashback</p>
              <p className="text-sm text-muted-foreground">On your next 3 orders</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-4">Recent Transactions</h2>
          {txLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <WalletIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isCredit = ['deposit', 'order_refund', 'referral_bonus', 'rider_earning'].includes(tx.type);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                  >
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">
                      {getTransactionIcon(tx.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {tx.description || getTransactionLabel(tx.type)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tx.created_at), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className={cn(
                      'flex items-center gap-1 font-bold',
                      isCredit ? 'text-success' : 'text-foreground'
                    )}>
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span>{isCredit ? '+' : '-'}GH₵{Math.abs(tx.amount).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top-up Modal */}
      {showTopUp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <div className="w-full bg-background rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Add Money</h2>
              <button 
                onClick={() => setShowTopUp(false)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {topUpOptions.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleTopUp(amount)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center font-bold transition-all',
                    topUpAmount === amount.toString()
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-foreground hover:border-primary/50'
                  )}
                >
                  GH₵{amount}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-sm text-muted-foreground mb-2 block">Or enter amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">GH₵</span>
                <Input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-14 text-lg font-bold"
                />
              </div>
            </div>

            <Button 
              className="w-full gradient-hero text-white"
              disabled={!topUpAmount || topUpMutation.isPending}
              onClick={handleConfirmTopUp}
            >
              {topUpMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Add GH₵${topUpAmount || '0'}`
              )}
            </Button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Wallet;
