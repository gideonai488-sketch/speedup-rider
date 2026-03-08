import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import heroFastDelivery from '@/assets/hero/hero-fast-delivery.jpg';
import heroFoodDelivery from '@/assets/hero/hero-food-delivery.jpg';
import heroGroceries from '@/assets/hero/hero-groceries.jpg';
import heroPackage from '@/assets/hero/hero-package.jpg';

interface HeroSlide {
  id: string;
  type: 'image' | 'video';
  src: string;
  poster?: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; link: string };
  gradient?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    type: 'image',
    src: heroFastDelivery,
    title: 'Lightning Fast Delivery',
    subtitle: 'From any store to your door in minutes',
    cta: { label: 'Order Now', link: '/customer/book' },
    gradient: 'from-black/70 via-black/40 to-transparent',
  },
  {
    id: '2',
    type: 'image',
    src: heroFoodDelivery,
    title: 'Delicious Food Delivered',
    subtitle: 'Your favourite meals, hot & fresh to your door',
    cta: { label: 'Order Food', link: '/customer/book?service=food' },
    gradient: 'from-primary/80 via-primary/40 to-transparent',
  },
  {
    id: '3',
    type: 'image',
    src: heroGroceries,
    title: 'Fresh Groceries',
    subtitle: 'Get fresh produce delivered from top stores',
    cta: { label: 'Browse Stores', link: '/customer/book?service=groceries' },
    gradient: 'from-accent/80 via-accent/40 to-transparent',
  },
  {
    id: '4',
    type: 'image',
    src: heroPackage,
    title: 'Send Packages Anywhere',
    subtitle: 'Reliable same-day package delivery across Ghana',
    cta: { label: 'Send Package', link: '/customer/book?service=packages' },
    gradient: 'from-black/70 via-black/40 to-transparent',
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = defaultSlides }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [isPaused, next]);

  const slide = slides[current];

  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group">
      {/* Slide content */}
      {slide.type === 'video' ? (
        <video
          key={slide.id}
          className="absolute inset-0 w-full h-full object-cover"
          src={slide.src}
          poster={slide.poster}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <img
          key={slide.id}
          src={slide.src}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
        />
      )}

      {/* Gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-t', slide.gradient || 'from-black/60 to-transparent')} />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <h2 className="text-xl font-bold text-white leading-tight animate-slide-up">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-sm text-white/80 mt-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {slide.subtitle}
          </p>
        )}
        {slide.cta && (
          <a href={slide.cta.link} className="mt-3 w-fit">
            <button className="bg-white text-foreground text-sm font-semibold px-5 py-2 rounded-full hover:bg-white/90 transition-colors shadow-lg animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {slide.cta.label}
            </button>
          </a>
        )}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
            )}
          />
        ))}
      </div>

      {/* Pause/Play for video */}
      {slide.type === 'video' && (
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
        </button>
      )}
    </div>
  );
};

export default HeroCarousel;
