import React, { useState } from 'react';
import { ArrowLeft, Clock, X, Star, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useOrderBids, useAcceptBid } from '@/hooks/useBids';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BidViewProps {
  orderId: string;
  orderNumber?: string;
  pickupAddress?: string;
  deliveryAddress: string;
  totalAmount: number;
  distanceKm?: number;
  onBack: () => void;
  onCancel?: () => Promise<void>;
  onChat?: (riderId: string, riderName: string, riderPhone?: string) => void;
}

const BidView: React.FC<BidViewProps> = ({
  orderId,
  orderNumber,
  pickupAddress,
  deliveryAddress,
  totalAmount,
  onBack,
  onCancel,
  onChat,
}) => {
  const { data: bids = [], isLoading } = useOrderBids(orderId);
  const acceptBid = useAcceptBid();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleAcceptBid = async (bid: any) => {
    try {
      await acceptBid.mutateAsync({
        bidId: bid.id,
        orderId,
        riderId: bid.rider_id,
        amount: bid.amount,
      });
      toast.success(`Bid accepted! ${bid.profiles?.full_name || 'Rider'} is on the way.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept bid');
    }
  };

  const handleCancelOrder = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel();
      setShowCancelDialog(false);
    } catch {
      // Keep dialog open on error
    } finally {
      setIsCancelling(false);
    }
  };

  const formatCurrency = (value: number) => `GH₵ ${value?.toFixed(2) || '0.00'}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center gap-3 px-4 h-16">
          <button onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Rider Bids</h1>
            <p className="text-xs text-muted-foreground">{orderNumber}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-primary/10 px-3 py-1.5 rounded-full">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Waiting</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-card rounded-2xl border border-border p-4 space-y-3">
          {pickupAddress && (
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">PICKUP</p>
                <p className="text-sm font-medium">{pickupAddress}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">DROPOFF</p>
              <p className="text-sm font-medium">{deliveryAddress}</p>
            </div>
          </div>
        </div>

        {/* Bids List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {bids.length > 0 ? `${bids.length} Bid${bids.length > 1 ? 's' : ''} Received` : 'Waiting for Bids'}
            </h2>
            {bids.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-success">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Live
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground">Loading bids...</p>
            </div>
          )}

          {!isLoading && bids.length === 0 && (
            <div className="flex flex-col items-center py-12">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-4xl">🏍️</span>
              </div>
              <p className="font-semibold text-foreground mb-1">Waiting for rider bids...</p>
              <p className="text-sm text-muted-foreground text-center">
                Online riders can see your delivery and will bid their price. You choose the best one!
              </p>
            </div>
          )}

          <div className="space-y-3">
            {bids.map((bid: any) => (
              <div
                key={bid.id}
                className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {bid.profiles?.full_name?.charAt(0) || 'R'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{bid.profiles?.full_name || 'Rider'}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                      <span>4.8</span>
                      <span>•</span>
                      <span className="capitalize">{bid.profiles?.vehicle_type || 'motorcycle'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">{formatCurrency(Number(bid.amount))}</p>
                  </div>
                </div>

                {bid.message && (
                  <p className="text-sm text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2 mb-3">
                    "{bid.message}"
                  </p>
                )}

                <div className="flex gap-2">
                  {onChat && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onChat(bid.rider_id, bid.profiles?.full_name || 'Rider', bid.profiles?.phone)}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="flex-1 gradient-hero text-white"
                    onClick={() => handleAcceptBid(bid)}
                    disabled={acceptBid.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    {acceptBid.isPending ? 'Accepting...' : 'Accept'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel */}
        {onCancel && (
          <Button
            variant="ghost"
            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => setShowCancelDialog(true)}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel Order
          </Button>
        )}
      </main>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? All bids will be rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Waiting</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleCancelOrder(e); }}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BidView;
