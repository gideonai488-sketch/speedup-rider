import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw, X, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnlineRiders } from '@/hooks/useRiderLocation';
import { cn } from '@/lib/utils';
import BidView from '@/components/tracking/BidView';
import BrowseRiders from '@/components/rider/BrowseRiders';
import ChatView from '@/components/chat/ChatView';
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

interface FindingRiderProps {
  pickupLat?: number;
  pickupLng?: number;
  pickupAddress?: string;
  deliveryAddress: string;
  orderNumber?: string;
  orderId?: string;
  totalAmount: number;
  onBack: () => void;
  onCancel?: () => Promise<void>;
}

const SEARCH_RADII = [5, 10, 15, 20];
const SEARCH_INTERVAL = 8000;

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

type Mode = 'choose' | 'auto' | 'browse' | 'bids' | 'chat';

const FindingRider: React.FC<FindingRiderProps> = ({
  pickupLat, pickupLng, pickupAddress, deliveryAddress,
  orderNumber, orderId, totalAmount, onBack, onCancel,
}) => {
  const [mode, setMode] = useState<Mode>('choose');
  const [currentRadiusIndex, setCurrentRadiusIndex] = useState(0);
  const [searchComplete, setSearchComplete] = useState(false);
  const [ridersInRange, setRidersInRange] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [chatTarget, setChatTarget] = useState<{ id: string; name: string; phone?: string } | null>(null);
  const { data: onlineRiders } = useOnlineRiders();

  const currentRadius = SEARCH_RADII[currentRadiusIndex];

  const countRidersInRadius = useCallback(() => {
    if (!onlineRiders || !pickupLat || !pickupLng) return 0;
    return onlineRiders.filter(rider => {
      const distance = calculateDistance(pickupLat, pickupLng, rider.latitude, rider.longitude);
      return distance <= currentRadius;
    }).length;
  }, [onlineRiders, pickupLat, pickupLng, currentRadius]);

  useEffect(() => {
    if (mode !== 'auto' || searchComplete) return;
    const ridersFound = countRidersInRadius();
    setRidersInRange(ridersFound);
    if (ridersFound > 0 || currentRadiusIndex >= SEARCH_RADII.length - 1) return;
    const timer = setTimeout(() => {
      setCurrentRadiusIndex(prev => {
        if (prev < SEARCH_RADII.length - 1) return prev + 1;
        setSearchComplete(true);
        return prev;
      });
    }, SEARCH_INTERVAL);
    return () => clearTimeout(timer);
  }, [currentRadiusIndex, countRidersInRadius, searchComplete, mode]);

  useEffect(() => {
    if (mode === 'auto') setRidersInRange(countRidersInRadius());
  }, [countRidersInRadius, mode]);

  const handleCancelOrder = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (!onCancel) return;
    setIsCancelling(true);
    try { await onCancel(); setShowCancelDialog(false); } 
    catch { /* keep open */ } 
    finally { setIsCancelling(false); }
  };

  const formatCurrency = (value: number) => `GH₵ ${value?.toFixed(2) || '0.00'}`;
  const getRadiusScale = (radius: number) => (radius / SEARCH_RADII[SEARCH_RADII.length - 1]) * 100;

  // Chat mode
  if (mode === 'chat' && chatTarget) {
    return (
      <ChatView
        otherProfileId={chatTarget.id}
        otherName={chatTarget.name}
        otherPhone={chatTarget.phone}
        orderId={orderId}
        onBack={() => setMode('bids')}
      />
    );
  }

  // Bid view mode
  if (mode === 'bids' && orderId) {
    return (
      <BidView
        orderId={orderId}
        orderNumber={orderNumber}
        pickupAddress={pickupAddress}
        deliveryAddress={deliveryAddress}
        totalAmount={totalAmount}
        onBack={() => setMode('choose')}
        onCancel={onCancel}
        onChat={(riderId, name, phone) => {
          setChatTarget({ id: riderId, name, phone });
          setMode('chat');
        }}
      />
    );
  }

  // Browse riders mode
  if (mode === 'browse') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center gap-3 px-4 h-16">
            <button onClick={() => setMode('choose')}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">Browse Riders</h1>
              <p className="text-xs text-muted-foreground">Choose a rider to deliver</p>
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6">
          <BrowseRiders
            userLat={pickupLat}
            userLng={pickupLng}
            onSelectRider={(rider) => {
              // Start chat with selected rider
              setChatTarget({
                id: rider.rider_id,
                name: rider.profile?.full_name || 'Rider',
                phone: rider.profile?.phone,
              });
              setMode('chat');
            }}
            onChat={(rider) => {
              setChatTarget({
                id: rider.rider_id,
                name: rider.profile?.full_name || 'Rider',
                phone: rider.profile?.phone,
              });
              setMode('chat');
            }}
          />
        </main>
      </div>
    );
  }

  // Choose mode (default) - two options
  if (mode === 'choose') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="flex items-center gap-3 px-4 h-16">
            <button onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">Find a Rider</h1>
              <p className="text-xs text-muted-foreground">{orderNumber}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-glow mb-6">
            <span className="text-4xl">🏍️</span>
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">How would you like to find a rider?</h2>
          <p className="text-muted-foreground text-center mb-8">
            Choose to receive bids from riders or browse and select one yourself.
          </p>

          <div className="w-full max-w-sm space-y-4">
            {/* Option 1: Get Bids */}
            <button
              onClick={() => setMode('bids')}
              className="w-full bg-card rounded-2xl border-2 border-border p-5 hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Get Rider Bids</p>
                  <p className="text-sm text-muted-foreground">
                    Post your delivery and let riders bid their price. Pick the best offer!
                  </p>
                </div>
              </div>
            </button>

            {/* Option 2: Browse Riders */}
            <button
              onClick={() => setMode('browse')}
              className="w-full bg-card rounded-2xl border-2 border-border p-5 hover:border-primary/50 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7 text-success" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Browse Riders</p>
                  <p className="text-sm text-muted-foreground">
                    See online riders, chat or call them, and choose who you want.
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Order Summary */}
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border/50 p-4 space-y-3 mt-8">
            {pickupAddress && (
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">PICKUP</p>
                  <p className="text-sm font-medium">{pickupAddress}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full bg-success mt-1.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">DROPOFF</p>
                <p className="text-sm font-medium">{deliveryAddress}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-border flex justify-between">
              <span className="text-muted-foreground">Estimated Total</span>
              <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {onCancel && (
            <Button
              variant="ghost"
              className="mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
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
              <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isCancelling}>Keep Order</AlertDialogCancel>
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
  }

  // Auto mode (legacy radar - kept as fallback)
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 gradient-glass border-b border-border/50 safe-area-inset">
        <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
          <button onClick={() => setMode('choose')}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Finding Rider</h1>
            <p className="text-xs text-muted-foreground">{orderNumber}</p>
          </div>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Searching...</p>
      </div>
    </div>
  );
};

export default FindingRider;
