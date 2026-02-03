import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DeliveryTiming } from '@/types/booking';
import { cn } from '@/lib/utils';
import { Clock, Calendar, Zap } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';

interface ScheduleSelectorProps {
  timing: DeliveryTiming;
  scheduledDate?: Date;
  scheduledTime?: string;
  onTimingChange: (timing: DeliveryTiming) => void;
  onScheduleChange: (date: Date, time: string) => void;
}

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
  '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

const ScheduleSelector: React.FC<ScheduleSelectorProps> = ({
  timing,
  scheduledDate,
  scheduledTime,
  onTimingChange,
  onScheduleChange,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(scheduledDate || new Date());
  const [selectedTime, setSelectedTime] = useState<string>(scheduledTime || '10:00');
  
  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onScheduleChange(date, selectedTime);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onScheduleChange(selectedDate, time);
  };
  
  const formatTimeDisplay = (time: string) => {
    const [hours] = time.split(':');
    const hour = parseInt(hours);
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="space-y-4 p-4 bg-card rounded-xl border border-border">
      <div className="flex items-center gap-2 text-primary">
        <Clock className="w-5 h-5" />
        <h3 className="font-semibold">Delivery Timing</h3>
      </div>
      
      {/* ASAP vs Scheduled */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onTimingChange('asap')}
          className={cn(
            'p-4 rounded-xl border-2 transition-all text-center',
            timing === 'asap'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
        >
          <Zap className={cn(
            'w-6 h-6 mx-auto mb-2',
            timing === 'asap' ? 'text-primary' : 'text-muted-foreground'
          )} />
          <span className="font-semibold text-foreground block">Now</span>
          <span className="text-xs text-muted-foreground">Deliver ASAP</span>
        </button>
        
        <button
          type="button"
          onClick={() => {
            onTimingChange('scheduled');
            onScheduleChange(selectedDate, selectedTime);
          }}
          className={cn(
            'p-4 rounded-xl border-2 transition-all text-center',
            timing === 'scheduled'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
        >
          <Calendar className={cn(
            'w-6 h-6 mx-auto mb-2',
            timing === 'scheduled' ? 'text-primary' : 'text-muted-foreground'
          )} />
          <span className="font-semibold text-foreground block">Schedule</span>
          <span className="text-xs text-muted-foreground">Pick date & time</span>
        </button>
      </div>
      
      {/* Date & Time Picker (shown when scheduled) */}
      {timing === 'scheduled' && (
        <div className="space-y-4 pt-4 border-t border-border animate-in fade-in-0 slide-in-from-top-2">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Date</Label>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {availableDates.map((date, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  className={cn(
                    'shrink-0 p-3 rounded-xl border-2 text-center min-w-[70px] transition-all',
                    format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <span className="text-xs text-muted-foreground block">
                    {i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : format(date, 'EEE')}
                  </span>
                  <span className="font-bold text-foreground text-lg block">{format(date, 'd')}</span>
                  <span className="text-xs text-muted-foreground">{format(date, 'MMM')}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Time</Label>
            <div className="grid grid-cols-4 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={cn(
                    'p-2 rounded-lg border transition-all text-sm font-medium',
                    selectedTime === time
                      ? 'border-primary bg-primary text-white'
                      : 'border-border hover:border-primary/50 text-foreground'
                  )}
                >
                  {formatTimeDisplay(time)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Summary */}
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
            <p className="text-sm text-primary font-medium">
              Scheduled for {format(selectedDate, 'EEEE, MMMM d')} at {formatTimeDisplay(selectedTime)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleSelector;
