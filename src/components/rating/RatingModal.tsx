import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, ThumbsUp, User, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  riderId?: string;
  storeId?: string;
  riderName?: string;
  storeName?: string;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  orderId,
  riderId,
  storeId,
  riderName = 'Your Rider',
  storeName = 'The Store',
}) => {
  const { profile } = useAuth();
  const [riderRating, setRiderRating] = useState(0);
  const [storeRating, setStoreRating] = useState(0);
  const [hoverRider, setHoverRider] = useState(0);
  const [hoverStore, setHoverStore] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'rider' | 'store' | 'comment' | 'done'>('rider');

  const handleSubmit = async () => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('ratings').insert({
        order_id: orderId,
        customer_id: profile.id,
        rider_id: riderId || null,
        store_id: storeId || null,
        rider_rating: riderRating || null,
        store_rating: storeRating || null,
        comment: comment.trim() || null,
      });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setStep('done');
      setTimeout(onClose, 1500);
    } catch (error) {
      console.error('Failed to submit rating:', error);
      toast.error('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    rating,
    hover,
    setRating,
    setHover,
  }: {
    rating: number;
    hover: number;
    setRating: (v: number) => void;
    setHover: (v: number) => void;
  }) => (
    <div className="flex gap-2 justify-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-1 transition-transform hover:scale-110"
        >
          <Star
            className={cn(
              'w-10 h-10 transition-colors',
              (hover || rating) >= star
                ? 'fill-warning text-warning'
                : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent!';
      default:
        return 'Tap to rate';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {step === 'done' ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
              <ThumbsUp className="w-10 h-10 text-success" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Thank you!</h3>
            <p className="text-muted-foreground mt-2">Your feedback helps us improve</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-center">
                {step === 'rider' && 'Rate Your Rider'}
                {step === 'store' && 'Rate The Store'}
                {step === 'comment' && 'Any Comments?'}
              </DialogTitle>
              <DialogDescription className="text-center">
                {step === 'rider' && `How was your delivery experience with ${riderName}?`}
                {step === 'store' && `How was your experience with ${storeName}?`}
                {step === 'comment' && 'Share any additional feedback (optional)'}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              {step === 'rider' && riderId && (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <StarRating
                    rating={riderRating}
                    hover={hoverRider}
                    setRating={setRiderRating}
                    setHover={setHoverRider}
                  />
                  <p className="text-center text-muted-foreground">
                    {getRatingLabel(hoverRider || riderRating)}
                  </p>
                </div>
              )}

              {step === 'store' && storeId && (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Store className="w-8 h-8 text-primary" />
                  </div>
                  <StarRating
                    rating={storeRating}
                    hover={hoverStore}
                    setRating={setStoreRating}
                    setHover={setHoverStore}
                  />
                  <p className="text-center text-muted-foreground">
                    {getRatingLabel(hoverStore || storeRating)}
                  </p>
                </div>
              )}

              {step === 'comment' && (
                <Textarea
                  placeholder="Tell us more about your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              )}
            </div>

            <div className="flex gap-3">
              {step !== 'rider' && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (step === 'store') setStep('rider');
                    if (step === 'comment') setStep(storeId ? 'store' : 'rider');
                  }}
                >
                  Back
                </Button>
              )}
              <Button
                className="flex-1"
                onClick={() => {
                  if (step === 'rider') {
                    if (storeId) setStep('store');
                    else setStep('comment');
                  } else if (step === 'store') {
                    setStep('comment');
                  } else {
                    handleSubmit();
                  }
                }}
                disabled={
                  (step === 'rider' && riderId && !riderRating) ||
                  (step === 'store' && storeId && !storeRating) ||
                  isSubmitting
                }
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : step === 'comment' ? (
                  'Submit'
                ) : (
                  'Next'
                )}
              </Button>
            </div>

            {step !== 'comment' && (
              <button
                onClick={() => setStep('comment')}
                className="text-sm text-muted-foreground hover:text-foreground text-center w-full mt-2"
              >
                Skip
              </button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;