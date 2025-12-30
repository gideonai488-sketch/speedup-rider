import React, { useEffect, useState } from 'react';
import { Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, duration = 2500 }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 500);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center gradient-hero transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-60 h-60 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        
        {/* Floating bubbles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-4 h-4 bg-white/20 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              bottom: `${10 + (i % 3) * 10}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Logo container with animated rings */}
        <div className="relative">
          {/* Outer ring */}
          <div className="absolute inset-0 scale-150 animate-ping opacity-20">
            <div className="w-28 h-28 rounded-full border-2 border-white/30" />
          </div>
          
          {/* Middle ring */}
          <div 
            className="absolute inset-0 scale-125 animate-pulse"
            style={{ animationDuration: '2s' }}
          >
            <div className="w-28 h-28 rounded-full border border-white/20" />
          </div>

          {/* Logo icon */}
          <div className="relative w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center animate-scale-in shadow-2xl">
            <div className="relative">
              <Droplets className="w-14 h-14 text-white drop-shadow-lg" strokeWidth={1.5} />
              {/* Water drop animation */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDuration: '1s' }} />
            </div>
          </div>
        </div>

        {/* Brand name */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            FreshWash
          </h1>
          <p className="text-white/70 text-sm font-medium tracking-widest uppercase">
            Laundry Made Easy
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-12 left-0 right-0 text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <p className="text-white/50 text-xs">
          Professional Care • Free Pickup • Fast Delivery
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
