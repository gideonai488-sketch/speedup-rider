import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Bike, 
  ShoppingBag, 
  GraduationCap,
  Star,
  DollarSign,
  Users,
  Zap,
  Gift,
  MapPin
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CampusTour: React.FC = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<'ride' | 'order' | 'refer'>('ride');

  const opportunities = [
    {
      id: 'ride' as const,
      title: 'Ride with Us',
      subtitle: 'Become a SpeedRush Rider',
      icon: Bike,
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      earning: 'GH₵500+ Weekly',
      benefits: ['Flexible schedule', 'Weekly payouts', 'Fuel allowances', 'Insurance covered'],
      cta: 'Start Earning',
      action: () => navigate('/rider/auth')
    },
    {
      id: 'order' as const,
      title: 'Order Anything',
      subtitle: 'Fast Campus Delivery',
      icon: ShoppingBag,
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
      earning: 'FREE Delivery Week',
      benefits: ['30min delivery', 'Campus stores', 'Student discounts', 'Track live'],
      cta: 'Order Now',
      action: () => navigate('/customer/auth')
    },
    {
      id: 'refer' as const,
      title: 'Refer & Earn',
      subtitle: 'Campus Ambassador Program',
      icon: GraduationCap,
      color: 'from-primary/20 to-yellow-500/20',
      borderColor: 'border-primary/30',
      earning: 'GH₵2000+ Monthly',
      benefits: ['Recurring income', 'Leadership skills', 'Network building', 'Bi-weekly payouts'],
      cta: 'Join Program',
      action: () => navigate('/ambassador/auth')
    }
  ];

  const activeOpportunity = opportunities.find(opp => opp.id === activeSection);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-5" />
        <div className="relative container mx-auto px-4 pt-16 pb-12 text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm font-medium">
            <MapPin className="w-3 h-3 mr-1" />
            Campus Tour 2024
          </Badge>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-['Outfit']">
            Nano Banana
            <span className="block text-primary">Campus Tour</span>
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the logistics revolution on your campus. Three ways to get involved, 
            one mission: making life easier through technology.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {opportunities.map((opp) => (
              <button
                key={opp.id}
                onClick={() => setActiveSection(opp.id)}
                className={cn(
                  'px-6 py-3 rounded-full text-sm font-medium transition-all duration-300',
                  'backdrop-blur-md border',
                  activeSection === opp.id 
                    ? 'bg-primary/20 text-primary border-primary/30 scale-105' 
                    : 'bg-background/50 text-muted-foreground border-border hover:bg-primary/10'
                )}
              >
                <opp.icon className="w-4 h-4 mr-2 inline" />
                {opp.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Opportunity Showcase */}
      {activeOpportunity && (
        <div className="container mx-auto px-4 py-12">
          <Card className={cn(
            'border-2 backdrop-blur-xl transition-all duration-500',
            `bg-gradient-to-br ${activeOpportunity.color}`,
            activeOpportunity.borderColor
          )}>
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto md:mx-0 mb-4',
                    'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20'
                  )}>
                    <activeOpportunity.icon className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-foreground mb-2">
                    {activeOpportunity.title}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {activeOpportunity.subtitle}
                  </p>
                  
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="text-xl font-bold text-foreground">
                      {activeOpportunity.earning}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    {activeOpportunity.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-sm text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    size="lg" 
                    className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={activeOpportunity.action}
                  >
                    {activeOpportunity.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="w-full md:w-80 h-64 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <activeOpportunity.icon className="w-24 h-24 text-primary/30" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Opportunities Grid */}
      <div className="container mx-auto px-4 pb-16">
        <h3 className="text-2xl font-bold text-center text-foreground mb-8">
          Choose Your Path
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <Card 
              key={opportunity.id}
              className={cn(
                'group cursor-pointer transition-all duration-300 hover:scale-105',
                'backdrop-blur-xl border-2',
                `bg-gradient-to-br ${opportunity.color}`,
                opportunity.borderColor,
                'hover:shadow-2xl hover:shadow-primary/10'
              )}
              onClick={() => {
                setActiveSection(opportunity.id);
                opportunity.action();
              }}
            >
              <CardContent className="p-6 text-center">
                <div className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4',
                  'bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20',
                  'group-hover:scale-110 transition-transform duration-300'
                )}>
                  <opportunity.icon className="w-6 h-6 text-primary" />
                </div>
                
                <h4 className="text-lg font-bold text-foreground mb-2">
                  {opportunity.title}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {opportunity.subtitle}
                </p>
                
                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                  {opportunity.earning}
                </Badge>

                <Button 
                  variant="ghost" 
                  size="sm"
                  className="w-full group-hover:bg-primary/20 group-hover:text-primary"
                >
                  {opportunity.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            Join the Movement
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground">Jobs by 2027</div>
            </div>
            <div>
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">1000+</div>
              <div className="text-sm text-muted-foreground">Active Riders</div>
            </div>
            <div>
              <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">30min</div>
              <div className="text-sm text-muted-foreground">Avg Delivery</div>
            </div>
            <div>
              <GraduationCap className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">200+</div>
              <div className="text-sm text-muted-foreground">Campus Reps</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 py-12 text-center">
        <h3 className="text-3xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h3>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Use promo code <Badge className="mx-1">NANOBANANA</Badge> for exclusive campus tour benefits
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/customer')}>
            Explore App
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/')}>
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CampusTour;