import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Bell,
  Shield,
  Globe,
  CreditCard,
  Truck,
  MessageSquare,
  Save,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Clock,
  DollarSign,
  Percent,
  ToggleLeft,
  ToggleRight,
  Building,
  User
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface SettingsSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const settingsSections: SettingsSection[] = [
  { id: 'general', title: 'General', icon: Building, description: 'Business information and branding' },
  { id: 'notifications', title: 'Notifications', icon: Bell, description: 'Push and email notification settings' },
  { id: 'delivery', title: 'Delivery', icon: Truck, description: 'Delivery fees, zones and timings' },
  { id: 'payments', title: 'Payments', icon: CreditCard, description: 'Payment methods and processing' },
  { id: 'security', title: 'Security', icon: Shield, description: 'Admin access and permissions' },
];

const AdminSettings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  
  // General Settings
  const [businessName, setBusinessName] = useState('SpeedRush');
  const [businessEmail, setBusinessEmail] = useState('support@speedrush.com');
  const [businessPhone, setBusinessPhone] = useState('+233 20 123 4567');
  const [businessAddress, setBusinessAddress] = useState('Accra, Ghana');
  const [currency, setCurrency] = useState('GHS');
  
  // Notification Settings
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [riderNotifications, setRiderNotifications] = useState(true);
  const [promotionalNotifications, setPromotionalNotifications] = useState(false);
  
  // Delivery Settings
  const [baseDeliveryFee, setBaseDeliveryFee] = useState(8);
  const [pricePerKm, setPricePerKm] = useState(2);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(200);
  const [maxDeliveryRadius, setMaxDeliveryRadius] = useState(25);
  const [estimatedPrepTime, setEstimatedPrepTime] = useState(15);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.5);
  const [surgeEnabled, setSurgeEnabled] = useState(true);
  
  // Payment Settings
  const [mobileMoney, setMobileMoney] = useState(true);
  const [cardPayment, setCardPayment] = useState(true);
  const [cashOnDelivery, setCashOnDelivery] = useState(true);
  const [walletPayment, setWalletPayment] = useState(true);
  const [minOrderAmount, setMinOrderAmount] = useState(20);
  
  // Security Settings
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginNotifications, setLoginNotifications] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully');
    setActiveSection(null);
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Business Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Contact Email</label>
                  <Input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <Input
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <Textarea
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Currency</label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS (₵)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="KES">KES (KSh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Notification Channels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Push Notifications</p>
                      <p className="text-xs text-muted-foreground">Send push notifications to app users</p>
                    </div>
                  </div>
                  <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Send email updates to customers</p>
                    </div>
                  </div>
                  <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">SMS Notifications</p>
                      <p className="text-xs text-muted-foreground">Send SMS for critical updates</p>
                    </div>
                  </div>
                  <Switch checked={smsEnabled} onCheckedChange={setSmsEnabled} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Notification Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <span className="text-foreground">Order Updates</span>
                  <Switch checked={orderNotifications} onCheckedChange={setOrderNotifications} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <span className="text-foreground">Rider Alerts</span>
                  <Switch checked={riderNotifications} onCheckedChange={setRiderNotifications} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <span className="text-foreground">Promotional Messages</span>
                  <Switch checked={promotionalNotifications} onCheckedChange={setPromotionalNotifications} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'delivery':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Delivery Pricing</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base Fee (GH₵)</label>
                  <Input
                    type="number"
                    value={baseDeliveryFee}
                    onChange={(e) => setBaseDeliveryFee(Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Per KM (GH₵)</label>
                  <Input
                    type="number"
                    value={pricePerKm}
                    onChange={(e) => setPricePerKm(Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Free Delivery Threshold (GH₵)</label>
                <Input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">Orders above this amount get free delivery</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Delivery Zones</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Max Delivery Radius (KM)</label>
                <Input
                  type="number"
                  value={maxDeliveryRadius}
                  onChange={(e) => setMaxDeliveryRadius(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Estimated Prep Time (mins)</label>
                <Input
                  type="number"
                  value={estimatedPrepTime}
                  onChange={(e) => setEstimatedPrepTime(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Surge Pricing</h3>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <div>
                  <p className="font-medium text-foreground">Enable Surge Pricing</p>
                  <p className="text-xs text-muted-foreground">Increase prices during peak hours</p>
                </div>
                <Switch checked={surgeEnabled} onCheckedChange={setSurgeEnabled} />
              </div>
              {surgeEnabled && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Surge Multiplier</label>
                  <Input
                    type="number"
                    step="0.1"
                    value={surgeMultiplier}
                    onChange={(e) => setSurgeMultiplier(Number(e.target.value))}
                    className="mt-1.5"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Smartphone className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Mobile Money</p>
                      <p className="text-xs text-muted-foreground">MTN, Vodafone, AirtelTigo</p>
                    </div>
                  </div>
                  <Switch checked={mobileMoney} onCheckedChange={setMobileMoney} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Card Payment</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                    </div>
                  </div>
                  <Switch checked={cardPayment} onCheckedChange={setCardPayment} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when you receive</p>
                    </div>
                  </div>
                  <Switch checked={cashOnDelivery} onCheckedChange={setCashOnDelivery} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">SpeedRush Wallet</p>
                      <p className="text-xs text-muted-foreground">In-app wallet balance</p>
                    </div>
                  </div>
                  <Switch checked={walletPayment} onCheckedChange={setWalletPayment} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Order Limits</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Minimum Order Amount (GH₵)</label>
                <Input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Authentication</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Require 2FA for admin login</p>
                  </div>
                  <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Login Notifications</p>
                    <p className="text-xs text-muted-foreground">Get notified of new logins</p>
                  </div>
                  <Switch checked={loginNotifications} onCheckedChange={setLoginNotifications} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Session Settings</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Session Timeout (minutes)</label>
                <Select value={String(sessionTimeout)} onValueChange={(v) => setSessionTimeout(Number(v))}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Admin Users</h3>
              <div className="bg-secondary/30 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@speedrush.com</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Manage Admin Users
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Settings">
      <div className="p-4">
        {!activeSection ? (
          <div className="space-y-3">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full bg-card rounded-2xl border border-border/50 p-4 shadow-card hover:shadow-lg transition-all text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-primary font-medium"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Back to Settings
            </button>

            <div className="bg-card rounded-2xl border border-border/50 p-4 shadow-card">
              <h2 className="text-lg font-bold text-foreground mb-4">
                {settingsSections.find(s => s.id === activeSection)?.title}
              </h2>
              {renderSectionContent()}
            </div>

            <Button 
              className="w-full gradient-hero text-primary-foreground"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
