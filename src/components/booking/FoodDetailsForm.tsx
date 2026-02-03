import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { FoodDetails } from '@/types/booking';
import { Flame, Snowflake, UtensilsCrossed, DoorOpen } from 'lucide-react';

interface FoodDetailsFormProps {
  details: FoodDetails;
  onChange: (details: FoodDetails) => void;
}

const FoodDetailsForm: React.FC<FoodDetailsFormProps> = ({ details, onChange }) => {
  return (
    <div className="space-y-4 p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-2 text-primary">
        <span className="text-xl">🍔</span>
        <h3 className="font-semibold">Food Delivery Preferences</h3>
      </div>
      
      {/* Keep Warm */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <Label className="text-sm font-medium">Keep Warm</Label>
            <p className="text-xs text-muted-foreground">Use insulated bag for hot food</p>
          </div>
        </div>
        <Switch
          checked={details.keepWarm}
          onCheckedChange={(checked) => onChange({ ...details, keepWarm: checked, keepCold: checked ? false : details.keepCold })}
        />
      </div>
      
      {/* Keep Cold */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <Label className="text-sm font-medium">Keep Cold</Label>
            <p className="text-xs text-muted-foreground">For drinks, ice cream, etc.</p>
          </div>
        </div>
        <Switch
          checked={details.keepCold}
          onCheckedChange={(checked) => onChange({ ...details, keepCold: checked, keepWarm: checked ? false : details.keepWarm })}
        />
      </div>
      
      {/* Utensils */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-medium">Include Utensils</Label>
            <p className="text-xs text-muted-foreground">Cutlery, napkins, condiments</p>
          </div>
        </div>
        <Switch
          checked={details.utensilsNeeded}
          onCheckedChange={(checked) => onChange({ ...details, utensilsNeeded: checked })}
        />
      </div>
      
      {/* Contactless */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <Label className="text-sm font-medium">Contactless Delivery</Label>
            <p className="text-xs text-muted-foreground">Leave at door without contact</p>
          </div>
        </div>
        <Switch
          checked={details.contactlessDelivery}
          onCheckedChange={(checked) => onChange({ ...details, contactlessDelivery: checked })}
        />
      </div>
    </div>
  );
};

export default FoodDetailsForm;
