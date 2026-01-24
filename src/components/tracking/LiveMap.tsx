import React, { useEffect, useState, useRef } from 'react';
import { Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Location {
  lat: number;
  lng: number;
}

interface LiveMapProps {
  pickupLocation: Location;
  dropoffLocation: Location;
  riderLocation?: Location;
  status: string;
}

const LiveMap: React.FC<LiveMapProps> = ({ 
  pickupLocation, 
  dropoffLocation, 
  riderLocation,
  status 
}) => {
  const [animatedRiderPos, setAnimatedRiderPos] = useState({ x: 15, y: 50 });
  const [pulse, setPulse] = useState(false);

  // Animate rider position
  useEffect(() => {
    const progressMap: Record<string, number> = {
      searching: 0,
      accepted: 10,
      arriving: 35,
      picked_up: 50,
      delivering: 80,
      delivered: 100,
    };

    const targetProgress = progressMap[status] || 0;
    
    // Calculate position along a curved path
    const updatePosition = () => {
      const x = 15 + (targetProgress * 0.7);
      const y = 50 - Math.sin((targetProgress / 100) * Math.PI) * 15;
      setAnimatedRiderPos({ x, y });
    };

    const timeout = setTimeout(updatePosition, 100);
    return () => clearTimeout(timeout);
  }, [status]);

  // Pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => !p);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-secondary/50 to-secondary rounded-2xl overflow-hidden">
      {/* Map Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Street Lines */}
      <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
        {/* Background streets */}
        <path 
          d="M 0,30% L 100%,30%" 
          stroke="hsl(var(--border))" 
          strokeWidth="8" 
          fill="none"
          opacity="0.5"
        />
        <path 
          d="M 30%,0 L 30%,100%" 
          stroke="hsl(var(--border))" 
          strokeWidth="8" 
          fill="none"
          opacity="0.5"
        />
        <path 
          d="M 70%,0 L 70%,100%" 
          stroke="hsl(var(--border))" 
          strokeWidth="8" 
          fill="none"
          opacity="0.5"
        />

        {/* Route Path */}
        <defs>
          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        
        {/* Route shadow */}
        <path 
          d="M 15%,50% Q 30%,25% 50%,45% T 85%,40%" 
          stroke="hsl(var(--primary))" 
          strokeWidth="6" 
          fill="none"
          opacity="0.2"
          strokeLinecap="round"
        />
        
        {/* Main route */}
        <path 
          d="M 15%,50% Q 30%,25% 50%,45% T 85%,40%" 
          stroke="url(#routeGrad)" 
          strokeWidth="4" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="12 8"
          className="animate-pulse"
        />

        {/* Animated route trace */}
        <path 
          d="M 15%,50% Q 30%,25% 50%,45% T 85%,40%" 
          stroke="hsl(var(--primary))" 
          strokeWidth="4" 
          fill="none"
          strokeLinecap="round"
          strokeDasharray="1000"
          strokeDashoffset={1000 - (animatedRiderPos.x / 85) * 1000}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>

      {/* Pickup Location */}
      <div 
        className="absolute transition-all duration-300"
        style={{ left: '15%', top: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className={cn(
            "absolute inset-0 -m-3 rounded-full bg-primary/30 transition-transform duration-700",
            pulse ? "scale-150 opacity-0" : "scale-100 opacity-100"
          )} />
          
          {/* Location marker */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg relative z-10">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          
          {/* Label */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-card px-3 py-1.5 rounded-lg shadow-lg border border-border whitespace-nowrap">
            <p className="text-xs font-semibold text-primary">Pickup</p>
          </div>
        </div>
      </div>

      {/* Dropoff Location */}
      <div 
        className="absolute transition-all duration-300"
        style={{ left: '85%', top: '40%', transform: 'translate(-50%, -50%)' }}
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className={cn(
            "absolute inset-0 -m-4 rounded-full bg-accent/30 transition-transform duration-700",
            pulse ? "scale-150 opacity-0" : "scale-100 opacity-100"
          )} style={{ animationDelay: '0.5s' }} />
          
          {/* Location marker with pin shape */}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg relative z-10">
              <div className="w-4 h-4 bg-white rounded-full" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-accent" />
          </div>
          
          {/* Label */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-card px-3 py-1.5 rounded-lg shadow-lg border border-border whitespace-nowrap">
            <p className="text-xs font-semibold text-accent-foreground">Dropoff</p>
          </div>
        </div>
      </div>

      {/* Rider Marker */}
      {status !== 'searching' && status !== 'delivered' && (
        <div 
          className="absolute transition-all duration-1000 ease-out"
          style={{ 
            left: `${animatedRiderPos.x}%`, 
            top: `${animatedRiderPos.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 -m-4 rounded-full bg-primary/40 blur-xl animate-pulse" />
            
            {/* Speed lines */}
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-primary/50 rounded-full animate-pulse"
                  style={{ 
                    height: `${8 + i * 4}px`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
              ))}
            </div>
            
            {/* Rider icon */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl relative z-10 animate-float">
              <span className="text-2xl">🏍️</span>
            </div>
            
            {/* Direction indicator */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-success flex items-center justify-center border-2 border-white shadow-lg">
              <Navigation className="w-3 h-3 text-white" style={{ transform: 'rotate(45deg)' }} />
            </div>
          </div>
        </div>
      )}

      {/* Searching animation */}
      {status === 'searching' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute inset-0 rounded-full border-2 border-primary animate-ping"
                style={{
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: '2s',
                  width: `${80 + i * 40}px`,
                  height: `${80 + i * 40}px`,
                  left: `${-(40 + i * 20)}px`,
                  top: `${-(40 + i * 20)}px`,
                }}
              />
            ))}
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-2xl animate-pulse">🔍</span>
            </div>
          </div>
        </div>
      )}

      {/* ETA indicator */}
      {status !== 'searching' && status !== 'delivered' && (
        <div className="absolute top-4 right-4 bg-card rounded-xl px-4 py-2 shadow-lg border border-border">
          <p className="text-xs text-muted-foreground">Arriving in</p>
          <p className="text-lg font-bold text-primary">
            {status === 'delivering' ? '3' : status === 'picked_up' ? '8' : '12'} min
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
