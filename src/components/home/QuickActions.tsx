import React from 'react';
import { Shirt, Sparkles, Timer, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  { icon: Shirt, label: 'Wash & Fold', color: 'bg-primary/10 text-primary' },
  { icon: Sparkles, label: 'Dry Clean', color: 'bg-accent/10 text-accent' },
  { icon: Timer, label: 'Express', color: 'bg-coral/10 text-coral' },
  { icon: Package, label: 'Bulk Order', color: 'bg-success/10 text-success' },
];

const QuickActions: React.FC = () => {
  return (
    <section className="px-4 py-4">
      <div className="grid grid-cols-4 gap-3">
        {actions.map(({ icon: Icon, label, color }) => (
          <button
            key={label}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300',
                'group-hover:scale-105 group-hover:shadow-md',
                color
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-medium text-foreground text-center">
              {label}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default QuickActions;
