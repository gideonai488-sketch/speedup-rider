import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnlineRiders } from '@/hooks/useRiderLocation';
import { cn } from '@/lib/utils';
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
  totalAmount: number;
  onBack: () => void;
  onCancel?: () => Promise<void>;
}

const SEARCH_RADII = [5, 10, 15, 20]; // km
const SEARCH_INTERVAL = 8000; // 8 seconds per radius

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const FindingRider: React.FC<FindingRiderProps> = ({
  pickupLat,
  pickupLng,
  pickupAddress,
  deliveryAddress,
  orderNumber,
  totalAmount,
  onBack,
  onCancel,
}) => {
  const [currentRadiusIndex, setCurrentRadiusIndex] = useState(0);
  const [searchComplete, setSearchComplete] = useState(false);
  const [ridersInRange, setRidersInRange] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const { data: onlineRiders } = useOnlineRiders();

  const currentRadius = SEARCH_RADII[currentRadiusIndex];

  // Count riders within current radius
  const countRidersInRadius = useCallback(() => {
    if (!onlineRiders || !pickupLat || !pickupLng) return 0;
    
    return onlineRiders.filter(rider => {
      const distance = calculateDistance(
        pickupLat,
        pickupLng,
        rider.latitude,
        rider.longitude
      );
      return distance <= currentRadius;
    }).length;
  }, [onlineRiders, pickupLat, pickupLng, currentRadius]);

  // Expand search radius progressively
  useEffect(() => {
    if (searchComplete) return;

    const ridersFound = countRidersInRadius();
    setRidersInRange(ridersFound);

    // If we found riders or reached max radius, stop expanding
    if (ridersFound > 0 || currentRadiusIndex >= SEARCH_RADII.length - 1) {
      return;
    }

    // Expand to next radius after interval
    const timer = setTimeout(() => {
      setCurrentRadiusIndex(prev => {
        if (prev < SEARCH_RADII.length - 1) {
          return prev + 1;
        }
        setSearchComplete(true);
        return prev;
      });
    }, SEARCH_INTERVAL);

    return () => clearTimeout(timer);
  }, [currentRadiusIndex, countRidersInRadius, searchComplete]);

  // Update rider count when radius changes
  useEffect(() => {
    setRidersInRange(countRidersInRadius());
  }, [countRidersInRadius]);

  const handleRetrySearch = () => {
    setCurrentRadiusIndex(0);
    setSearchComplete(false);
  };

  const handleCancelOrder = async () => {
    if (!onCancel) return;
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const formatCurrency = (value: number) => `GH₵ ${value?.toFixed(2) || '0.00'}`;

  // Calculate ring sizes based on radius
  const getRadiusScale = (radius: number) => {
    const maxRadius = SEARCH_RADII[SEARCH_RADII.length - 1];
    return (radius / maxRadius) * 100;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 gradient-glass border-b border-border/50 safe-area-inset">
        <div className="flex items-center gap-3 px-4 h-16 max-w-lg mx-auto">
          <button onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Finding Rider</h1>
            <p className="text-xs text-muted-foreground">{orderNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Searching</p>
            <p className="text-sm font-bold text-primary">{currentRadius} km</p>
          </div>
        </div>
      </header>

      {/* Finding Rider Animation */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Animated radar with expanding rings */}
        <div className="relative w-56 h-56 mb-8">
          {/* Background rings showing search progression */}
          {SEARCH_RADII.map((radius, index) => {
            const scale = getRadiusScale(radius);
            const isActive = index <= currentRadiusIndex;
            const isCurrent = index === currentRadiusIndex;
            
            return (
              <div
                key={radius}
                className={cn(
                  "absolute rounded-full border-2 transition-all duration-1000",
                  isActive ? "border-primary/40" : "border-muted-foreground/10",
                  isCurrent && "border-primary"
                )}
                style={{
                  width: `${scale}%`,
                  height: `${scale}%`,
                  left: `${(100 - scale) / 2}%`,
                  top: `${(100 - scale) / 2}%`,
                }}
              />
            );
          })}
          
          {/* Active pulsing animation for current radius */}
          <div 
            className="absolute rounded-full bg-primary/10 animate-ping"
            style={{ 
              animationDuration: '2s',
              width: `${getRadiusScale(currentRadius)}%`,
              height: `${getRadiusScale(currentRadius)}%`,
              left: `${(100 - getRadiusScale(currentRadius)) / 2}%`,
              top: `${(100 - getRadiusScale(currentRadius)) / 2}%`,
            }}
          />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full gradient-hero flex items-center justify-center shadow-glow">
              <span className="text-4xl">🏍️</span>
            </div>
          </div>

          {/* Radius labels */}
          {SEARCH_RADII.map((radius, index) => {
            const isActive = index <= currentRadiusIndex;
            if (!isActive) return null;
            
            const scale = getRadiusScale(radius);
            return (
              <div
                key={`label-${radius}`}
                className="absolute text-xs font-medium text-primary"
                style={{
                  right: `${(100 - scale) / 2 - 2}%`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                {radius}km
              </div>
            );
          })}
        </div>

        {/* Status Messages */}
        {!searchComplete ? (
          <>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Searching within {currentRadius} km...
            </h2>
            <p className="text-muted-foreground mb-2">
              {ridersInRange > 0 
                ? `${ridersInRange} rider${ridersInRange > 1 ? 's' : ''} nearby. Waiting for acceptance...`
                : 'Looking for available riders in your area.'}
            </p>
            {currentRadiusIndex < SEARCH_RADII.length - 1 && ridersInRange === 0 && (
              <p className="text-xs text-muted-foreground">
                Expanding search to {SEARCH_RADII[currentRadiusIndex + 1]} km soon...
              </p>
            )}
          </>
        ) : (
          <>
            {ridersInRange === 0 ? (
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6 text-warning" />
                </div>
                <h2 className="text-xl font-bold text-foreground">No Riders Available</h2>
                <p className="text-muted-foreground">
                  We couldn't find any riders within {SEARCH_RADII[SEARCH_RADII.length - 1]} km. Please try again in a few minutes.
                </p>
                <Button onClick={handleRetrySearch} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Retry Search
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {ridersInRange} Rider{ridersInRange > 1 ? 's' : ''} Found
                </h2>
                <p className="text-muted-foreground">
                  Waiting for a rider to accept your delivery request...
                </p>
              </>
            )}
          </>
        )}

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

        {/* Cancel Order Button */}
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
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>Keep Searching</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FindingRider;
