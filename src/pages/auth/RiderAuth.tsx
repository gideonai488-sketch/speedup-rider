import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Lock, User, Phone, Bike, ArrowLeft, Car, BadgeCheck, MapPin } from 'lucide-react';
import { z } from 'zod';
import { ghanaianCities, getCitiesByRegion } from '@/data/ghanaianCities';

const phoneSchema = z.string().min(10, 'Please enter a valid phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const RiderAuth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('motorcycle');

  const citiesByRegion = getCitiesByRegion();

  useEffect(() => {
    if (user && profile && !authLoading) {
      if (profile.role === 'admin') {
        navigate('/admin');
      } else if (profile.role === 'rider') {
        navigate('/rider');
      } else {
        toast.error('Please use the customer app to login');
        navigate('/auth');
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      phoneSchema.parse(loginPhone);
      passwordSchema.parse(loginPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    setIsLoading(true);
    // Use phone as email format for Supabase auth
    const phoneEmail = `${loginPhone.replace(/\D/g, '')}@speedrush.gh`;
    const { error } = await signIn(phoneEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid phone number or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back, rider!');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      phoneSchema.parse(signupPhone);
      passwordSchema.parse(signupPassword);
    } catch (err) {
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
        return;
      }
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!signupName.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!signupCity) {
      toast.error('Please select your city');
      return;
    }

    setIsLoading(true);
    // Use phone as email format for Supabase auth
    const phoneEmail = `${signupPhone.replace(/\D/g, '')}@speedrush.gh`;
    const cityLabel = ghanaianCities.find(c => c.value === signupCity)?.label || signupCity;
    const { error } = await signUp(phoneEmail, signupPassword, signupName, 'rider', signupPhone, cityLabel, vehicleType);
    setIsLoading(false);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This phone number is already registered. Please login instead.');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Rider account created! Welcome to SpeedRush.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      {/* Back to home */}
      <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gray-800/50 backdrop-blur-lg">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-2">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">SpeedRush Rider</CardTitle>
            <CardDescription className="text-gray-400">Earn money delivering with SpeedRush</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Rider benefits */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                <span>Flexible working hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                <span>Keep most of your earnings (only GH₵ 5 per order)</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                <span>Daily payouts available</span>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-700/50">
                <TabsTrigger value="login" className="data-[state=active]:bg-green-600">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-green-600">Apply Now</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-phone" className="text-gray-300">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="login-phone"
                        type="tel"
                        placeholder="0XX XXX XXXX"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      'Login as Rider'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-gray-300">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="0XX XXX XXXX"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">City</Label>
                    <Select value={signupCity} onValueChange={setSignupCity}>
                      <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(citiesByRegion).map(([region, cities]) => (
                          <div key={region}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                              {region} Region
                            </div>
                            {cities.map((city) => (
                              <SelectItem key={city.value} value={city.value}>
                                {city.label}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Vehicle Type</Label>
                    <Select value={vehicleType} onValueChange={setVehicleType}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="motorcycle">
                          <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4" />
                            Motorcycle
                          </div>
                        </SelectItem>
                        <SelectItem value="bicycle">
                          <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4" />
                            Bicycle
                          </div>
                        </SelectItem>
                        <SelectItem value="car">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Car
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      'Apply to Become a Rider'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Link to customer auth */}
            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-sm text-gray-400">
                Want to order deliveries?{' '}
                <Link to="/auth" className="text-green-500 hover:underline font-medium">
                  Use the customer app
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiderAuth;
