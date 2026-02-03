import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ErrandDetails, ERRAND_TASK_TYPES, DeliveryTiming } from '@/types/booking';
import { cn } from '@/lib/utils';
import { Clock, Receipt, Wallet } from 'lucide-react';

interface ErrandDetailsFormProps {
  details: ErrandDetails;
  onChange: (details: ErrandDetails) => void;
}

const ErrandDetailsForm: React.FC<ErrandDetailsFormProps> = ({ details, onChange }) => {
  return (
    <div className="space-y-5 p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-2 text-primary">
        <span className="text-xl">📋</span>
        <h3 className="font-semibold">Errand Details</h3>
      </div>
      
      {/* Task Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">What do you need done?</Label>
        <div className="grid grid-cols-2 gap-2">
          {ERRAND_TASK_TYPES.map((task) => (
            <button
              key={task.value}
              type="button"
              onClick={() => onChange({ ...details, taskType: task.value })}
              className={cn(
                'p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3',
                details.taskType === task.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <span className="text-2xl">{task.icon}</span>
              <span className="font-medium text-foreground text-sm">{task.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Task Description */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Describe the task</Label>
        <Textarea
          placeholder="Provide details about what you need done..."
          value={details.taskDescription}
          onChange={(e) => onChange({ ...details, taskDescription: e.target.value })}
          rows={3}
        />
      </div>
      
      {/* Budget Amount */}
      {(details.taskType === 'buy_something' || details.taskType === 'pay_bills') && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <Label className="text-sm font-medium">Budget for Purchase</Label>
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">GH₵</span>
            <Input
              type="number"
              placeholder="0.00"
              value={details.budgetAmount || ''}
              onChange={(e) => onChange({ ...details, budgetAmount: parseFloat(e.target.value) || 0 })}
              className="pl-12"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Give the rider this amount plus delivery fee
          </p>
        </div>
      )}
      
      {/* Timing */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <Label className="text-sm font-medium">When do you need this done?</Label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...details, timing: 'asap' })}
            className={cn(
              'p-3 rounded-xl border-2 text-center transition-all',
              details.timing === 'asap'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <span className="font-medium text-foreground">ASAP</span>
            <p className="text-xs text-muted-foreground">As soon as possible</p>
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...details, timing: 'scheduled' })}
            className={cn(
              'p-3 rounded-xl border-2 text-center transition-all',
              details.timing === 'scheduled'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <span className="font-medium text-foreground">Schedule</span>
            <p className="text-xs text-muted-foreground">Pick a date & time</p>
          </button>
        </div>
      </div>
      
      {/* Receipt Required */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary/50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <Label className="text-sm font-medium">Receipt/Proof Required</Label>
            <p className="text-xs text-muted-foreground">Rider must send photo proof</p>
          </div>
        </div>
        <Switch
          checked={details.requireReceipt}
          onCheckedChange={(checked) => onChange({ ...details, requireReceipt: checked })}
        />
      </div>
    </div>
  );
};

export default ErrandDetailsForm;
