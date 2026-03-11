import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import heroFastDelivery from '@/assets/hero/hero-fast-delivery-v2.jpg';
import heroFood from '@/assets/hero/hero-food-v2.jpg';
import heroGroceries from '@/assets/hero/hero-groceries-v2.jpg';
import heroPackage from '@/assets/hero/hero-package-v2.jpg';
import heroCampus from '@/assets/hero/hero-campus-v2.jpg';
import heroFleet from '@/assets/hero/hero-fleet-v2.jpg';
import heroTracking from '@/assets/hero/hero-tracking-v2.jpg';

interface HeroSlide {
  id: string;
  src: string;
  title: string;
  subtitle?: string;
  cta?: { label: string; link: string };
  gradient?: string;
}

const defaultSlides: HeroSlide[] = [
  {
    id: '1',
    src: heroFastDelivery,
    title: 'Lightning Fast Delivery',
    subtitle: 'From any store to your door in minutes',
    cta: { label: 'Order Now', link: '/customer/book' },
    gradient: 'from-black/70 via-black/30 to-transparent',
  },
  {
    id: '2',
    src: heroFood,
    title: 'Delicious Food Delivered Hot',
    subtitle: 'Your favourite meals, fresh to your door',
    cta: { label: 'Order Food', link: '/customer/book?service=food' },
    gradient: 'from-black/70 via-black/30 to-transparent',
  },
  {
    id: '3',
    src: heroGroceries,
    title: 'Fresh Groceries Delivered',
    subtitle: 'Get fresh produce from top stores',
    cta: { label: 'Browse Stores', link: '/customer/book?service=groceries' },
    gradient: 'from-black/60 via-black/20 to-transparent',
  },
  {
    id: '4',
    src: heroPackage,
    title: 'Send Packages Anywhere',
    subtitle: 'Reliable same-day package delivery',
    cta: { label: 'Send Package', link: '/customer/book?service=packages' },
    gradient: 'from-black/70 via-black/30 to-transparent',
  },
  {
    id: '5',
    src: heroCampus,
    title: 'Campus Delivery Made Easy',
    subtitle: 'Food, groceries & more — delivered in 30 mins',
    cta: { label: 'Order Now', link: '/customer/book' },
    gradient: 'from-black/60 via-black/20 to-transparent',
  },
  {
    id: '6',
    src: heroFleet,
    title: 'Ride & Earn With Us',
    subtitle: 'Join our fleet — flexible hours, weekly payouts',
    cta: { label: 'Start Earning', link: '/rider/auth' },
    gradient: 'from-black/70 via-black/30 to-transparent',
  },
  {
    id: '7',
    src: heroTracking,
    title: 'Track Every Delivery Live',
    subtitle: 'Real-time GPS tracking on every order',
    cta: { label: 'Learn More', link: '/customer/book' },
    gradient: 'from-black/60 via-black/20 to-transparent',
  },
];

interface HeroCarouselProps {
  slides?: HeroSlide[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ slides = defaultSlides }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

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
    <div
      className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <img
        key={slide.id}
        src={slide.src}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
      />

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
    </div>
  );
};

export default HeroCarousel;
