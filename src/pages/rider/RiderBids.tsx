import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Send, Package, MapPin, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useMyBids } from '@/hooks/useBids';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import BottomNav from '@/components/layout/BottomNav';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'Pending', icon: <Clock className="w-3.5 h-3.5" />, color: 'bg-warning/10 text-warning' },
  accepted: { label: 'Accepted', icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'bg-success/10 text-success' },
  rejected: { label: 'Not Selected', icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-destructive/10 text-destructive' },
};

const RiderBids: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: bids = [], isLoading } = useMyBids(profile?.id || '');

  const formatCurrency = (value: number) => `GH₵ ${value?.toFixed(2) || '0.00'}`;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 h-16">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">My Bids</h1>
            <p className="text-xs text-muted-foreground">{bids.length} total bids</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-5 space-y-3">
        {isLoading && (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-muted-foreground">Loading your bids...</p>
          </div>
        )}

        {!isLoading && bids.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
              <Send className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No bids yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Go online to see available orders and place bids</p>
            <Link to="/rider">
              <Button className="gradient-hero text-white">Go to Dashboard</Button>
            </Link>
          </div>
        )}

        {bids.map((bid: any) => {
          const status = statusConfig[bid.status] || statusConfig.pending;
          const order = bid.orders;
          const isAccepted = bid.status === 'accepted';

          return (
            <div
              key={bid.id}
              className={cn(
                'bg-card rounded-2xl border p-4 transition-all',
                isAccepted ? 'border-success/30 shadow-[0_0_15px_rgba(34,197,94,0.08)]' : 'border-border'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    isAccepted ? 'bg-success/10' : 'bg-secondary'
                  )}>
                    {order?.stores?.logo_url ? (
                      <img src={order.stores.logo_url} alt="" className="w-7 h-7 object-contain rounded-lg" />
                    ) : (
                      <Package className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{order?.stores?.name || order?.order_number || 'Delivery'}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className={cn('flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full', status.color)}>
                  {status.icon}
                  {status.label}
                </div>
              </div>

              {/* Route */}
              <div className="space-y-1.5 text-xs bg-secondary/40 rounded-xl p-3 mb-3">
                {order?.pickup_address && (
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground truncate">{order.pickup_address}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-success mt-1 flex-shrink-0" />
                  <span className="text-foreground font-medium truncate">{order?.delivery_address || 'N/A'}</span>
                </div>
              </div>

              {/* Bid amount + action */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Your Bid</p>
                  <p className={cn('text-lg font-bold', isAccepted ? 'text-success' : 'text-foreground')}>
                    {formatCurrency(Number(bid.amount))}
                  </p>
                </div>
                {isAccepted && order && (
                  <Link to={`/rider/delivery/${order.id}`}>
                    <Button size="sm" className="gradient-hero text-white rounded-xl">
                      Start Delivery
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                )}
                {bid.message && !isAccepted && (
                  <p className="text-xs text-muted-foreground italic max-w-[50%] text-right truncate">
                    "{bid.message}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </main>

      <BottomNav />
    </div>
  );
};

export default RiderBids;
