import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2, Lock, User, Phone, GraduationCap, ArrowLeft, Mail, Globe } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const UNIVERSITIES: Record<string, string[]> = {
  US: ['Howard University', 'Spelman College', 'Morehouse College', 'FAMU', 'Texas Southern University', 'Clark Atlanta University', 'Hampton University', 'North Carolina A&T', 'Jackson State University', 'Georgia State University', 'University of Houston', 'NYU', 'Temple University', 'Other'],
  GH: ['University of Ghana', 'KNUST', 'University of Cape Coast', 'Ashesi University', 'GIMPA', 'University of Professional Studies', 'Other'],
  FI: ['University of Helsinki', 'Aalto University', 'University of Turku', 'Tampere University', 'Other'],
  ET: ['Addis Ababa University', 'Hawassa University', 'Jimma University', 'Other'],
  JM: ['University of the West Indies', 'University of Technology Jamaica', 'Other'],
  PH: ['University of the Philippines', 'Ateneo de Manila', 'De La Salle University', 'Other'],
};

const AmbassadorAuth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, profile, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signup');

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [university, setUniversity] = useState('');
  const [customUniversity, setCustomUniversity] = useState('');

  useEffect(() => {
    if (user && profile && !authLoading) {
      if (profile.role === 'ambassador' || (profile as any).university) {
        navigate('/ambassador');
      } else if (profile.role === 'customer') {
        navigate('/customer');
      } else if (profile.role === 'rider') {
        navigate('/rider');
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      emailSchema.parse(loginEmail);
      passwordSchema.parse(loginPassword);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Invalid input');
      return;
    }

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);

    if (error) {
      toast.error(error.message || 'Login failed');
    } else {
      toast.success('Welcome back, Ambassador! 🎓');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !country || !university) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'Invalid input');
      return;
    }

    const finalUniversity = university === 'Other' ? customUniversity : university;
    if (!finalUniversity.trim()) {
      toast.error('Please enter your university name');
      return;
    }

    setIsLoading(true);
    // Sign up with ambassador role - using email directly (not phone mapping)
    const { error } = await signUp(
      email,
      password,
      name.trim(),
      'ambassador' as any,
      phone.trim(),
      country,
      finalUniversity
    );

    if (error) {
      setIsLoading(false);
      toast.error(error.message || 'Signup failed');
      return;
    }

    // Auto sign-in after successful signup so session is created and redirect fires
    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);

    if (signInError) {
      toast.success('Welcome aboard, Ambassador! Please log in.');
    } else {
      toast.success('Welcome aboard, Ambassador! 🎓🚀');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-accent">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <GraduationCap className="w-5 h-5 text-primary" />
        <span className="font-bold text-foreground">Campus Ambassador</span>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Campus Ambassador</CardTitle>
            <CardDescription>
              Instant access. No application needed. Start earning today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email Address"
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        className="pl-10 bg-card"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="Password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        className="pl-10 bg-card"
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Full Name *"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="pl-10 bg-card"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Email Address *"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="pl-10 bg-card"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Phone Number *"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="pl-10 bg-card"
                      required
                    />
                  </div>

                  <Select value={country} onValueChange={v => { setCountry(v); setUniversity(''); }}>
                    <SelectTrigger className="bg-card">
                      <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
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

                  {country && (
                    <Select value={university} onValueChange={setUniversity}>
                      <SelectTrigger className="bg-card">
                        <GraduationCap className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Select University *" />
                      </SelectTrigger>
                      <SelectContent>
                        {(UNIVERSITIES[country] || []).map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {university === 'Other' && (
                    <Input
                      placeholder="Type your university name *"
                      value={customUniversity}
                      onChange={e => setCustomUniversity(e.target.value)}
                      className="bg-card"
                      required
                    />
                  )}

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password *"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-10 bg-card"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Confirm Password *"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-card"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Join as Ambassador 🎓
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary hover:underline">Customer App</Link>
              {' · '}
              <Link to="/rider/auth" className="text-primary hover:underline">Rider App</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AmbassadorAuth;
