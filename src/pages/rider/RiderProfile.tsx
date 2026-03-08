import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, MapPin, CreditCard, Building2, 
  ChevronRight, LogOut, Shield, Star, Truck, Edit2, Save, Loader2,
  CheckCircle2, XCircle, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Ghana banks list with correct Paystack bank codes
const GHANA_BANKS = [
  { code: '030100', name: 'Absa Bank Ghana' },
  { code: '280100', name: 'Access Bank Ghana' },
  { code: '080100', name: 'Agricultural Development Bank' },
  { code: '140100', name: 'CalBank' },
  { code: '340100', name: 'Consolidated Bank Ghana' },
  { code: '130100', name: 'Ecobank Ghana' },
  { code: '200100', name: 'FBN Bank Ghana' },
  { code: '240100', name: 'Fidelity Bank Ghana' },
  { code: '170100', name: 'First Atlantic Bank' },
  { code: '040100', name: 'GCB Bank' },
  { code: '230100', name: 'Guaranty Trust Bank Ghana' },
  { code: '050100', name: 'National Investment Bank' },
  { code: '180100', name: 'Prudential Bank' },
  { code: '300100', name: 'Republic Bank Ghana' },
  { code: '190100', name: 'Stanbic Bank Ghana' },
  { code: '020100', name: 'Standard Chartered Bank Ghana' },
  { code: '060100', name: 'United Bank for Africa' },
  { code: '120100', name: 'Zenith Bank Ghana' },
  { code: 'MTN', name: 'MTN Mobile Money' },
  { code: 'VOD', name: 'Vodafone Cash' },
  { code: 'ATL', name: 'AirtelTigo Money' },
];

const RiderProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [vehicleType, setVehicleType] = useState(profile?.vehicle_type || '');
  const [vehiclePlate, setVehiclePlate] = useState(profile?.vehicle_plate || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  
  // Bank details - fetch from profile
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  // Fetch extended profile with bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!profile) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('bank_name, bank_code, account_number, account_name, subaccount_code')
        .eq('id', profile.id)
        .single();
      
      if (data) {
        setBankName(data.bank_name || '');
        setBankCode(data.bank_code || '');
        setAccountNumber(data.account_number || '');
        setAccountName(data.account_name || '');
        // If already has subaccount, mark as verified
        if (data.subaccount_code && data.account_name) {
          setIsVerified(true);
        }
      }
    };
    
    fetchBankDetails();
  }, [profile]);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache-bust param
      const url = `${publicUrl}?t=${Date.now()}`;

      // Update profile
      const { error: profileError } = await updateProfile({ avatar_url: url });
      if (profileError) throw profileError;

      setAvatarUrl(url);
      toast.success('Profile photo updated!');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Verify bank account with Paystack
  const handleVerifyAccount = async () => {
    if (!bankCode || !accountNumber) {
      toast.error('Please select a bank and enter account number');
      return;
    }

    setIsVerifying(true);
    setVerificationError('');
    setIsVerified(false);

    try {
      const { data, error } = await supabase.functions.invoke('verify-bank-account', {
        body: {
          bank_code: bankCode,
          account_number: accountNumber,
        }
      });

      if (error) throw error;

      if (data?.success) {
        setAccountName(data.account_name);
        setIsVerified(true);
        toast.success(`Account verified: ${data.account_name}`);
      } else {
        throw new Error(data?.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      const message = error instanceof Error ? error.message : 'Could not verify account';
      setVerificationError(message);
      setAccountName('');
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    // Require verification before saving bank details
    if (bankCode && accountNumber && !isVerified) {
      toast.error('Please verify your bank account first');
      return;
    }
    
    setIsSaving(true);
    try {
      // First update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone,
          vehicle_type: vehicleType,
          vehicle_plate: vehiclePlate,
          bank_name: bankName,
          bank_code: bankCode,
          account_number: accountNumber,
          account_name: accountName,
        })
        .eq('id', profile.id);

      if (error) throw error;

      // If bank details are verified, create/update Paystack subaccount
      if (bankCode && accountNumber && accountName && isVerified) {
        toast.loading('Setting up payment account...');
        
        const { data, error: subaccountError } = await supabase.functions.invoke('create-subaccount', {
          body: {
            bank_code: bankCode,
            account_number: accountNumber,
            business_name: `${fullName} - SpeedRush Rider`,
          }
        });

        if (subaccountError) {
          console.error('Subaccount error:', subaccountError);
          toast.dismiss();
          toast.warning('Profile saved, but payment account setup failed. You can retry later.');
        } else if (data?.success) {
          toast.dismiss();
          toast.success('Payment account set up successfully!');
        }
      } else {
        toast.success('Profile updated successfully');
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Reset verification when account details change
  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value);
    setIsVerified(false);
    setAccountName('');
    setVerificationError('');
  };

  const handleBankChange = (code: string) => {
    setBankCode(code);
    const bank = GHANA_BANKS.find(b => b.code === code);
    setBankName(bank?.name || '');
    setIsVerified(false);
    setAccountName('');
    setVerificationError('');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: Star, label: 'My Ratings', value: '4.8', onClick: () => {} },
    { icon: Truck, label: 'Total Deliveries', value: '156', onClick: () => navigate('/rider/history') },
    { icon: Shield, label: 'Verification Status', value: profile?.rider_status === 'approved' ? 'Verified' : 'Pending', status: profile?.rider_status },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-6 pb-20 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/rider')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">My Profile</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isEditing ? (
              <Save className="w-5 h-5" />
            ) : (
              <Edit2 className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Profile Avatar */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold">{profile?.full_name}</h2>
          <p className="text-primary-foreground/80">{user?.email}</p>
          {profile?.rider_status === 'approved' && (
            <div className="flex items-center gap-1 mt-2 bg-white/20 rounded-full px-3 py-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Verified Rider</span>
            </div>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="px-4 -mt-12 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={item.onClick}
                className="bg-card rounded-xl p-4 shadow-lg text-center"
              >
                <div className="w-10 h-10 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className={cn(
                  "font-bold text-lg",
                  item.status === 'approved' ? 'text-success' : 
                  item.status === 'pending' ? 'text-warning' : 'text-foreground'
                )}>
                  {item.value}
                </p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Form */}
      <div className="px-4 space-y-6">
        {/* Personal Info */}
        <section className="bg-card rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Personal Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </section>

        {/* Vehicle Info */}
        <section className="bg-card rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Vehicle Information
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Vehicle Type</Label>
              <Input
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., Motorcycle, Bicycle"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">License Plate</Label>
              <Input
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., GR-1234-21"
                className="mt-1"
              />
            </div>
          </div>
        </section>

        {/* Bank Details */}
        <section className="bg-card rounded-xl p-4 space-y-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Bank/MoMo Details
            <span className="text-xs text-muted-foreground ml-auto">For withdrawals</span>
          </h3>
          
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Bank/MoMo Provider</Label>
              <select
                value={bankCode}
                onChange={(e) => handleBankChange(e.target.value)}
                disabled={!isEditing}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Select bank or MoMo</option>
                {GHANA_BANKS.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-muted-foreground">Account/Phone Number</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={accountNumber}
                  onChange={(e) => handleAccountNumberChange(e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter account or phone number"
                  className="flex-1"
                />
                {isEditing && bankCode && accountNumber && !isVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleVerifyAccount}
                    disabled={isVerifying}
                    className="shrink-0"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Verify'
                    )}
                  </Button>
                )}
                {isVerified && (
                  <div className="flex items-center text-success">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
              {verificationError && (
                <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {verificationError}
                </p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">Account Name</Label>
              <Input
                value={accountName}
                readOnly
                disabled
                placeholder="Will be auto-filled after verification"
                className={cn(
                  "mt-1",
                  isVerified && "border-success/50 bg-success/5"
                )}
              />
              {isVerified && (
                <p className="text-xs text-success mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Account verified via Paystack
                </p>
              )}
            </div>
          </div>
          
          {!bankCode && !isEditing && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-sm text-warning">
              ⚠️ Add your bank details to receive withdrawals
            </div>
          )}
        </section>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
};

export default RiderProfile;