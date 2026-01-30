import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, ArrowLeft, User, Bike, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { signUp, user, profile, loading } = useAuth();
  
  // STRICT: Role is determined at signup and cannot be changed
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user && profile) {
      const redirectPath = profile.role === 'rider' 
        ? '/rider/dashboard' 
        : profile.role === 'admin' 
          ? '/admin/dashboard' 
          : '/customer/home';
      navigate(redirectPath, { replace: true });
    }
  }, [user, profile, loading, navigate]);

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // STRICT: Role is set at signup and enforced by database trigger
      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.fullName, 
        role,
        formData.phone
      );
      
      if (error) {
        // Handle specific error cases
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          toast.error('An account with this email already exists. Please log in instead.');
        } else if (error.message.includes('password')) {
          toast.error('Password does not meet security requirements.');
        } else if (error.message.includes('rate limit')) {
          toast.error('Too many signup attempts. Please try again later.');
        } else {
          toast.error(error.message || 'Failed to create account. Please try again.');
        }
        setIsLoading(false);
        return;
      }
      
      toast.success('Account created! Please check your email to verify your account.');
      navigate('/login');
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          
          {/* Role Selector - STRICT: This choice is permanent */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole('customer')}
              disabled={isLoading}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'customer'
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border hover:border-primary/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              disabled={isLoading}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === 'rider'
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border hover:border-primary/50'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          
          <div className="mb-6 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-xs text-warning-foreground">
              <strong>Important:</strong> Your account type ({role === 'rider' ? 'Rider' : 'Customer'}) cannot be changed after signup. Choose carefully.
            </p>
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
                className={`mt-1.5 ${errors.fullName ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
              )}
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
                className={`mt-1.5 ${errors.email ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email}</p>
              )}
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
                className={`mt-1.5 ${errors.phone ? 'border-destructive' : ''}`}
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive mt-1">{errors.phone}</p>
              )}
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
                  className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Min 8 characters with uppercase, lowercase, and number
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-hero text-white shadow-glow"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                `Sign up as ${role === 'rider' ? 'Rider' : 'Customer'}`
              )}
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
