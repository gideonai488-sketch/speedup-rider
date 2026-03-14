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
import { Loader2, Lock, User, Phone, Store, ArrowLeft, Globe, Building2 } from 'lucide-react';
import { z } from 'zod';
import { allCountries, CountryCode } from '@/config/countries';
import owlLogo from '@/assets/speedup-owl-logo.png';

const phoneSchema = z.string().min(10, 'Please enter a valid phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const MerchantAuth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Login
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCountry, setLoginCountry] = useState<CountryCode>('GH');
  const loginCountryConfig = allCountries.find(c => c.code === loginCountry);

  // Signup
  const [signupName, setSignupName] = useState('');
  const [signupBusinessName, setSignupBusinessName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCountry, setSignupCountry] = useState<CountryCode>('GH');
  const [signupCity, setSignupCity] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const selectedCountryConfig = allCountries.find(c => c.code === signupCountry);
  const availableCities = selectedCountryConfig?.cities || [];

  useEffect(() => {
    if (user && profile && !authLoading) {
      if (profile.role === 'merchant') {
        navigate('/merchant/dashboard');
      } else {
        toast.error('This login is for merchants only');
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
    const phoneEmail = `${loginPhone.replace(/\D/g, '')}@speedup.g.gh`;
    const { error } = await signIn(phoneEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes('Invalid login credentials') ? 'Invalid phone number or password' : error.message);
    } else {
      toast.success('Welcome back, merchant!');
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
    if (!signupBusinessName.trim()) {
      toast.error('Please enter your business name');
      return;
    }
    if (!signupCity) {
      toast.error('Please select your city');
      return;
    }
    setIsLoading(true);
    const phoneEmail = `${signupPhone.replace(/\D/g, '')}@speup.guph`;
    const { error } = await signUp(phoneEmail, signupPassword, signupName, 'merchant', signupPhone, signupCity, signupBusinessName);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes('already registered') ? 'This phone number is already registered.' : error.message);
    } else {
      toast.success('Merchant account created! Setting up your store...');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      <div className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-2">
              <img src={owlLogo} alt="SpeedUp" className="w-16 h-16 object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold">
              <Store className="inline w-6 h-6 mr-2 text-primary" />
              Merchant Portal
            </CardTitle>
            <CardDescription>Grow your business with SpeedUp delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select value={loginCountry} onValueChange={(v) => setLoginCountry(v as CountryCode)}>
                      <SelectTrigger className="w-full">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code} disabled={c.comingSoon}>
                            {c.flag} {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        {loginCountryConfig?.phonePrefix || '+233'}
                      </span>
                      <Input type="tel" placeholder="XX XXX XXXX" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} className="rounded-l-none" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="password" placeholder="Enter password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Store className="w-4 h-4 mr-2" />}
                    Sign In to Dashboard
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Your Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="My Restaurant" value={signupBusinessName} onChange={(e) => setSignupBusinessName(e.target.value)} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select value={signupCountry} onValueChange={(v) => { setSignupCountry(v as CountryCode); setSignupCity(''); }}>
                      <SelectTrigger className="w-full">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code} disabled={c.comingSoon}>
                            {c.flag} {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={signupCity} onValueChange={setSignupCity}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>{city}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
                        {selectedCountryConfig?.phonePrefix || '+233'}
                      </span>
                      <Input type="tel" placeholder="XX XXX XXXX" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} className="rounded-l-none" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" placeholder="Min 6 chars" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirm</Label>
                      <Input type="password" placeholder="Confirm" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Store className="w-4 h-4 mr-2" />}
                    Create Merchant Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Want to order instead? <Link to="/auth" className="text-primary font-medium hover:underline">Customer Login</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantAuth;
