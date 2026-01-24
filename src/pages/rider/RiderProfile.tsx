import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Phone, MapPin, CreditCard, Building2, 
  ChevronRight, LogOut, Shield, Star, Truck, Edit2, Save, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Ghana banks list with Paystack bank codes
const GHANA_BANKS = [
  { code: '050', name: 'Ecobank Ghana' },
  { code: '130', name: 'GCB Bank' },
  { code: '190', name: 'Stanbic Bank Ghana' },
  { code: '030', name: 'Absa Bank Ghana' },
  { code: '060', name: 'United Bank for Africa' },
  { code: '120', name: 'Zenith Bank Ghana' },
  { code: '240', name: 'Fidelity Bank Ghana' },
  { code: '280', name: 'Consolidated Bank Ghana' },
  { code: '080', name: 'Agricultural Development Bank' },
  { code: '042', name: 'Access Bank Ghana' },
  { code: '140', name: 'CalBank' },
  { code: '230', name: 'Guaranty Trust Bank Ghana' },
  { code: '900554', name: 'MTN Mobile Money' },
  { code: '900553', name: 'Vodafone Cash' },
  { code: '900556', name: 'AirtelTigo Money' },
];

const RiderProfile: React.FC = () => {
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile fields
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [vehicleType, setVehicleType] = useState(profile?.vehicle_type || '');
  const [vehiclePlate, setVehiclePlate] = useState(profile?.vehicle_plate || '');
  
  // Bank details - fetch from profile
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // Fetch extended profile with bank details
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (!profile) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('bank_name, bank_code, account_number, account_name')
        .eq('id', profile.id)
        .single();
      
      if (data) {
        setBankName(data.bank_name || '');
        setBankCode(data.bank_code || '');
        setAccountNumber(data.account_number || '');
        setAccountName(data.account_name || '');
      }
    };
    
    fetchBankDetails();
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;
    
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

      // If bank details are provided, create/update Paystack subaccount
      if (bankCode && accountNumber && accountName) {
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
                onChange={(e) => {
                  setBankCode(e.target.value);
                  const bank = GHANA_BANKS.find(b => b.code === e.target.value);
                  setBankName(bank?.name || '');
                }}
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
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter account or phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Account Name</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                disabled={!isEditing}
                placeholder="Name on the account"
                className="mt-1"
              />
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