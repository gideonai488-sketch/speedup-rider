import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, duration = 3000 }) => {
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
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent transition-opacity duration-500',
        isExiting ? 'opacity-0' : 'opacity-100'
      )}
    >
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Speed lines */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-speed-line"
              style={{
                top: `${10 + i * 12}%`,
                left: '-100%',
                width: '200%',
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1.5s',
              }}
            />
          ))}
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-40 right-10 w-60 h-60 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-6">
        {/* Owl Logo */}
        <div className="relative animate-scale-in">
          {/* Outer glow rings */}
          <div className="absolute inset-0 scale-[1.8] animate-ping opacity-20">
            <div className="w-32 h-32 rounded-full border-2 border-white/30" />
          </div>
          <div className="absolute inset-0 scale-150 animate-pulse" style={{ animationDuration: '2s' }}>
            <div className="w-32 h-32 rounded-full border border-white/20" />
          </div>

          {/* Owl container */}
          <div className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/30 flex items-center justify-center shadow-2xl">
            {/* Stylized Owl */}
            <svg
              viewBox="0 0 100 100"
              className="w-20 h-20 drop-shadow-lg"
              fill="none"
            >
              {/* Owl body */}
              <ellipse cx="50" cy="58" rx="28" ry="32" fill="white" fillOpacity="0.95" />
              
              {/* Owl head */}
              <circle cx="50" cy="35" r="24" fill="white" />
              
              {/* Left ear */}
              <path d="M28 18 L35 35 L22 30 Z" fill="white" />
              {/* Right ear */}
              <path d="M72 18 L65 35 L78 30 Z" fill="white" />
              
              {/* Left eye outer */}
              <circle cx="40" cy="35" r="10" fill="#1e293b" />
              {/* Right eye outer */}
              <circle cx="60" cy="35" r="10" fill="#1e293b" />
              
              {/* Left eye inner */}
              <circle cx="42" cy="34" r="5" fill="white" />
              {/* Right eye inner */}
              <circle cx="62" cy="34" r="5" fill="white" />
              
              {/* Left eye pupil */}
              <circle cx="43" cy="33" r="2" fill="#1e293b" />
              {/* Right eye pupil */}
              <circle cx="63" cy="33" r="2" fill="#1e293b" />
              
              {/* Beak */}
              <path d="M45 42 L50 50 L55 42 Z" fill="#f59e0b" />
              
              {/* Chest feathers */}
              <path d="M38 55 Q50 70 62 55" stroke="#e5e7eb" strokeWidth="2" fill="none" />
              <path d="M40 62 Q50 75 60 62" stroke="#e5e7eb" strokeWidth="2" fill="none" />
              
              {/* Wings hint */}
              <path d="M25 50 Q22 65 30 80" stroke="#e5e7eb" strokeWidth="2" fill="none" />
              <path d="M75 50 Q78 65 70 80" stroke="#e5e7eb" strokeWidth="2" fill="none" />
            </svg>
          </div>

          {/* Speed swoosh around owl */}
          <div className="absolute -right-4 top-1/2 -translate-y-1/2">
            <div className="flex gap-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/60 rounded-full animate-pulse"
                  style={{
                    height: `${12 + i * 8}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Brand name with animation */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <h1 className="text-5xl font-bold text-white tracking-tight mb-2 drop-shadow-lg">
            Speed<span className="text-accent">Rush</span>
          </h1>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
            <p className="text-white/80 text-sm font-semibold tracking-[0.3em] uppercase">
              Swift • Reliable • Smart
            </p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
          </div>
        </div>

        {/* Loading animation */}
        <div className="flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {/* Speed dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{ 
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.6s'
                }}
              />
            ))}
          </div>
          
          {/* Loading bar */}
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full animate-loading-bar"
              style={{ animationDuration: `${duration - 500}ms` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-12 left-0 right-0 text-center animate-fade-in" style={{ animationDelay: '0.9s' }}>
        <p className="text-white/60 text-xs font-medium tracking-wide">
          🚀 Your delivery, at lightning speed
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
