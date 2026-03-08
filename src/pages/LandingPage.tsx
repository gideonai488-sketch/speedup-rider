import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, MapPin, Clock, Shield, Star, ChevronDown, ExternalLink, Target, Users, TrendingUp, Globe } from 'lucide-react';
import heroRider from '@/assets/hero-rider.jpg';
import deliveryFleet from '@/assets/landing/delivery-fleet.jpg';
import riderMotorcycle from '@/assets/landing/rider-motorcycle.jpg';
import riderCar from '@/assets/landing/rider-car.jpg';
import riderBicycle from '@/assets/landing/rider-bicycle.jpg';
import { popularStores } from '@/data/deliveryData';

const LandingPage: React.FC = () => {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl gradient-hero flex items-center justify-center shadow-lg relative overflow-hidden">
              <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
                <ellipse cx="20" cy="23" rx="12" ry="14" fill="white" fillOpacity="0.95" />
                <circle cx="20" cy="14" r="10" fill="white" />
                <path d="M11 7 L14 14 L8 12 Z" fill="white" />
                <path d="M29 7 L26 14 L32 12 Z" fill="white" />
                <circle cx="16" cy="14" r="4" fill="#1e293b" />
                <circle cx="24" cy="14" r="4" fill="#1e293b" />
                <circle cx="17" cy="13" r="2" fill="white" />
                <circle cx="25" cy="13" r="2" fill="white" />
                <path d="M18 18 L20 22 L22 18 Z" fill="#f59e0b" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">
                Speed<span className="text-primary">Rush</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                by Genesis Holdings Inc. USA
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#vision" className="text-muted-foreground hover:text-foreground transition-colors">Our Vision</a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#riders" className="text-muted-foreground hover:text-foreground transition-colors">Become a Rider</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-hero text-white shadow-glow hover:opacity-90 transition-opacity">
                Get Started
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
            alt="SpeedRush Rider"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl stagger-children">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Now in Ghana 🇬🇭 & Finland 🇫🇮 — Creating 50,000 jobs by 2027</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Deliver with{' '}
              <span className="text-gradient">Any Vehicle.</span>
              <br />
              Earn on{' '}
              <span className="text-gradient">Your Terms.</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Scooter, motorcycle, bicycle, or car — anyone can join SpeedRush and start earning. 
              We're building the largest delivery network across Ghana and Finland, one rider at a time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto gradient-hero text-white shadow-glow hover:opacity-90 transition-all text-lg px-8">
                  Request a Rider
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/rider/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 text-lg px-8">
                  Become a Rider
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">15 min</p>
                  <p className="text-sm text-muted-foreground">Avg. delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">50,000</p>
                  <p className="text-sm text-muted-foreground">Jobs by 2027</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">2 Countries</p>
                  <p className="text-sm text-muted-foreground">Ghana & Finland</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={scrollToServices}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        >
          <span className="text-sm font-medium">Explore Services</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our <span className="text-gradient">Vision</span>
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              We believe everyone deserves the opportunity to earn a living. SpeedRush is on a mission to create 
              <strong className="text-foreground"> 50,000 jobs</strong> across Ghana and Finland by 2027 through our delivery platform.
            </p>
          </div>

          {/* Fleet showcase */}
          <div className="relative rounded-3xl overflow-hidden mb-16">
            <img src={deliveryFleet} alt="SpeedRush delivery fleet - motorcycles, bicycles, and cars" className="w-full h-64 md:h-96 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Any Vehicle. Any Person. One Platform.</h3>
              <p className="text-white/70 max-w-2xl">Whether you ride a scooter, motorcycle, bicycle, or drive a car — there's a place for you at SpeedRush. No barriers, just opportunities.</p>
            </div>
          </div>

          {/* Delivery methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { img: riderMotorcycle, title: 'Motorcycle & Scooter', desc: 'Navigate traffic easily and deliver fast. Perfect for food and small packages.' },
              { img: riderBicycle, title: 'Bicycle Courier', desc: 'Eco-friendly and great for short distances. No fuel costs, all profit.' },
              { img: riderCar, title: 'Car Delivery', desc: 'Handle larger orders, bulk deliveries, and premium packages with ease.' },
            ].map((method) => (
              <div key={method.title} className="group bg-card rounded-2xl overflow-hidden shadow-card border border-border hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="h-48 overflow-hidden">
                  <img src={method.img} alt={method.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground">{method.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Vision pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Target className="w-7 h-7" />, title: '50,000 Jobs', desc: 'Creating meaningful employment opportunities across all 16 regions of Ghana by 2027.' },
              { icon: <Users className="w-7 h-7" />, title: 'Inclusive Platform', desc: 'Anyone with any vehicle can join — motorcycle, scooter, bicycle, or car. No discrimination.' },
              { icon: <TrendingUp className="w-7 h-7" />, title: 'Daily Earnings', desc: 'Riders earn competitive pay with instant daily payouts. Be your own boss, set your own hours.' },
              { icon: <Globe className="w-7 h-7" />, title: 'Pan-Africa Vision', desc: 'Starting in Ghana, expanding across West Africa. Building the continent\'s delivery backbone.' },
            ].map((pillar) => (
              <div key={pillar.title} className="bg-card rounded-2xl p-6 border border-border shadow-card">
                <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center text-white mb-4 shadow-glow">
                  {pillar.icon}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What do you need <span className="text-gradient">delivered?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our range of delivery services. Our riders are ready to pick up and deliver anything you need.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 stagger-children">
            {[
              { icon: '🍔', name: 'Food Delivery', desc: 'Hot meals, fast' },
              { icon: '🛒', name: 'Groceries', desc: 'Fresh to your door' },
              { icon: '💊', name: 'Pharmacy', desc: 'Medicine delivery' },
              { icon: '📋', name: 'Errands', desc: 'We handle it' },
              { icon: '📦', name: 'Packages', desc: 'Send & receive' },
              { icon: '📄', name: 'Documents', desc: 'Secure & fast' },
            ].map((service) => (
              <Link 
                key={service.name}
                to="/signup"
                className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-lg transition-all hover:-translate-y-1 border border-border"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How <span className="text-gradient">SpeedRush</span> Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting your items delivered is as easy as 1-2-3
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              { step: '01', title: 'Choose Service', desc: 'Select what you need delivered and enter pickup & dropoff locations', icon: <MapPin className="w-8 h-8" /> },
              { step: '02', title: 'Get Matched', desc: 'We instantly find the nearest available rider for your delivery', icon: <Zap className="w-8 h-8" /> },
              { step: '03', title: 'Track & Receive', desc: 'Watch your delivery in real-time and receive it at your doorstep', icon: <Shield className="w-8 h-8" /> },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-card rounded-2xl p-8 shadow-card border border-border h-full">
                  <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center text-white mb-6 shadow-glow">
                    {item.icon}
                  </div>
                  <span className="text-5xl font-bold text-primary/10 absolute top-4 right-6">{item.step}</span>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Partners Section */}
      <section id="partners" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our <span className="text-gradient">Partner Brands</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Order from your favorite restaurants and stores. We deliver from the best brands in Ghana.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-12">
            {popularStores.map((store) => (
              <div 
                key={store.id}
                className="group bg-card rounded-2xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`h-16 ${store.coverColor} rounded-xl flex items-center justify-center mb-4 overflow-hidden`}>
                  <img 
                    src={store.logo} 
                    alt={store.name}
                    className="max-h-10 max-w-24 object-contain filter brightness-0 invert"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<span class="text-white text-lg font-bold">${store.name}</span>`;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-foreground text-center mb-1">{store.name}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  <span>{store.rating}</span>
                  <span>•</span>
                  <span>{store.deliveryTime}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-4">Want to partner with SpeedRush?</p>
            <Link to="/become-partner">
              <Button variant="outline" className="border-2">
                Become a Partner
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Become a Rider CTA */}
      <section id="riders" className="py-20 gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join the Movement. Create Your Future.
            </h2>
            <p className="text-lg text-white/70 mb-4">
              We're not just building a delivery app — we're creating <strong className="text-white">50,000 jobs</strong> for the people of Ghana by 2027. 
              Whether you have a scooter, motorcycle, bicycle, or car, you can start earning today.
            </p>
            <p className="text-white/50 mb-8">
              No experience needed. No vehicle restrictions. Just you, your ride, and unlimited earning potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/rider/auth">
                <Button size="lg" className="w-full sm:w-auto bg-white text-foreground hover:bg-white/90 text-lg px-8">
                  Apply to Ride
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 mt-12 flex-wrap">
              <div className="text-center">
                <p className="text-3xl font-bold">GH₵ 500+</p>
                <p className="text-sm text-white/60">Avg. daily earnings</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-bold">50,000</p>
                <p className="text-sm text-white/60">Jobs target by 2027</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-bold">Any Vehicle</p>
                <p className="text-sm text-white/60">Scooter, bike, car</p>
              </div>
              <div className="w-px h-12 bg-white/20 hidden sm:block" />
              <div className="text-center">
                <p className="text-3xl font-bold">Instant</p>
                <p className="text-sm text-white/60">Daily payouts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                  <ellipse cx="20" cy="23" rx="12" ry="14" fill="white" fillOpacity="0.95" />
                  <circle cx="20" cy="14" r="10" fill="white" />
                  <circle cx="16" cy="14" r="4" fill="#1e293b" />
                  <circle cx="24" cy="14" r="4" fill="#1e293b" />
                  <circle cx="17" cy="13" r="2" fill="white" />
                  <circle cx="25" cy="13" r="2" fill="white" />
                  <path d="M18 18 L20 22 L22 18 Z" fill="#f59e0b" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">
                  Speed<span className="text-primary">Rush</span>
                </span>
                <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                  by Genesis Holdings Inc. USA
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2025 SpeedRush. All rights reserved.
              </p>
              <p className="text-xs text-muted-foreground/70">
                A Genesis Holdings Inc. Company, USA
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
