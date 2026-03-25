import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Package, Globe, Truck } from 'lucide-react';

export interface ShippingDetails {
  carrier: 'fedex' | 'dhl' | 'auto';
  packageWeight: number;
  packageLength: number;
  packageWidth: number;
  packageHeight: number;
  destinationCountry: string;
  destinationCity: string;
  destinationAddress: string;
  recipientName: string;
  recipientPhone: string;
  isFragile: boolean;
  requiresInsurance: boolean;
  declaredValue: number;
  customsDescription: string;
}

interface ShippingDetailsFormProps {
  details: ShippingDetails;
  onChange: (details: ShippingDetails) => void;
}

const ShippingDetailsForm: React.FC<ShippingDetailsFormProps> = ({ details, onChange }) => {
  const update = (partial: Partial<ShippingDetails>) => {
    onChange({ ...details, ...partial });
  };

  return (
    <div className="space-y-6">
      {/* Carrier Selection */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-foreground">Preferred Carrier</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'auto' as const, label: 'Best Rate', icon: '🏆', desc: 'Auto-select' },
            { id: 'fedex' as const, label: 'FedEx', icon: '📦', desc: 'Fast & reliable' },
            { id: 'dhl' as const, label: 'DHL', icon: '✈️', desc: 'Global reach' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => update({ carrier: c.id })}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                details.carrier === c.id
                  ? 'border-primary bg-primary/5 shadow-glow'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <span className="text-2xl block mb-1">{c.icon}</span>
              <p className="font-semibold text-sm text-foreground">{c.label}</p>
              <p className="text-[10px] text-muted-foreground">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Package Dimensions */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-primary" />
          <Label className="font-semibold text-foreground">Package Details</Label>
        </div>
        
        <div>
          <Label className="text-xs text-muted-foreground">Weight (kg)</Label>
          <Input
            type="number"
            min={0.1}
            step={0.1}
            value={details.packageWeight || ''}
            onChange={(e) => update({ packageWeight: parseFloat(e.target.value) || 0 })}
            placeholder="e.g. 2.5"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Length (cm)</Label>
            <Input
              type="number"
              min={1}
              value={details.packageLength || ''}
              onChange={(e) => update({ packageLength: parseInt(e.target.value) || 0 })}
              placeholder="L"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Width (cm)</Label>
            <Input
              type="number"
              min={1}
              value={details.packageWidth || ''}
              onChange={(e) => update({ packageWidth: parseInt(e.target.value) || 0 })}
              placeholder="W"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Height (cm)</Label>
            <Input
              type="number"
              min={1}
              value={details.packageHeight || ''}
              onChange={(e) => update({ packageHeight: parseInt(e.target.value) || 0 })}
              placeholder="H"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Destination */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-primary" />
          <Label className="font-semibold text-foreground">Destination</Label>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Country</Label>
          <Input
            value={details.destinationCountry}
            onChange={(e) => update({ destinationCountry: e.target.value })}
            placeholder="e.g. United States"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">City</Label>
          <Input
            value={details.destinationCity}
            onChange={(e) => update({ destinationCity: e.target.value })}
            placeholder="e.g. New York"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Full Address</Label>
          <Input
            value={details.destinationAddress}
            onChange={(e) => update({ destinationAddress: e.target.value })}
            placeholder="Street address, zip code"
            className="mt-1"
          />
        </div>
      </div>

      {/* Recipient */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-4 h-4 text-primary" />
          <Label className="font-semibold text-foreground">Recipient Details</Label>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Full Name</Label>
          <Input
            value={details.recipientName}
            onChange={(e) => update({ recipientName: e.target.value })}
            placeholder="Recipient's full name"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Phone Number</Label>
          <Input
            type="tel"
            value={details.recipientPhone}
            onChange={(e) => update({ recipientPhone: e.target.value })}
            placeholder="+1 234 567 8900"
            className="mt-1"
          />
        </div>
      </div>

      {/* Options */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-foreground">Fragile Package</p>
            <p className="text-xs text-muted-foreground">Extra care during handling</p>
          </div>
          <Switch checked={details.isFragile} onCheckedChange={(v) => update({ isFragile: v })} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm text-foreground">Shipping Insurance</p>
            <p className="text-xs text-muted-foreground">Protect against loss or damage</p>
          </div>
          <Switch checked={details.requiresInsurance} onCheckedChange={(v) => update({ requiresInsurance: v })} />
        </div>
        {details.requiresInsurance && (
          <div>
            <Label className="text-xs text-muted-foreground">Declared Value</Label>
            <Input
              type="number"
              min={0}
              value={details.declaredValue || ''}
              onChange={(e) => update({ declaredValue: parseFloat(e.target.value) || 0 })}
              placeholder="Value in USD"
              className="mt-1"
            />
          </div>
        )}
      </div>

      {/* Customs Description */}
      <div>
        <Label className="text-sm font-semibold text-foreground">Customs Description</Label>
        <Textarea
          value={details.customsDescription}
          onChange={(e) => update({ customsDescription: e.target.value })}
          placeholder="Describe package contents for customs (e.g. clothing, electronics, documents...)"
          className="mt-1.5"
          rows={3}
        />
        <p className="text-xs text-muted-foreground mt-1">Required for international shipments</p>
      </div>

      {/* How it works */}
      <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
        <p className="text-sm font-semibold text-foreground mb-3">🌍 How Global Shipping Works</p>
        <div className="space-y-2 text-xs text-muted-foreground">
          <p>1. <strong className="text-foreground">You request</strong> — Fill in package & destination details</p>
          <p>2. <strong className="text-foreground">Our rider picks up</strong> — A SpeedUp rider collects your package locally</p>
          <p>3. <strong className="text-foreground">FedEx/DHL ships</strong> — Package is handed to our shipping partner for international transit</p>
          <p>4. <strong className="text-foreground">Delivered worldwide</strong> — Recipient gets the package at their door</p>
        </div>
      </div>
    </div>
  );
};

export default ShippingDetailsForm;
