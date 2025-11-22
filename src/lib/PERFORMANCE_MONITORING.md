# Performance Monitoring Guide

## Overview

This guide explains how to monitor and optimize performance for mobile devices in the Smart Service Ticketing System.

## Core Web Vitals

### What are Core Web Vitals?

Core Web Vitals are a set of metrics that measure real-world user experience:

1. **LCP (Largest Contentful Paint)**: Loading performance
   - Measures when the largest content element becomes visible
   - Target: < 2.5 seconds

2. **FID (First Input Delay)**: Interactivity
   - Measures time from first user interaction to browser response
   - Target: < 100 milliseconds

3. **INP (Interaction to Next Paint)**: Responsiveness (replaces FID)
   - Measures overall responsiveness to user interactions
   - Target: < 200 milliseconds

4. **CLS (Cumulative Layout Shift)**: Visual stability
   - Measures unexpected layout shifts
   - Target: < 0.1

5. **FCP (First Contentful Paint)**: Initial rendering
   - Measures when first content appears
   - Target: < 1.8 seconds

6. **TTFB (Time to First Byte)**: Server response
   - Measures server response time
   - Target: < 800 milliseconds

## Implementation

### 1. Automatic Monitoring

Performance monitoring is automatically initialized in the root layout:

```tsx
// app/layout.tsx
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <PerformanceMonitor showDebugPanel={process.env.NODE_ENV === 'development'} />
      </body>
    </html>
  );
}
```

### 2. Debug Panel (Development Only)

In development mode, a debug panel is available:

1. Click the 📊 button in the bottom-right corner
2. View real-time Core Web Vitals metrics
3. See device information and connection status
4. Monitor performance as you navigate

### 3. Manual Performance Tracking

Track custom performance metrics:

```tsx
import { measurePerformance } from '@/lib/performance';

// Measure synchronous operation
const duration = measurePerformance('Data Processing', () => {
  // Your code here
  processData();
});

// Measure asynchronous operation
await measurePerformance('API Call', async () => {
  await fetchData();
});
```

### 4. Check Connection Quality

Adapt behavior based on connection speed:

```tsx
import { isSlowConnection } from '@/lib/performance';

function MyComponent() {
  const slowConnection = isSlowConnection();
  
  return (
    <div>
      {slowConnection ? (
        <LowQualityImage />
      ) : (
        <HighQualityImage />
      )}
    </div>
  );
}
```

### 5. Get Device Information

Access device capabilities:

```tsx
import { getMobilePerformanceInfo } from '@/lib/performance';

const info = getMobilePerformanceInfo();
console.log('Device memory:', info.deviceMemory);
console.log('CPU cores:', info.hardwareConcurrency);
console.log('Connection type:', info.connection?.effectiveType);
```

## Testing Performance

### 1. Lighthouse Audit

Run Lighthouse in Chrome DevTools:

```bash
# Build production version
npm run build
npm start

# Open Chrome DevTools
# Lighthouse tab > Mobile > Performance
# Click "Analyze page load"
```

**Target Scores**:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 2. Real Device Testing

Test on actual mobile devices:

1. **iPhone SE (375px)** - Smallest modern phone
2. **iPhone 12/13/14 (390px)** - Common size
3. **iPhone 14 Pro Max (430px)** - Large phone
4. **Android devices** - Various sizes

### 3. Network Throttling

Test on slow connections:

```bash
# Chrome DevTools > Network tab
# Throttling dropdown > Slow 3G or Fast 3G
# Reload page and observe metrics
```

### 4. Performance Budget

Set performance budgets to prevent regressions:

```javascript
// lighthouse-budget.json
{
  "resourceSizes": [
    {
      "resourceType": "script",
      "budget": 200
    },
    {
      "resourceType": "stylesheet",
      "budget": 20
    },
    {
      "resourceType": "image",
      "budget": 100
    }
  ],
  "timings": [
    {
      "metric": "first-contentful-paint",
      "budget": 1800
    },
    {
      "metric": "largest-contentful-paint",
      "budget": 2500
    },
    {
      "metric": "interactive",
      "budget": 3000
    }
  ]
}
```

## Optimization Strategies

### 1. Improve LCP (Largest Contentful Paint)

**Issues**:
- Large images
- Slow server response
- Render-blocking resources

**Solutions**:
```tsx
// Use priority loading for hero images
<OptimizedImage
  src="/hero.jpg"
  alt="Hero"
  priority
  width={1200}
  height={600}
/>

// Preload critical resources
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

// Optimize server response (use CDN, caching)
```

