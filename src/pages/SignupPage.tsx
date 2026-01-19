import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ArrowLeft, User, Bike, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'rider' ? 'rider' : 'customer';
  
  const [role, setRole] = useState<'customer' | 'rider'>(defaultRole);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate signup
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success('Account created successfully!');
    navigate(role === 'rider' ? '/rider/dashboard' : '/customer/home');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Speed<span className="text-primary">Rush</span>
            </span>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">Create your account</h1>
          <p className="text-muted-foreground mb-8">Join SpeedRush and start delivering or getting deliveries</p>
          
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'customer'
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                role === 'customer' ? 'gradient-hero text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                <User className="w-6 h-6" />
              </div>
              <span className={`font-medium ${role === 'customer' ? 'text-primary' : 'text-muted-foreground'}`}>
                Customer
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Get items delivered
              </span>
            </button>
            
            <button
              type="button"
              onClick={() => setRole('rider')}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'rider'
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                role === 'rider' ? 'gradient-hero text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                <Bike className="w-6 h-6" />
              </div>
              <span className={`font-medium ${role === 'rider' ? 'text-primary' : 'text-muted-foreground'}`}>
                Rider
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Earn by delivering
              </span>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Kwame Mensah"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="kwame@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+233 20 123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-hero text-white shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : `Sign up as ${role === 'rider' ? 'Rider' : 'Customer'}`}
            </Button>
          </form>
          
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
      
      {/* Right side - Image (hidden on mobile) */}
      <div className="hidden lg:block lg:flex-1 relative">
        <div className="absolute inset-0 gradient-hero opacity-90" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center max-w-md">
            <h2 className="text-3xl font-bold mb-4">
              {role === 'rider' 
                ? 'Start Earning Today' 
                : 'Get Anything Delivered'
              }
            </h2>
            <p className="text-white/80 text-lg">
              {role === 'rider'
                ? 'Join our team of riders and earn competitive pay with flexible hours. Be your own boss.'
                : 'From food to packages, our riders will rush to deliver whatever you need, wherever you are.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
