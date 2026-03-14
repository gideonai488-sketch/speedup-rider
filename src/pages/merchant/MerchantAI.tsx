import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useCountry } from '@/context/CountryContext';
import BottomNav from '@/components/layout/BottomNav';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Sparkles, Wand2, TrendingUp, MessageSquare, FileText, Lightbulb, Send,
} from 'lucide-react';

const AI_TOOLS = [
  { id: 'description', icon: FileText, label: 'Product Descriptions', desc: 'AI-generate compelling product descriptions', prompt: 'Generate a compelling product description for: ' },
  { id: 'pricing', icon: TrendingUp, label: 'Smart Pricing', desc: 'Get AI-powered pricing recommendations', prompt: 'Suggest optimal pricing for: ' },
  { id: 'marketing', icon: MessageSquare, label: 'Marketing Copy', desc: 'Create social media posts & promotions', prompt: 'Create a marketing post for: ' },
  { id: 'insights', icon: Lightbulb, label: 'Business Insights', desc: 'AI analysis of your store performance', prompt: 'Analyze this store data and provide insights: ' },
];

const MerchantAI: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { formatPrice } = useCountry();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (!profile) return;
    supabase.from('stores').select('*').eq('owner_id', profile.id).maybeSingle().then(({ data }) => setStore(data));
  }, [profile]);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter some input');
      return;
    }

    const tool = AI_TOOLS.find(t => t.id === selectedTool);
    if (!tool) return;

    setLoading(true);
    setResult('');

    try {
      const systemPrompt = `You are an AI business assistant for SpeedUp, a delivery platform. 
The merchant's store is called "${store?.name || 'their store'}" in the ${store?.category || 'food'} category, located in ${store?.city || 'their city'}.
Provide helpful, actionable advice. Be concise and practical. Format with bullet points where appropriate.`;

      const response = await supabase.functions.invoke('merchant-ai', {
        body: { 
          message: tool.prompt + input,
          systemPrompt,
          toolType: selectedTool,
        },
      });

      if (response.error) throw response.error;
      setResult(response.data?.result || 'No response generated');
    } catch (err: any) {
      console.error('AI error:', err);
      // Fallback: generate locally
      setResult(generateFallback(selectedTool!, input, store));
    }
    setLoading(false);
  };

  const generateFallback = (toolId: string, input: string, store: any): string => {
    switch (toolId) {
      case 'description':
        return `📝 **${input}**\n\nIndulge in our premium ${input}, carefully prepared with the finest ingredients. Perfect for any occasion, this ${store?.category || 'food'} favorite is a must-try!\n\n✨ Freshly made daily\n🚀 Available for fast delivery\n⭐ Customer favorite`;
      case 'pricing':
        return `💰 **Pricing Recommendations for ${input}:**\n\n• Budget Option: Consider pricing 10-15% below competitors\n• Standard: Match market average for ${store?.city || 'your area'}\n• Premium: Add 20% markup with improved presentation\n\n💡 Tip: Offer bundle deals to increase average order value`;
      case 'marketing':
        return `📱 **Social Media Post:**\n\n🔥 NEW at ${store?.name || 'Our Store'}! 🔥\n\nHave you tried our amazing ${input}? 😍\n\nOrder now on SpeedUp and get it delivered in minutes!\n\n#SpeedUp #${store?.category || 'Food'}Delivery #${store?.city || 'LocalDelivery'}`;
      case 'insights':
        return `📊 **Business Insights:**\n\n• Focus on your top-performing products\n• Consider offering combo deals during peak hours\n• Customer retention tip: Respond quickly to orders\n• Growth opportunity: Optimize product images for better conversion\n\n💡 Keep your menu fresh with seasonal offerings!`;
      default:
        return 'Generated response for your query.';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold">AI Tools</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Tool Selection */}
        <div className="grid grid-cols-2 gap-3">
          {AI_TOOLS.map((tool) => (
            <Card
              key={tool.id}
              className={`cursor-pointer transition-all ${selectedTool === tool.id ? 'border-primary ring-2 ring-primary/20' : 'hover:shadow-md'}`}
              onClick={() => { setSelectedTool(tool.id); setResult(''); setInput(''); }}
            >
              <CardContent className="p-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <tool.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-sm text-foreground">{tool.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{tool.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Input & Generate */}
        {selectedTool && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-primary" />
                {AI_TOOLS.find(t => t.id === selectedTool)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  selectedTool === 'description' ? 'e.g. Spicy Jollof Rice with grilled chicken'
                  : selectedTool === 'pricing' ? 'e.g. Fried rice combo meal'
                  : selectedTool === 'marketing' ? 'e.g. Weekend special 20% off all burgers'
                  : 'e.g. I have 50 orders this week, mostly pizza...'
                }
                rows={3}
              />
              <Button className="w-full" onClick={handleGenerate} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Generate with AI
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Result */}
        {result && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                AI Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">{result}</div>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => { navigator.clipboard.writeText(result); toast.success('Copied!'); }}>
                Copy to clipboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MerchantAI;
