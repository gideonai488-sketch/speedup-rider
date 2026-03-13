import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  GraduationCap, DollarSign, Users, Megaphone, Trophy, Rocket,
  ArrowLeft, Star, Globe, CheckCircle2, Sparkles, ChevronRight
} from 'lucide-react';

const UNIVERSITIES = {
  US: [
    'Howard University', 'Spelman College', 'Morehouse College', 'FAMU',
    'Texas Southern University', 'Clark Atlanta University', 'Hampton University',
    'North Carolina A&T', 'Jackson State University', 'Prairie View A&M',
    'Georgia State University', 'University of Houston', 'NYU', 'Temple University',
    'University of Maryland', 'Rutgers University',
  ],
  GH: [
    'University of Ghana', 'KNUST', 'University of Cape Coast', 'Ashesi University',
    'GIMPA', 'University of Professional Studies', 'Central University',
    'Ghana Institute of Journalism', 'UPSA', 'Valley View University',
  ],
  FI: [
    'University of Helsinki', 'Aalto University', 'University of Turku',
    'Tampere University', 'University of Oulu', 'LUT University',
  ],
};

const BENEFITS = [
  { icon: <DollarSign className="w-6 h-6" />, title: 'Earn Per Signup', desc: 'Get $5 (or GH₵50) for every student who joins through your link.' },
  { icon: <Trophy className="w-6 h-6" />, title: 'Monthly Bonuses', desc: 'Top ambassadors earn up to $500/month in performance bonuses.' },
  { icon: <Megaphone className="w-6 h-6" />, title: 'Marketing Support', desc: 'We provide flyers, social media kits, and promo codes for your campus.' },
  { icon: <Users className="w-6 h-6" />, title: 'Build Your Network', desc: 'Join a community of student leaders across 10 countries.' },
  { icon: <Star className="w-6 h-6" />, title: 'Resume Builder', desc: 'Official title, recommendation letters, and real startup experience.' },
  { icon: <Rocket className="w-6 h-6" />, title: 'Launch Ownership', desc: 'You become the face of SpeedUp on your campus. Your territory.' },
];

