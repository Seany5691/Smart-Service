# Image Optimization Guide

## Overview

This guide explains how images are optimized for mobile performance in the Smart Service Ticketing System.

## Implementation

### 1. Next.js Image Configuration

The `next.config.ts` file includes:
- **Modern formats**: AVIF and WebP for smaller file sizes
- **Device sizes**: Optimized breakpoints (375px, 390px, 430px, 768px, 1024px, 1280px, 1920px)
- **Image sizes**: Common icon/thumbnail sizes (16px to 384px)
- **Caching**: 60-second minimum cache TTL for better performance

### 2. OptimizedImage Component

Use the `OptimizedImage` component for all images:

```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

// Basic usage
<OptimizedImage
  src="/logo.png"
  alt="Company Logo"
  width={200}
  height={50}
/>

// Responsive fill
<OptimizedImage
  src="/banner.jpg"
  alt="Banner"
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Priority loading (above the fold)
<OptimizedImage
  src="/hero.jpg"
  alt="Hero Image"
  width={1200}
  height={600}
  priority
/>
```

### 3. Lazy Loading

All images are lazy-loaded by default unless `priority={true}` is set. This improves:
- Initial page load time
- Time to Interactive (TTI)
- Bandwidth usage on mobile

### 4. Responsive Sizes

The `sizes` prop tells the browser which image size to load:

```tsx
// Mobile-first approach
sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"

// Specific breakpoints
sizes="(max-width: 375px) 375px, (max-width: 768px) 768px, 1024px"
```

### 5. Image Compression

- **Quality**: Default 75% (good balance of quality and size)
- **Formats**: AVIF (best compression) → WebP (good compression) → Original
- **Automatic**: Next.js handles compression automatically

## Best Practices

### When to Use Priority Loading

Use `priority={true}` for:
- Hero images above the fold
- Logo in header
- Critical UI images visible on page load

### When to Use Lazy Loading (Default)

Use lazy loading for:
- Images below the fold
- Gallery images
- User avatars in lists
- Background images

### Optimal Image Sizes

- **Icons**: 16px, 24px, 32px, 48px
- **Thumbnails**: 64px, 96px, 128px
- **Cards**: 256px, 384px
- **Full width mobile**: 375px, 390px, 430px
- **Tablet**: 768px
- **Desktop**: 1024px, 1280px, 1920px

## Performance Metrics

### Target Metrics on 3G Connection

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Testing

Test image loading performance:

```bash
# Run Lighthouse audit
npm run build
npm start
# Open Chrome DevTools > Lighthouse > Mobile > Run audit
```

Throttle network to 3G:
1. Open Chrome DevTools
2. Network tab > Throttling dropdown
3. Select "Slow 3G" or "Fast 3G"
4. Reload page and observe image loading

## Current Status

✅ **Completed**:
- Next.js image configuration with modern formats
- Device-specific breakpoints configured
- OptimizedImage component with lazy loading
- Loading states with skeleton animation
- Responsive sizes support

📝 **Notes**:
- The app currently uses minimal images (mostly SVG icons)
- All future images should use the OptimizedImage component
- SVG icons are already optimized and don't need the Image component
- User-uploaded images (if added) should be processed through Next.js Image API

## Future Enhancements

If user-uploaded images are added:
1. Implement image upload with automatic compression
2. Generate multiple sizes on upload
3. Store in CDN for faster delivery
4. Add image validation (size, format, dimensions)
