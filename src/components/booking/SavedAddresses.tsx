import React from 'react';
import { Button } from '@/components/ui/button';
import { SavedAddress } from '@/types/booking';
import { cn } from '@/lib/utils';
import { Home, Briefcase, MapPin, Star, Plus } from 'lucide-react';

interface SavedAddressesProps {
  addresses: SavedAddress[];
  onSelect: (address: SavedAddress) => void;
  selectedId?: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Home': <Home className="w-4 h-4" />,
  'Work': <Briefcase className="w-4 h-4" />,
  'default': <MapPin className="w-4 h-4" />,
};

// Mock saved addresses (in production, fetch from user profile)
const MOCK_SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'home-1',
    label: 'Home',
    address: 'East Legon, American House',
    lat: 5.6350,
    lng: -0.1556,
    isDefault: true,
  },
  {
    id: 'work-1',
    label: 'Work',
    address: 'Airport City, Accra',
    lat: 5.5950,
    lng: -0.1703,
  },
];

const SavedAddresses: React.FC<SavedAddressesProps> = ({ 
  addresses = MOCK_SAVED_ADDRESSES, 
  onSelect,
  selectedId 
}) => {
  if (addresses.length === 0) {
    return (
      <div className="p-4 border border-dashed border-border rounded-xl text-center">
        <MapPin className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No saved addresses</p>
        <Button variant="link" size="sm" className="mt-1">
          <Plus className="w-4 h-4 mr-1" />
          Add Address
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">Saved Addresses</p>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelect(addr)}
            className={cn(
              'shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all',
              selectedId === addr.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card hover:border-primary/50 text-foreground'
            )}
          >
            {addr.isDefault && <Star className="w-3 h-3 text-warning fill-warning" />}
            {ICON_MAP[addr.label] || ICON_MAP['default']}
            <span className="font-medium text-sm">{addr.label}</span>
          </button>
        ))}
        <button
          type="button"
          className="shrink-0 flex items-center gap-1 px-4 py-2.5 rounded-full border border-dashed border-border hover:border-primary/50 text-muted-foreground transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add New</span>
        </button>
      </div>
    </div>
  );
};

export default SavedAddresses;