### 2. Improve FID/INP (Interactivity)

**Issues**:
- Large JavaScript bundles
- Long tasks blocking main thread
- Heavy event handlers

**Solutions**:
```tsx
// Lazy load heavy components
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
});

// Debounce expensive operations
const debouncedSearch = debounce((query) => {
  searchData(query);
}, 300);

// Use web workers for heavy computations
const worker = new Worker('/worker.js');
worker.postMessage(data);
```

### 3. Improve CLS (Cumulative Layout Shift)

**Issues**:
- Images without dimensions
- Dynamic content injection
- Web fonts causing layout shift

**Solutions**:
```tsx
// Always specify image dimensions
<OptimizedImage
  src="/image.jpg"
  alt="Image"
  width={400}
  height={300}
/>

// Reserve space for dynamic content
<div className="min-h-[200px]">
  {loading ? <Skeleton /> : <Content />}
</div>

// Use font-display: swap (already configured)
const inter = Inter({ subsets: ["latin"] });
```

### 4. Improve FCP (First Contentful Paint)

**Issues**:
- Render-blocking CSS
- Large CSS bundles
- Slow server response

**Solutions**:
```tsx
// Critical CSS is automatically inlined by Next.js
// Minimize custom CSS
// Use Tailwind utilities (automatically purged)

// Defer non-critical CSS
<link rel="stylesheet" href="/non-critical.css" media="print" onLoad="this.media='all'" />
```

### 5. Improve TTFB (Time to First Byte)

**Issues**:
- Slow server
- No caching
- Large database queries

**Solutions**:
```typescript
// Use Firebase caching
const cachedData = await getDoc(doc(db, 'collection', 'id'));

// Implement service worker caching
// Use CDN for static assets
// Optimize database queries with indexes
```

## Monitoring in Production

### 1. Google Analytics Integration

The performance monitoring automatically sends metrics to Google Analytics if configured:

```html
<!-- Add to app/layout.tsx or public/index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 2. Firebase Performance Monitoring

Add Firebase Performance Monitoring:

```bash
npm install firebase
```

```typescript
// lib/firebase/performance.ts
import { getPerformance } from 'firebase/performance';
import { app } from './config';

export const perf = getPerformance(app);
```

### 3. Custom Analytics

Send metrics to your own analytics service:

```typescript
// lib/performance.ts
function reportMetric(metric: PerformanceMetric) {
  // Send to your analytics API
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric),
  });
}
```

## Performance Checklist

### Initial Load

- [ ] LCP < 2.5s on 3G
- [ ] FCP < 1.8s on 3G
- [ ] TTFB < 800ms
- [ ] JavaScript bundle < 200KB (gzipped)
- [ ] CSS bundle < 20KB (gzipped)
- [ ] Images optimized and lazy-loaded

### Interactivity

- [ ] FID < 100ms
- [ ] INP < 200ms
- [ ] No long tasks > 50ms
- [ ] Event handlers debounced
- [ ] Heavy operations in web workers

### Visual Stability

- [ ] CLS < 0.1
- [ ] Images have dimensions
- [ ] No layout shifts during load
- [ ] Font loading optimized

### Mobile-Specific

- [ ] Touch targets ≥ 44x44px
- [ ] Text ≥ 16px (no zoom)
- [ ] Viewport configured correctly
- [ ] Works on slow connections
- [ ] Adapts to device capabilities

## Troubleshooting

### High LCP

1. Check image sizes (should be optimized)
2. Verify server response time (TTFB)
3. Look for render-blocking resources
4. Use priority loading for hero images

### High FID/INP

1. Reduce JavaScript bundle size
2. Lazy load non-critical components
3. Debounce expensive operations
4. Check for long tasks in DevTools

### High CLS

1. Add dimensions to all images
2. Reserve space for dynamic content
3. Check font loading strategy
4. Avoid inserting content above existing content

### Slow TTFB

1. Check server performance
2. Implement caching
3. Use CDN for static assets
4. Optimize database queries

## Resources

- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)

## Current Status

✅ **Implemented**:
- Automatic Core Web Vitals monitoring
- Debug panel for development
- Device information tracking
- Connection quality detection
- Custom performance measurement utilities
- LocalStorage metric persistence
- Google Analytics integration (if configured)

📊 **Metrics Tracked**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

🎯 **Target Metrics** (Mobile on 3G):
- Performance Score: > 90
- LCP: < 2.5s
- FID: < 100ms
- INP: < 200ms
- CLS: < 0.1
- FCP: < 1.8s
- TTFB: < 800ms
