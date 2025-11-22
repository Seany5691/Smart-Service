'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
}

/**
 * Optimized image component for mobile performance
 * - Uses Next.js Image for automatic optimization
 * - Lazy loads by default (unless priority is set)
 * - Provides responsive sizes for different viewports
 * - Shows loading state with skeleton
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
  sizes,
  quality = 75,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Default responsive sizes if not provided
  const defaultSizes = sizes || '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 animate-pulse" />
      )}
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={defaultSizes}
        quality={quality}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        onLoad={() => setIsLoading(false)}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
      />
    </div>
  );
}
