import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeliveryStop } from '@/types/booking';
import AddressAutocomplete from '@/components/location/AddressAutocomplete';
import { Plus, X, MapPin, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiStopInputProps {
  stops: DeliveryStop[];
  onChange: (stops: DeliveryStop[]) => void;
  maxStops?: number;
}

const MultiStopInput: React.FC<MultiStopInputProps> = ({ 
  stops, 
  onChange, 
  maxStops = 3 
}) => {
  const addStop = () => {
    if (stops.length >= maxStops) return;
    const newStop: DeliveryStop = {
      id: `stop-${Date.now()}`,
      address: '',
      coords: null,
      landmark: '',
      contactName: '',
      contactPhone: '',
      order: stops.length + 1,
    };
    onChange([...stops, newStop]);
  };

  const removeStop = (id: string) => {
    if (stops.length <= 1) return;
    const updated = stops
      .filter(s => s.id !== id)
      .map((s, i) => ({ ...s, order: i + 1 }));
    onChange(updated);
  };

  const updateStop = (id: string, updates: Partial<DeliveryStop>) => {
    onChange(stops.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Dropoff Location{stops.length > 1 ? 's' : ''}</Label>
        {stops.length < maxStops && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addStop}
            className="text-primary hover:text-primary/80"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Stop
          </Button>
        )}
      </div>
      
      <div className="relative">
        {/* Vertical line connecting stops */}
        {stops.length > 1 && (
          <div className="absolute left-[1.375rem] top-8 bottom-8 w-0.5 bg-border" />
        )}
        
        <div className="space-y-3">
          {stops.map((stop, index) => (
            <div 
              key={stop.id}
              className={cn(
                'relative bg-card rounded-xl border border-border p-4 transition-all',
                'hover:border-primary/50'
              )}
            >
              {/* Stop indicator */}
              <div className="absolute left-4 top-4 flex items-center">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold z-10',
                  index === stops.length - 1 ? 'bg-coral text-white' : 'bg-primary text-white'
                )}>
                  {index + 1}
                </div>
              </div>
              
              <div className="pl-10 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      {stops.length === 1 ? 'DROPOFF LOCATION' : `STOP ${index + 1}`}
                      {index === stops.length - 1 && stops.length > 1 && ' (FINAL)'}
                    </Label>
                    <AddressAutocomplete
                      value={stop.address}
                      onChange={(address, coords) => updateStop(stop.id, { address, coords: coords || null })}
                      placeholder="Enter dropoff address"
                      icon="dropoff"
                      className="border-0 shadow-none p-0"
                    />
                  </div>
                  {stops.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeStop(stop.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <Input
                  placeholder="Landmark (optional)"
                  value={stop.landmark || ''}
                  onChange={(e) => updateStop(stop.id, { landmark: e.target.value })}
                  className="border-0 p-0 h-auto text-sm text-muted-foreground focus-visible:ring-0"
                />
                
                {/* Contact for each stop */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                  <Input
                    placeholder="Receiver name"
                    value={stop.contactName || ''}
                    onChange={(e) => updateStop(stop.id, { contactName: e.target.value })}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Phone"
                    value={stop.contactPhone || ''}
                    onChange={(e) => updateStop(stop.id, { contactPhone: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {stops.length < maxStops && (
        <p className="text-xs text-muted-foreground text-center">
          You can add up to {maxStops} dropoff locations • +GH₵ 5 per extra stop
        </p>
      )}
    </div>
  );
};

export default MultiStopInput;
