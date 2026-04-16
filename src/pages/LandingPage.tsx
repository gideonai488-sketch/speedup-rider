import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, MapPin, Clock, Shield, ChevronDown, Target, Users, TrendingUp, Globe, Building2, Bike, Car, CheckCircle2, DollarSign, Smartphone, Calendar } from 'lucide-react';
import heroRider from '@/assets/hero-rider.jpg';
import owlLogo from '@/assets/speedup-owl-logo.png';
import heroDelivery from '@/assets/landing/hero-scooter-delivery.jpg';
import deliveryFleet from '@/assets/landing/delivery-fleet.jpg';
import riderMotorcycle from '@/assets/landing/rider-motorcycle.jpg';
import riderCar from '@/assets/landing/rider-car.jpg';
import riderBicycle from '@/assets/landing/rider-bicycle.jpg';
import { useCountry } from '@/context/CountryContext';
import CountrySelector from '@/components/CountrySelector';
import { allCountries } from '@/config/countries';
import { Badge } from '@/components/ui/badge';

const LandingPage: React.FC = () => {
  const { t } = useCountry();

  const scrollToHow = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={owlLogo} alt="SpeedUp Logo" className="w-11 h-11 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground tracking-tight">
                Speed<span className="text-primary">Up</span>
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase leading-tight">
                Genesis Holdings Inc. USA
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#earnings" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Earnings</a>
            <a href="#fleet" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Fleet</a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex font-medium">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-hero text-white shadow-glow hover:opacity-90 transition-opacity font-semibold">
                Start Riding
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroRider} 
            alt="SpeedUp Rider earning on their schedule"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl stagger-children">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2.5 mb-8">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Earn On Your Own Terms</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
              Ride. Deliver.{' '}
              <span className="text-gradient">Earn Big.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Join SpeedUp as a rider and start earning immediately. Flexible hours, competitive pay, and daily payouts — your hustle, your rules.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto gradient-hero text-white shadow-glow hover:opacity-90 transition-all text-lg px-10 h-14 font-semibold">
                  Become a Rider
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 text-lg px-10 h-14 font-semibold">
                  Sign In
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-6 max-w-md">
              <div>
                <p className="text-3xl font-bold text-foreground">$500+</p>
                <p className="text-xs text-muted-foreground font-medium">Avg. Daily Earnings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">Instant</p>
                <p className="text-xs text-muted-foreground font-medium">Account Setup</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">Daily</p>
                <p className="text-xs text-muted-foreground font-medium">Fast Payouts</p>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={scrollToHow}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        >
          <span className="text-sm font-medium">Learn More</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      {/* Why Ride With SpeedUp */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Why SpeedUp?</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for <span className="text-gradient">Riders Like You</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We put riders first — from how you earn to how you get paid.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 stagger-children">
            {[
              { icon: DollarSign, title: 'Competitive Earnings', desc: 'Bid your own price on every delivery. You set your rates.', color: 'bg-primary/10 text-primary' },
              { icon: Calendar, title: 'Flexible Schedule', desc: 'Go online when you want. No shifts, no commitments.', color: 'bg-accent/10 text-accent' },
              { icon: Smartphone, title: 'Instant Payouts', desc: 'Get paid daily directly to your bank or mobile money.', color: 'bg-coral/10 text-coral' },
              { icon: Shield, title: 'Rider Protection', desc: 'Verified orders, secure payments, and dedicated support.', color: 'bg-success/10 text-success' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border hover:shadow-xl transition-all hover:-translate-y-1">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-lg">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Getting Started</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Earning in <span className="text-gradient">3 Simple Steps</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Sign up, go online, and start accepting deliveries — it's that easy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              { step: '01', title: 'Sign Up & Get Approved', desc: 'Create your rider account in minutes. Add your vehicle details and bank info for instant access.', icon: <Smartphone className="w-8 h-8" /> },
              { step: '02', title: 'Go Online & Accept Orders', desc: 'Toggle online to see available deliveries near you. Browse orders, bid your price, and accept.', icon: <Zap className="w-8 h-8" /> },
              { step: '03', title: 'Deliver & Get Paid', desc: 'Pick up, deliver, and earn. Money hits your account daily with transparent fee breakdowns.', icon: <DollarSign className="w-8 h-8" /> },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-card rounded-2xl p-8 shadow-card border border-border h-full">
                  <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center text-white mb-6 shadow-glow">
                    {item.icon}
                  </div>
                  <span className="text-6xl font-bold text-primary/10 absolute top-4 right-6">{item.step}</span>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Section */}
      <section id="earnings" className="py-20 gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-primary blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest mb-4 block">Your Earnings</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                You Set the Price.<br />
                <span className="text-primary">We Handle the Rest.</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                SpeedUp uses a unique bidding system — you see available orders, bid your delivery fee, and customers choose. No fixed rates, just fair market pricing.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { value: '$500+', label: 'Avg. Daily Earnings' },
                  { value: 'Instant', label: 'Dashboard Access' },
                  { value: 'Flexible', label: 'Your Own Schedule' },
                  { value: 'Daily', label: 'Fast Payouts' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-xs text-white/60 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>

              <Link to="/signup">
                <Button size="lg" className="bg-white text-foreground hover:bg-white/90 text-lg px-10 h-14 font-semibold">
                  Start Earning Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <img 
                src={heroDelivery} 
                alt="SpeedUp rider delivering"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Our Fleet</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ride With <span className="text-gradient">Any Vehicle</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Motorcycle, bicycle, or car — use whatever you've got and start earning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: riderMotorcycle, title: 'Motorcycle & Scooter', desc: 'The fastest option. Navigate traffic with ease. Perfect for food, documents, and small packages.' },
              { img: riderBicycle, title: 'Bicycle Courier', desc: 'Eco-friendly and efficient. Great for short-distance campus and city center deliveries.' },
              { img: riderCar, title: 'Car Delivery', desc: 'For larger orders, premium packages, and bulk deliveries that need extra care and space.' },
            ].map((method) => (
              <div key={method.title} className="group bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="h-56 overflow-hidden">
                  <img src={method.img} alt={method.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-foreground text-lg mb-2">{method.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{method.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Fleet hero image */}
          <div className="relative rounded-3xl overflow-hidden mt-10">
            <img src={deliveryFleet} alt="SpeedUp delivery fleet" className="w-full h-64 md:h-[420px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">Join Our Growing Fleet</h3>
              <p className="text-white/70 max-w-2xl text-lg">Thousands of riders across 10 countries are already earning with SpeedUp.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section id="about" className="py-24 gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-80 h-80 rounded-full bg-primary blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-accent blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4 block">Our Vision & Mission</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Creating <span className="text-primary">50,000 Jobs.</span><br />
              Empowering <span className="text-primary">Riders.</span>
            </h2>
            <p className="text-white/60 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
              SpeedUp isn't just an app — it's a movement. Powered by 
              <strong className="text-white"> Genesis Holdings Inc. (USA)</strong>, we're on a mission to 
              create massive employment for delivery professionals worldwide.
            </p>
          </div>

          {/* Vision Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Our Mission</h3>
              <p className="text-white/60 leading-relaxed">
                To build the most rider-friendly delivery platform on earth — empowering delivery professionals 
                to earn more, work flexibly, and build their futures.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">50,000 Jobs by 2027</h3>
              <p className="text-white/60 leading-relaxed">
                We're committed to creating 50,000 meaningful jobs for riders and delivery professionals 
                across Africa, Europe, Caribbean, and Asia.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Rider-First Platform</h3>
              <p className="text-white/60 leading-relaxed">
                Fair bidding system, instant payouts, real-time support, and transparent fees. 
                We built this platform for riders, by listening to riders.
              </p>
            </div>
          </div>

          {/* Impact Numbers */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-primary mb-2">50K</p>
                <p className="text-sm text-white/50 font-medium uppercase tracking-wider">Jobs Target</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">10</p>
                <p className="text-sm text-white/50 font-medium uppercase tracking-wider">Countries</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">2027</p>
                <p className="text-sm text-white/50 font-medium uppercase tracking-wider">Vision Year</p>
              </div>
              <div className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">∞</p>
                <p className="text-sm text-white/50 font-medium uppercase tracking-wider">Possibilities</p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm border border-white/10">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-white/80">
                {t.footer_product_of}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Global Presence</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ride in <span className="text-gradient">10 Countries</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              SpeedUp is live and growing across the globe. Join riders earning in your city.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 gap-4 mb-12">
            {allCountries.map((c) => (
              <div
                key={c.code}
                className={`relative flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                  c.isActive
                    ? 'border-primary/50 bg-primary/5 shadow-lg'
                    : 'border-border bg-card opacity-80'
                }`}
              >
                {c.comingSoon && (
                  <Badge className="absolute -top-2 right-2 bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5">
                    {t.coming_soon}
                  </Badge>
                )}
                {c.isActive && (
                  <Badge className="absolute -top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-0.5">
                    Live
                  </Badge>
                )}
                <span className="text-4xl">{c.flag}</span>
                <h3 className="font-bold text-foreground text-sm">{c.name}</h3>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground font-medium">{c.currencySymbol} · {c.currency}</span>
                </div>
                <div className="text-[10px] text-muted-foreground text-center">
                  {c.cities.slice(0, 3).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Start Earning?
          </h2>
          <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of riders across 10 countries who are already earning with SpeedUp. 
            Sign up takes less than 5 minutes.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-foreground hover:bg-white/90 text-lg px-12 h-14 font-semibold">
              Become a Rider Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={owlLogo} alt="SpeedUp Logo" className="w-10 h-10 object-contain" />
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    Speed<span className="text-primary">Up</span>
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase leading-tight">
                    Genesis Holdings Inc. USA
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-4">
                The rider-first delivery platform. Earn on your own schedule with competitive pay and daily payouts across 10 countries.
              </p>
              <div className="flex gap-2 flex-wrap">
                {allCountries.map((c) => (
                  <span key={c.code} className="text-lg" title={c.name}>{c.flag}</span>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <div className="space-y-3">
                <Link to="/signup" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Rider</Link>
                <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Rider Sign In</Link>
                <a href="#how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
                <a href="#about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {t.footer_rights}
            </p>
            <div className="flex items-center gap-3">
              <CountrySelector variant="compact" />
              <p className="text-xs text-muted-foreground/70 font-medium">
                {t.footer_product_of}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
