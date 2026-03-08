import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft, Gift, Users, Copy, Share2, Check,
  Wallet, Star, ChevronRight, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Referral {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed';
  reward: number;
}

const referrals: Referral[] = [
  { id: '1', name: 'Kofi M.', date: '2 days ago', status: 'completed', reward: 20 },
  { id: '2', name: 'Ama K.', date: '5 days ago', status: 'completed', reward: 20 },
  { id: '3', name: 'Yaw F.', date: '1 week ago', status: 'pending', reward: 20 },
];

const Referral: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const referralCode = 'SPEED2024';
  const referralLink = `https://speedup.app/ref/${referralCode}`;
  const totalEarned = 40;
  const pendingRewards = 20;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SpeedRush',
          text: `Get GH₵20 off your first order! Use my code: ${referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-accent via-accent/90 to-primary pt-12 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-primary/20 rounded-full blur-3xl" />
          {/* Floating gift icons */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-white/20 animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.3}s`,
                fontSize: `${16 + (i % 3) * 8}px`,
              }}
            >
              🎁
            </div>
          ))}
        </div>
        
        <div className="max-w-lg mx-auto relative">
          <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">Refer & Earn</h1>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Gift className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Give GH₵20, Get GH₵20
            </h2>
            <p className="text-white/80">
              Invite friends to SpeedRush and you both get GH₵20 wallet credit
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-2xl p-4 border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-success" />
              </div>
              <span className="text-sm text-muted-foreground">Earned</span>
            </div>
            <p className="text-2xl font-bold text-success">GH₵{totalEarned}</p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-warning/20 flex items-center justify-center">
                <Star className="w-4 h-4 text-warning" />
              </div>
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <p className="text-2xl font-bold text-warning">GH₵{pendingRewards}</p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg mb-6">
          <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-secondary rounded-xl px-4 py-3">
              <p className="text-2xl font-bold text-primary tracking-wider">{referralCode}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="h-14 w-14 rounded-xl"
            >
              {copied ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>

          <div className="relative mb-4">
            <Input
              value={referralLink}
              readOnly
              className="pr-12 text-sm text-muted-foreground"
            />
          </div>

          <Button 
            onClick={handleShare}
            className="w-full gradient-hero text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Invite Link
          </Button>
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 mb-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            How it works
          </h3>
          <div className="space-y-4">
            {[
              { step: '1', text: 'Share your unique referral code with friends' },
              { step: '2', text: 'They sign up and complete their first order' },
              { step: '3', text: 'You both get GH₵20 credited to your wallet' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                  {item.step}
                </div>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Referral History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Your Referrals</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              {referrals.length} friends
            </div>
          </div>
          
          <div className="space-y-3">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {ref.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{ref.name}</p>
                  <p className="text-sm text-muted-foreground">{ref.date}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'font-bold',
                    ref.status === 'completed' ? 'text-success' : 'text-warning'
                  )}>
                    +GH₵{ref.reward}
                  </p>
                  <p className={cn(
                    'text-xs capitalize',
                    ref.status === 'completed' ? 'text-success' : 'text-warning'
                  )}>
                    {ref.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referral;
