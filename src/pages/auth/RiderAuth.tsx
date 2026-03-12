import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Lock, User, Phone, Bike, ArrowLeft, BadgeCheck, Camera, Globe, MapPin } from 'lucide-react';
import { z } from 'zod';
import { allCountries, CountryCode } from '@/config/countries';

const phoneSchema = z.string().min(7, 'Please enter a valid phone number');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const RiderAuth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginCountry, setLoginCountry] = useState<CountryCode>('GH');
  const loginCountryConfig = allCountries.find(c => c.code === loginCountry);
  
  // Signup form
  const [signupName, setSignupName] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupCountry, setSignupCountry] = useState<CountryCode>('GH');
  const [signupCity, setSignupCity] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCountryConfig = allCountries.find(c => c.code === signupCountry);
  const availableCities = selectedCountryConfig?.cities || [];

  useEffect(() => {
    if (user && profile && !authLoading) {
      if (profile.role === 'rider') {
        navigate('/rider');
      } else {
        toast.error('Please use the customer app to login');
        navigate('/auth');
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Photo must be under 5MB');
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    const ext = avatarFile.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
    if (error) {
      console.error('Avatar upload error:', error);
      return null;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

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
    const phoneEmail = `${loginPhone.replace(/\D/g, '')}@speedup.gh`;
    const { error } = await signIn(phoneEmail, loginPassword);
    setIsLoading(false);
    if (error) {
      toast.error(error.message.includes('Invalid login credentials') ? 'Invalid phone number or password' : error.message);
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
    const phoneEmail = `${signupPhone.replace(/\D/g, '')}@speedup.gh`;
    const { error } = await signUp(phoneEmail, signupPassword, signupName, 'rider', signupPhone, signupCity);
    
    if (error) {
      setIsLoading(false);
      toast.error(error.message.includes('already registered') ? 'This phone number is already registered. Please login instead.' : error.message);
      return;
    }

    // Upload avatar if selected (after signup)
    if (avatarFile) {
      await new Promise(r => setTimeout(r, 2000));
      const { data: { user: newUser } } = await supabase.auth.getUser();
      if (newUser) {
        const avatarUrl = await uploadAvatar(newUser.id);
        if (avatarUrl) {
          await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('user_id', newUser.id);
        }
      }
    }

    setIsLoading(false);
    toast.success('Rider account created! Welcome to SpeedUp.');
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
            <CardTitle className="text-2xl font-bold text-white">SpeedUp Rider</CardTitle>
            <CardDescription className="text-gray-400">Earn money delivering with SpeedUp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                <span>Flexible working hours</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <BadgeCheck className="w-4 h-4 text-green-500" />
                <span>Keep most of your earnings</span>
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
                    <Label className="text-gray-300">Country</Label>
                    <Select value={loginCountry} onValueChange={(v) => setLoginCountry(v as CountryCode)}>
                      <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white">
                        <Globe className="h-4 w-4 mr-2 text-gray-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code} disabled={c.comingSoon}>
                            {c.flag} {c.name} {c.comingSoon ? '(Coming Soon)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-phone" className="text-gray-300">Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-sm">
                        {loginCountryConfig?.phonePrefix || '+233'}
                      </span>
                      <Input id="login-phone" type="tel" placeholder="XX XXX XXXX" value={loginPhone} onChange={(e) => setLoginPhone(e.target.value)} className="rounded-l-none bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in...</>) : 'Login as Rider'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-20 h-20 rounded-full bg-gray-700/50 border-2 border-dashed border-gray-500 flex items-center justify-center overflow-hidden hover:border-green-500 transition-colors group"
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-7 h-7 text-gray-400 group-hover:text-green-400 transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                      </div>
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
                    <span className="text-xs text-gray-400">Upload your photo</span>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-gray-300">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input id="signup-name" type="text" placeholder="John Doe" value={signupName} onChange={(e) => setSignupName(e.target.value)} className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Country</Label>
                    <Select value={signupCountry} onValueChange={(v) => { setSignupCountry(v as CountryCode); setSignupCity(''); }}>
                      <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white">
                        <Globe className="h-4 w-4 mr-2 text-gray-500" />
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {allCountries.map((c) => (
                          <SelectItem key={c.code} value={c.code} disabled={c.comingSoon}>
                            {c.flag} {c.name} {c.comingSoon ? '(Coming Soon)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">City</Label>
                    <Select value={signupCity} onValueChange={setSignupCity}>
                      <SelectTrigger className="w-full bg-gray-700/50 border-gray-600 text-white">
                        <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-gray-300">Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-600 bg-gray-700 text-gray-300 text-sm">
                        {selectedCountryConfig?.phonePrefix || '+233'}
                      </span>
                      <Input id="signup-phone" type="tel" placeholder="XX XXX XXXX" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} className="rounded-l-none bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input id="signup-password" type="password" placeholder="••••••••" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password" className="text-gray-300">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input id="signup-confirm-password" type="password" placeholder="••••••••" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500" required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Applying...</>) : 'Apply to Become a Rider'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t border-gray-700 text-center">
              <p className="text-sm text-gray-400">
                Want to order deliveries?{' '}
                <Link to="/auth" className="text-green-500 hover:underline font-medium">Use the customer app</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RiderAuth;