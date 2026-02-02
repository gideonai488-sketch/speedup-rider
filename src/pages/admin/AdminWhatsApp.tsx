import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  MessageSquare, 
  Phone, 
  Send,
  Users,
  Settings,
  Bell,
  Lock,
  Zap,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

const AdminWhatsApp: React.FC = () => {
  const [selectedProvider, setSelectedProvider] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);

  // This page is for future configuration - APIs not yet connected
  const providers = [
    { id: 'twilio', name: 'Twilio', description: 'Global messaging platform' },
    { id: 'africastalking', name: 'Africa\'s Talking', description: 'Africa-focused messaging' },
    { id: 'termii', name: 'Termii', description: 'Nigerian messaging provider' },
    { id: 'hubtel', name: 'Hubtel', description: 'Ghana-based provider' },
  ];

  const features = [
    {
      icon: Lock,
      title: 'OTP Authentication',
      description: 'Send one-time passwords via WhatsApp instead of SMS',
      status: 'not_configured',
    },
    {
      icon: Bell,
      title: 'Order Notifications',
      description: 'Real-time order updates to customers via WhatsApp',
      status: 'not_configured',
    },
    {
      icon: Users,
      title: 'Marketing Campaigns',
      description: 'Bulk promotional messages to opted-in customers',
      status: 'not_configured',
    },
    {
      icon: Zap,
      title: 'Rider Alerts',
      description: 'Instant delivery assignment notifications',
      status: 'not_configured',
    },
  ];

  return (
    <AdminLayout title="WhatsApp & OTP">
      <div className="p-4 space-y-6">
        {/* Status Banner */}
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning">Not Configured</h3>
              <p className="text-sm text-muted-foreground">
                WhatsApp messaging is not yet activated. Add your API credentials below to enable WhatsApp features.
              </p>
            </div>
          </div>
        </div>

        {/* Provider Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Choose Provider
            </CardTitle>
            <CardDescription>
              Select a WhatsApp Business API provider to integrate with SpeedRush
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <div className="flex flex-col">
                      <span>{provider.name}</span>
                      <span className="text-xs text-muted-foreground">{provider.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedProvider && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div>
                  <label className="text-sm font-medium">API Key</label>
                  <Input 
                    type="password" 
                    placeholder="Enter your API key" 
                    className="mt-1.5"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sender ID / Phone Number</label>
                  <Input 
                    placeholder="e.g., SpeedRush or +233XXXXXXXXX" 
                    className="mt-1.5"
                    disabled
                  />
                </div>
                <Button 
                  className="w-full" 
                  disabled
                  onClick={() => toast.info('API configuration coming soon')}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Save Configuration (Coming Soon)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div>
          <h3 className="font-semibold text-foreground mb-3">Available Features</h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <Card key={index} className="bg-secondary/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Marketing Campaigns Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Marketing Campaigns
            </CardTitle>
            <CardDescription>
              Send promotional messages to your customers (requires configuration)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Campaign Name</label>
              <Input placeholder="e.g., Weekend Special Offer" className="mt-1.5" disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Target Audience</label>
              <Select disabled>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active Customers (30 days)</SelectItem>
                  <SelectItem value="inactive">Inactive Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Message Template</label>
              <Textarea 
                placeholder="Hi {{name}}, enjoy 20% off your next order with code SAVE20! Order now on SpeedRush."
                className="mt-1.5"
                rows={4}
                disabled
              />
            </div>
            <Button className="w-full" disabled>
              <Send className="w-4 h-4 mr-2" />
              Schedule Campaign (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* OTP Settings Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              OTP Authentication
            </CardTitle>
            <CardDescription>
              Use WhatsApp for secure one-time password delivery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Enable WhatsApp OTP</p>
                <p className="text-sm text-muted-foreground">Replace email OTP with WhatsApp</p>
              </div>
              <Switch disabled />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Fallback to SMS</p>
                <p className="text-sm text-muted-foreground">Use SMS if WhatsApp fails</p>
              </div>
              <Switch disabled />
            </div>
            <div>
              <label className="text-sm font-medium">OTP Expiry (seconds)</label>
              <Input type="number" placeholder="300" className="mt-1.5" disabled />
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-primary/5 rounded-xl p-4">
          <h4 className="font-semibold text-foreground mb-2">How to Get Started</h4>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Choose a WhatsApp Business API provider above</li>
            <li>Create an account with the provider and get your API credentials</li>
            <li>Enter your API key and sender ID in the configuration</li>
            <li>Test the connection and start sending messages</li>
          </ol>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
