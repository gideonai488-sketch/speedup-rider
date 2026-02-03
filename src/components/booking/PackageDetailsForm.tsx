import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { PackageDetails, PACKAGE_SIZES } from '@/types/booking';
import { cn } from '@/lib/utils';
import { Package, AlertTriangle, Shield, Camera } from 'lucide-react';

interface PackageDetailsFormProps {
  details: PackageDetails;
  onChange: (details: PackageDetails) => void;
}

const PackageDetailsForm: React.FC<PackageDetailsFormProps> = ({ details, onChange }) => {
  return (
    <div className="space-y-5 p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-2 text-primary">
        <Package className="w-5 h-5" />
        <h3 className="font-semibold">Package Details</h3>
      </div>
      
      {/* Package Size */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Package Size</Label>
        <div className="grid grid-cols-2 gap-2">
          {PACKAGE_SIZES.map((size) => (
            <button
              key={size.value}
              type="button"
              onClick={() => onChange({ ...details, size: size.value })}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all',
                details.size === size.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="font-medium text-foreground">{size.label}</div>
              <div className="text-xs text-muted-foreground">{size.description}</div>
              <div className="text-xs text-primary mt-1">{size.maxWeight}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Fragile Toggle */}
      <div className="flex items-center justify-between p-3 bg-warning/5 rounded-xl border border-warning/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <div>
            <Label className="text-sm font-medium">Fragile / Handle with Care</Label>
            <p className="text-xs text-muted-foreground">Rider will take extra precautions</p>
          </div>
        </div>
        <Switch
          checked={details.isFragile}
          onCheckedChange={(checked) => onChange({ ...details, isFragile: checked })}
        />
      </div>
      
      {/* Declared Value */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">Declared Value (for insurance)</Label>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">GH₵</span>
          <Input
            type="number"
            placeholder="0.00"
            value={details.declaredValue || ''}
            onChange={(e) => onChange({ ...details, declaredValue: parseFloat(e.target.value) || 0 })}
            className="pl-12"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Insurance covers up to 80% of declared value. Fee: 2% of value.
        </p>
      </div>
      
      {/* Photo Upload Placeholder */}
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Package Photo (optional)
        </Label>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <Camera className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Tap to add a photo of your package</p>
          <p className="text-xs text-muted-foreground mt-1">Helps the rider identify it</p>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailsForm;
