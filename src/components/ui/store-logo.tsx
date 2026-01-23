import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface StoreLogoProps {
  src: string;
  name: string;
  className?: string;
  textClassName?: string;
}

const StoreLogo: React.FC<StoreLogoProps> = ({ src, name, className, textClassName }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <span className={cn("text-white font-bold text-center leading-tight", textClassName)}>
        {name}
      </span>
    );
  }

  return (
    <img 
      src={src} 
      alt={name}
      className={cn("object-contain filter brightness-0 invert", className)}
      onError={() => setImageError(true)}
    />
  );
};

export default StoreLogo;
