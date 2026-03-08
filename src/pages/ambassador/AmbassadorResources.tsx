import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft, Download, FileText, Image, Share2, Megaphone,
  MessageSquare, Video, BookOpen, ExternalLink
} from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

const RESOURCES = [
  {
    category: 'Social Media Kit',
    items: [
      { title: 'Instagram Story Templates', desc: '10 ready-to-post story designs', icon: <Image className="w-5 h-5" />, type: 'Coming Soon' },
      { title: 'Post Captions Library', desc: '20+ engaging captions with hashtags', icon: <MessageSquare className="w-5 h-5" />, type: 'Coming Soon' },
      { title: 'TikTok Video Scripts', desc: 'Viral-ready video ideas and scripts', icon: <Video className="w-5 h-5" />, type: 'Coming Soon' },
    ],
  },
  {
    category: 'Print Materials',
    items: [
      { title: 'Campus Flyers (PDF)', desc: 'Ready-to-print A4 flyers with QR code', icon: <FileText className="w-5 h-5" />, type: 'Coming Soon' },
      { title: 'Table Banner Design', desc: 'For campus events and orientations', icon: <Image className="w-5 h-5" />, type: 'Coming Soon' },
    ],
  },
  {
    category: 'Training',
    items: [
      { title: 'Ambassador Playbook', desc: 'Step-by-step guide to growing your campus', icon: <BookOpen className="w-5 h-5" />, type: 'Coming Soon' },
      { title: 'Pitch Deck', desc: 'Present SpeedUp at student orgs and events', icon: <Megaphone className="w-5 h-5" />, type: 'Coming Soon' },
    ],
  },
];

const TIPS = [
  '🎯 Post your referral code in your Instagram bio and stories',
  '📱 Share in class WhatsApp/GroupMe groups during meal times',
  '🎤 Pitch at student org meetings — 2 min is all you need',
  '🍕 Host a "free delivery" event with your promo codes',
  '📸 Film a short TikTok showing a SpeedUp delivery in action',
  '🤝 Partner with campus food vendors — they want more orders too',
];

const AmbassadorResources: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate('/ambassador')} className="p-2 rounded-lg hover:bg-accent">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-bold text-foreground">Resources</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Pro Tips */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">🔥 Pro Tips</h3>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5 space-y-3">
              {TIPS.map((tip, i) => (
                <p key={i} className="text-sm text-foreground">{tip}</p>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Resource Categories */}
        {RESOURCES.map((category) => (
          <div key={category.category} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{category.category}</h3>
            <div className="space-y-2">
              {category.items.map((item) => (
                <Card key={item.title} className="border-border">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {item.type}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <Card className="border-border">
          <CardContent className="p-5 text-center">
            <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Reach out to the ambassador support team for personalized assistance.
            </p>
            <Button variant="outline" className="border-primary/30 text-primary">
              <MessageSquare className="w-4 h-4 mr-2" /> Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default AmbassadorResources;
