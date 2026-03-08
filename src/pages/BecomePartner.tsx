import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Phone, MapPin, Clock, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ghanaianCities } from '@/data/ghanaianCities';

const BecomePartner: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    phone: '',
    whatsapp: '',
    email: '',
    businessType: '',
    businessAddress: '',
    city: '',
    description: '',
    operatingHours: '',
    estimatedDailyOrders: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName || !formData.contactName || !formData.phone || 
        !formData.businessType || !formData.businessAddress || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate phone number
    const phoneRegex = /^(\+233|0)[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Ghana phone number');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('partner_applications')
        .insert({
          business_name: formData.businessName.trim(),
          contact_name: formData.contactName.trim(),
          phone: formData.phone.trim(),
          whatsapp: formData.whatsapp.trim() || null,
          email: formData.email.trim() || null,
          business_type: formData.businessType,
          business_address: formData.businessAddress.trim(),
          city: formData.city,
          description: formData.description.trim() || null,
          operating_hours: formData.operatingHours.trim() || null,
          estimated_daily_orders: formData.estimatedDailyOrders || null,
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your interest in partnering with SpeedUpr team will review your application and contact you within 2-3 business days.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full gradient-hero text-primary-foreground">
              Back to Home
            </Button>
            <Button variant="outline" onClick={() => {
              setIsSubmitted(false);
              setFormData({
                businessName: '',
                contactName: '',
                phone: '',
                whatsapp: '',
                email: '',
                businessType: '',
                businessAddress: '',
                city: '',
                description: '',
                operatingHours: '',
                estimatedDailyOrders: '',
              });
            }}>
              Submit Another Application
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-bold text-foreground">Become a Partner</h1>
            <p className="text-xs text-muted-foreground">Join the SpeedRuUpUprk</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Grow Your Business with SpeedUp</h2>
          <p className="text-muted-foreground">
            Reach thousands of customers across Ghana. We handle the delivery, you focus on your business.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-card rounded-xl p-4 text-center border border-border/50">
            <p className="text-2xl font-bold text-primary">10K+</p>
            <p className="text-xs text-muted-foreground">Active Customers</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border border-border/50">
            <p className="text-2xl font-bold text-success">500+</p>
            <p className="text-xs text-muted-foreground">Partner Stores</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border border-border/50">
            <p className="text-2xl font-bold text-warning">15min</p>
            <p className="text-xs text-muted-foreground">Avg Delivery</p>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Information */}
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Store className="w-4 h-4 text-primary" />
              Business Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Mama's Kitchen"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => setFormData({ ...formData, businessType: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Restaurant / Food</SelectItem>
                    <SelectItem value="groceries">Grocery Store</SelectItem>
                    <SelectItem value="pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your business..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1.5"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="contactName">Contact Person Name *</Label>
                <Input
                  id="contactName"
                  placeholder="Full name"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="024 XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="024 XXX XXXX"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="business@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Location
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {ghanaianCities.map((city) => (
                      <SelectItem key={city.value} value={city.label}>{city.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="businessAddress">Business Address *</Label>
                <Textarea
                  id="businessAddress"
                  placeholder="Full address including landmarks"
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  className="mt-1.5"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Operations */}
          <div className="bg-card rounded-2xl p-5 border border-border/50">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Operations
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="operatingHours">Operating Hours</Label>
                <Input
                  id="operatingHours"
                  placeholder="e.g., 8:00 AM - 10:00 PM"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="estimatedDailyOrders">Estimated Daily Orders</Label>
                <Select
                  value={formData.estimatedDailyOrders}
                  onValueChange={(value) => setFormData({ ...formData, estimatedDailyOrders: value })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 orders</SelectItem>
                    <SelectItem value="11-30">11-30 orders</SelectItem>
                    <SelectItem value="31-50">31-50 orders</SelectItem>
                    <SelectItem value="51-100">51-100 orders</SelectItem>
                    <SelectItem value="100+">100+ orders</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full h-12 gradient-hero text-primary-foreground text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to our terms of service and partner agreement.
          </p>
        </form>
      </main>
    </div>
  );
};

export default BecomePartner;
