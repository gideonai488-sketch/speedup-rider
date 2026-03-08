import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, MapPin, Clock, Shield, Star, ChevronDown, ExternalLink, Target, Users, TrendingUp, Globe, Package, Building2, Bike, Car, CheckCircle2 } from 'lucide-react';
import heroRider from '@/assets/hero-rider.jpg';
import heroDelivery from '@/assets/landing/hero-scooter-delivery.jpg';
import deliveryFleet from '@/assets/landing/delivery-fleet.jpg';
import riderMotorcycle from '@/assets/landing/rider-motorcycle.jpg';
import riderCar from '@/assets/landing/rider-car.jpg';
import riderBicycle from '@/assets/landing/rider-bicycle.jpg';
import customerReceiving from '@/assets/landing/customer-receiving.jpg';
import { popularStores } from '@/data/deliveryData';

const LandingPage: React.FC = () => {
  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
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
              <span className="text-xl font-bold text-foreground tracking-tight">
                Speed<span className="text-primary">Up</span>
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase leading-tight">
                Genesis Holdings Inc. USA
              </span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About Us</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="#partners" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Partners</a>
            <a href="#careers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Drive with Us</a>
          </div>
          
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex font-medium">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button className="gradient-hero text-white shadow-glow hover:opacity-90 transition-opacity font-semibold">
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
            alt="SpeedUp Premium Delivery Service"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl stagger-children">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-5 py-2.5 mb-8">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">A Genesis Holdings Inc. (USA) Company</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-foreground leading-[1.1] mb-6 tracking-tight">
              Premium{' '}
              <span className="text-gradient">Delivery</span>
              <br />
              At Your{' '}
              <span className="text-gradient">Fingertips.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              From food and groceries to packages and errands — SpeedUp connects you with reliable riders for 
              fast, secure deliveries across Ghana and Finland.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-14">
              <Link to="/signup">
                <Button size="lg" className="w-full sm:w-auto gradient-hero text-white shadow-glow hover:opacity-90 transition-all text-lg px-10 h-14 font-semibold">
                  Order a Delivery
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/rider/auth">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 text-lg px-10 h-14 font-semibold">
                  Earn as a Rider
                </Button>
              </Link>
            </div>
            
            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-6 max-w-md">
              <div>
                <p className="text-3xl font-bold text-foreground">15 min</p>
                <p className="text-xs text-muted-foreground font-medium">Avg. Delivery</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">4.9★</p>
                <p className="text-xs text-muted-foreground font-medium">Customer Rating</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">24/7</p>
                <p className="text-xs text-muted-foreground font-medium">Always Available</p>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={scrollToServices}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors animate-bounce"
        >
          <span className="text-sm font-medium">Explore</span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </section>

      {/* Customer Experience Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest mb-4 block">For Customers</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 leading-tight">
                Everything delivered.<br />
                <span className="text-gradient">Right to your door.</span>
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Whether it's a hot meal from your favorite restaurant, weekly groceries, pharmacy essentials, 
                or important documents — SpeedUp handles it all with care and speed.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  'Real-time GPS tracking on every order',
                  'Competitive pricing with transparent fees',
                  'Secure payments & cash on delivery',
                  'Rate & review your rider experience',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/signup">
                <Button size="lg" className="gradient-hero text-white shadow-glow hover:opacity-90 font-semibold px-8">
                  Start Ordering
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="relative">
              <img 
                src={customerReceiving} 
                alt="Customer receiving delivery" 
                className="rounded-3xl shadow-2xl w-full object-cover aspect-square"
              />
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">Order Delivered!</p>
                    <p className="text-xs text-muted-foreground">Arrived in 12 minutes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What do you need <span className="text-gradient">delivered?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From meals to medicines, packages to paperwork — we deliver anything, anywhere.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 stagger-children">
            {[
              { icon: '🍔', name: 'Food Delivery', desc: 'Hot meals from top restaurants' },
              { icon: '🛒', name: 'Groceries', desc: 'Fresh produce to your door' },
              { icon: '💊', name: 'Pharmacy', desc: 'Medicine & health essentials' },
              { icon: '📋', name: 'Errands', desc: 'We handle your tasks' },
              { icon: '📦', name: 'Packages', desc: 'Send & receive parcels' },
              { icon: '📄', name: 'Documents', desc: 'Secure document delivery' },
            ].map((service) => (
              <Link 
                key={service.name}
                to="/signup"
                className="group bg-card rounded-2xl p-6 md:p-8 shadow-card hover:shadow-xl transition-all hover:-translate-y-1 border border-border"
              >
                <div className="text-4xl md:text-5xl mb-4 group-hover:scale-110 transition-transform">{service.icon}</div>
                <h3 className="font-semibold text-foreground mb-1 text-lg">{service.name}</h3>
                <p className="text-sm text-muted-foreground">{service.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Simple & Fast</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How <span className="text-gradient">SpeedUp</span> Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Three simple steps to get anything delivered
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {[
              { step: '01', title: 'Choose Service', desc: 'Select what you need delivered and enter your pickup & delivery locations.', icon: <MapPin className="w-8 h-8" /> },
              { step: '02', title: 'Get Matched', desc: 'We instantly connect you with the nearest verified rider for your delivery.', icon: <Zap className="w-8 h-8" /> },
              { step: '03', title: 'Track & Receive', desc: 'Follow your delivery in real-time on the map and receive it at your doorstep.', icon: <Shield className="w-8 h-8" /> },
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
              Making Life <span className="text-primary">Easier.</span>
            </h2>
            <p className="text-white/60 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed">
              SpeedUpvery app — it's a movement. Powered by 
              <strong className="text-white"> Genesis Holdings Inc. (USA)</strong>, we're on a mission to 
              transform logistics, create massive employment, and make everyday life simpler for millions.
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
                To build the most accessible and reliable delivery platform on earth — connecting people 
                with everything they need, delivered fast, safe, and affordable.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">50,000 Jobs by 2027</h3>
              <p className="text-white/60 leading-relaxed">
                We're committed to creating 50,000 meaningful jobs for riders and delivery professionals 
                across Africa and Europe — empowering people to earn on their own terms.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-primary/40 transition-all">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Making Life Easy</h3>
              <p className="text-white/60 leading-relaxed">
                From food and groceries to packages and errands — we handle the logistics so you can focus 
                on what matters most. Delivery made effortless.
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
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">2</p>
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

          {/* Company Info */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 backdrop-blur-sm border border-white/10">
              <Building2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-white/80">
                A product of Genesis Holdings Inc. — United States of America 🇺🇸
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden">
            <img src={deliveryFleet} alt="SpeedUp global delivery fleet" className="w-full h-64 md:h-[420px] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">Our Global Delivery Network</h3>
              <p className="text-white/70 max-w-2xl text-lg">Motorcycles, bicycles, scooters, and cars — our diverse fleet ensures fast, reliable deliveries across Ghana 🇬🇭 and Finland 🇫🇮.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {[
              { icon: <Building2 className="w-7 h-7" />, title: 'US Headquartered', desc: 'Genesis Holdings Inc. — a registered American corporation driving global logistics innovation.' },
              { icon: <Globe className="w-7 h-7" />, title: 'Ghana 🇬🇭 & Finland 🇫🇮', desc: 'Operating across two continents with plans for rapid international expansion.' },
              { icon: <Zap className="w-7 h-7" />, title: 'Instant Access', desc: 'Riders start earning immediately — no approval delays, no barriers to entry.' },
              { icon: <Shield className="w-7 h-7" />, title: 'Enterprise Security', desc: 'Bank-level security, real-time tracking, and verified riders on every delivery.' },
            ].map((pillar) => (
              <div key={pillar.title} className="bg-card rounded-2xl p-6 border border-border shadow-card hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center text-white mb-4 shadow-glow">
                  {pillar.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Methods */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Our Fleet</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Multiple <span className="text-gradient">Delivery Methods</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              The right vehicle for every delivery — fast, eco-friendly, and always reliable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { img: riderMotorcycle, title: 'Motorcycle & Scooter', desc: 'Navigate traffic with ease. Perfect for food, documents, and small packages. Our fastest option.' },
              { img: riderBicycle, title: 'Bicycle Courier', desc: 'Eco-friendly and efficient for short-distance deliveries. Zero emissions, full speed.' },
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
        </div>
      </section>

      {/* Brand Partners Section */}
      <section id="partners" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-bold text-primary uppercase tracking-widest mb-3 block">Trusted Partners</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Order from <span className="text-gradient">Top Brands</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Your favorite restaurants and stores, delivered to your door with SpeedUp.
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
            <p className="text-muted-foreground mb-4">Want your business on SpeedUp?</p>
            <Link to="/become-partner">
              <Button variant="outline" className="border-2 font-semibold">
                Become a Partner
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Become a Rider CTA */}
      <section id="careers" className="py-20 gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-accent blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-bold text-primary uppercase tracking-widest mb-4 block">Earn with SpeedUp</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Turn Your Vehicle<br />
                Into Your <span className="text-primary">Business.</span>
              </h2>
              <p className="text-lg text-white/70 mb-8 leading-relaxed">
                Whether you ride a motorcycle, bicycle, scooter, or drive a car — join thousands of riders 
                earning flexible income with SpeedUp. No experience required, no approval wait.
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

              <Link to="/rider/auth">
                <Button size="lg" className="bg-white text-foreground hover:bg-white/90 text-lg px-10 h-14 font-semibold">
                  Start Earning Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="hidden md:block">
              <img 
                src={heroDelivery} 
                alt="SpeedRush riders Upcustomers"Up          UplassName="Upded-3xl shadow-2xl w-full object-cover aspect-video"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-secondary/30 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
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
                  <span className="text-xl font-bold text-foreground tracking-tight">
                    Speed<span className="text-primary">Up</span>
                  </span>
                  <span className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase leading-tight">
                    Genesis Holdings Inc. USA
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                SpeedUp is a premium on-demand delivery platform by Genesis Holdings Inc., 
                a registered company in the United States of America. Connecting customers with 
                reliable riders across Ghana and Finland.
              </p>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Platform</h4>
              <div className="space-y-3">
                <Link to="/signup" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Order Delivery</Link>
                <Link to="/rider/auth" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Rider</Link>
                <Link to="/become-partner" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Partner with Us</Link>
              </div>
            </div>
            
            {/* Legal */}
            <div>
              <h4 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Company</h4>
              <div className="space-y-3">
                <a href="#about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Support</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 SpeedUp. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 font-medium">
              A product of Genesis Holdings Inc. — United States of America 🇺🇸
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