const CampusAmbassador: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    university_name: '',
    university_city: '',
    country: '',
    year_of_study: '',
    major: '',
    social_media_handle: '',
    follower_count: '',
    why_ambassador: '',
  });

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.phone || !form.university_name || !form.country || !form.year_of_study || !form.why_ambassador) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('ambassador_applications' as any)
        .insert([{
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          university_name: form.university_name,
          university_city: form.university_city.trim(),
          country: form.country,
          year_of_study: form.year_of_study,
          major: form.major.trim() || null,
          social_media_handle: form.social_media_handle.trim() || null,
          follower_count: form.follower_count || null,
          why_ambassador: form.why_ambassador.trim(),
        }]);

      if (error) throw error;
      setSubmitted(true);
      toast.success('Application submitted! We\'ll be in touch soon 🎉');
    } catch (err: any) {
      console.error('Submit error:', err);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">You're In! 🎓</h1>
          <p className="text-muted-foreground mb-2">
            Your campus ambassador application has been received. Our team will review it and get back to you within 48 hours.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Check your email for a confirmation and next steps.
          </p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-accent">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <GraduationCap className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">Campus Ambassador</span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Now Recruiting
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-5 leading-tight">
              Launch SpeedUp at{' '}
              <span className="text-primary">Your Campus</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be the entrepreneur on your campus. Earn money, build your resume, and bring student-powered delivery to your university.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full border border-border">
                <Globe className="w-4 h-4 text-primary" /> 6 Countries
              </span>
              <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full border border-border">
                <Users className="w-4 h-4 text-primary" /> 50+ Campuses
              </span>
              <span className="flex items-center gap-1.5 bg-card px-3 py-1.5 rounded-full border border-border">
                <DollarSign className="w-4 h-4 text-primary" /> Up to $500/mo
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
            Why Become an Ambassador?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {BENEFITS.map((b, i) => (
              <Card key={i} className="border-border bg-background hover:border-primary/30 transition-colors">
                <CardContent className="p-5">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
                    {b.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{b.title}</h3>
                  <p className="text-sm text-muted-foreground">{b.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Apply Now</h2>
              <p className="text-muted-foreground">Takes less than 3 minutes. We'll review and get back within 48 hours.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Personal Info</h3>
                <Input
                  placeholder="Full Name *"
                  value={form.full_name}
                  onChange={e => updateField('full_name', e.target.value)}
                  required
                  className="bg-card"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="email"
                    placeholder="Email Address *"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    required
                    className="bg-card"
                  />
                  <Input
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={e => updateField('phone', e.target.value)}
                    required
                    className="bg-card"
                  />
                </div>
              </div>

              {/* University Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">University Info</h3>
                <Select value={form.country} onValueChange={v => { updateField('country', v); updateField('university_name', ''); }}>
                  <SelectTrigger className="bg-card">
                    <SelectValue placeholder="Select Country *" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">🇺🇸 United States</SelectItem>
                    <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                    <SelectItem value="FI">🇫🇮 Finland</SelectItem>
                    <SelectItem value="ET">🇪🇹 Ethiopia</SelectItem>
                    <SelectItem value="JM">🇯🇲 Jamaica</SelectItem>
                    <SelectItem value="PH">🇵🇭 Philippines</SelectItem>
                  </SelectContent>
                </Select>

                {form.country && UNIVERSITIES[form.country as keyof typeof UNIVERSITIES] ? (
                  <Select value={form.university_name} onValueChange={v => updateField('university_name', v)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Select University *" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIVERSITIES[form.country as keyof typeof UNIVERSITIES].map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                      <SelectItem value="other">Other (type below)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="University Name *"
                    value={form.university_name}
                    onChange={e => updateField('university_name', e.target.value)}
                    required
                    className="bg-card"
                  />
                )}

                {form.university_name === 'other' && (
                  <Input
                    placeholder="Type your university name *"
                    value=""
                    onChange={e => updateField('university_name', e.target.value)}
                    className="bg-card"
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="University City *"
                    value={form.university_city}
                    onChange={e => updateField('university_city', e.target.value)}
                    required
                    className="bg-card"
                  />
                  <Select value={form.year_of_study} onValueChange={v => updateField('year_of_study', v)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Year of Study *" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1st Year">1st Year</SelectItem>
                      <SelectItem value="2nd Year">2nd Year</SelectItem>
                      <SelectItem value="3rd Year">3rd Year</SelectItem>
                      <SelectItem value="4th Year">4th Year</SelectItem>
                      <SelectItem value="Graduate">Graduate Student</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Major / Course of Study"
                  value={form.major}
                  onChange={e => updateField('major', e.target.value)}
                  className="bg-card"
                />
              </div>

              {/* Social & Motivation */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Social Presence</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Instagram / TikTok Handle"
                    value={form.social_media_handle}
                    onChange={e => updateField('social_media_handle', e.target.value)}
                    className="bg-card"
                  />
                  <Select value={form.follower_count} onValueChange={v => updateField('follower_count', v)}>
                    <SelectTrigger className="bg-card">
                      <SelectValue placeholder="Follower Count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-500">0 – 500</SelectItem>
                      <SelectItem value="500-1000">500 – 1,000</SelectItem>
                      <SelectItem value="1000-5000">1,000 – 5,000</SelectItem>
                      <SelectItem value="5000-10000">5,000 – 10,000</SelectItem>
                      <SelectItem value="10000+">10,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Why do you want to be a SpeedUp Campus Ambassador? What makes you the right person for your campus? *"
                  value={form.why_ambassador}
                  onChange={e => updateField('why_ambassador', e.target.value)}
                  required
                  rows={4}
                  className="bg-card resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                {!submitting && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By applying, you agree to our terms and confirm you're a current student at the university listed above.
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Email us at <span className="text-primary font-medium">ambassadors@speedup.app</span>
          </p>
        </div>
      </section>
    </div>
  );
};

export default CampusAmbassador;
