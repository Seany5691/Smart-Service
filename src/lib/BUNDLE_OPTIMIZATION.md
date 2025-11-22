# JavaScript Bundle Optimization Guide

## Overview

This guide explains how JavaScript bundles are optimized for mobile performance in the Smart Service Ticketing System.

## Implementation

### 1. Code Splitting by Route

Next.js automatically splits code by route. Each page only loads the JavaScript it needs:

```
/dashboard          → dashboard.js
/dashboard/tickets  → tickets.js
/dashboard/customers → customers.js
```

**Benefits**:
- Faster initial page load
- Reduced Time to Interactive (TTI)
- Better caching (unchanged routes don't re-download)

### 2. Lazy Loading Modals

Modals are lazy-loaded to reduce initial bundle size:

```tsx
// ❌ Old way - loads modal immediately
import EnhancedTicketModal from '@/components/modals/EnhancedTicketModal';

// ✅ New way - loads modal only when opened
import { LazyEnhancedTicketModal } from '@/components/LazyModal';

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <Button onClick={() => setShowModal(true)}>New Ticket</Button>
      <LazyEnhancedTicketModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
      />
    </>
  );
}
```

**Available Lazy Modals**:
- `LazyEnhancedTicketModal`
- `LazyCustomerModal`
- `LazyAddContactModal`
- `LazyAddHardwareModal`
- `LazyAddInventoryModal`
- `LazyAddInvoiceModal`
- `LazyAddTaskModal`
- `LazyConfirmModal`

### 3. Package Import Optimization

The `next.config.ts` optimizes imports from large packages:

```typescript
experimental: {
  optimizePackageImports: [
    'lucide-react',    // Only imports used icons
    'recharts',        // Only imports used charts
    'date-fns',        // Only imports used functions
    'framer-motion',   // Only imports used components
  ],
}
```

**Impact**:
- Lucide React: ~500KB → ~50KB (only used icons)
- Date-fns: ~200KB → ~20KB (only used functions)
- Recharts: ~400KB → ~100KB (only used charts)

### 4. Turbopack Code Splitting (Next.js 16+)

Next.js 16 uses Turbopack by default, which automatically handles code splitting:

```typescript
// next.config.ts
turbopack: {}
```

**Automatic Optimizations**:
- Intelligent code splitting by route
- Vendor chunk separation
- Common code extraction
- Tree-shaking and dead code elimination
- Faster builds (7x faster than webpack)

**Benefits**:
- Better caching (vendor code changes less frequently)
- Parallel downloads (browser can load multiple chunks)
- Smaller initial bundle
- Faster build times

### 5. SWC Minification

Next.js automatically uses SWC (Speedy Web Compiler) for faster builds and smaller bundles.

**Benefits**:
- 7x faster than Terser
- Better compression
- Smaller bundle sizes
- Built-in with Next.js (no configuration needed)

## Migration Guide

### Converting Existing Modal Usage

1. **Find modal imports**:
```tsx
import EnhancedTicketModal from '@/components/modals/EnhancedTicketModal';
```

2. **Replace with lazy version**:
```tsx
import { LazyEnhancedTicketModal } from '@/components/LazyModal';
```

3. **Update component usage** (no changes needed):
```tsx
<LazyEnhancedTicketModal isOpen={showModal} onClose={handleClose} />
```

### Creating Custom Lazy Components

For other heavy components:

```tsx
import { createLazyModal } from '@/components/LazyModal';

const LazyMyComponent = createLazyModal(
  () => import('@/components/MyComponent')
);

// Use it
<LazyMyComponent isOpen={show} {...props} />
```

## Performance Metrics

### Target Metrics

- **Initial Bundle Size**: < 200KB (gzipped)
- **Time to Interactive (TTI)**: < 3s on 3G
- **First Input Delay (FID)**: < 100ms
- **Total Blocking Time (TBT)**: < 300ms

### Measuring Bundle Size

```bash
# Build the app
npm run build

# Check bundle sizes in output
# Look for:
# - First Load JS shared by all
# - Route-specific bundles
# - Chunk sizes
```

### Analyzing Bundle

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

## Best Practices

### 1. Import Only What You Need

```tsx
// ❌ Bad - imports entire library
import _ from 'lodash';

// ✅ Good - imports only needed function
import debounce from 'lodash/debounce';
```

### 2. Use Dynamic Imports for Heavy Components

```tsx
// ❌ Bad - loads chart library immediately
import { LineChart } from 'recharts';

// ✅ Good - loads only when needed
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
  loading: () => <div>Loading chart...</div>,
  ssr: false,
});
```

### 3. Avoid Large Dependencies

Before adding a package, check its size:
```bash
npm install -g bundle-phobia-cli
bundle-phobia <package-name>
```

### 4. Use Native APIs When Possible

```tsx
// ❌ Bad - adds moment.js (67KB)
import moment from 'moment';
const formatted = moment(date).format('YYYY-MM-DD');

// ✅ Good - uses native Intl API (0KB)
const formatted = new Intl.DateTimeFormat('en-US').format(date);
```

## Current Status

✅ **Completed**:
- Automatic route-based code splitting
- Lazy loading utility for modals
- Package import optimization (lucide-react, recharts, date-fns, framer-motion)
- Webpack chunk splitting configuration
- SWC minification enabled
- Vendor/common/lib chunk separation

📝 **Recommendations**:
- Migrate existing modal imports to lazy versions
- Consider lazy loading chart components (recharts)
- Monitor bundle sizes after each feature addition
- Run bundle analyzer periodically

## Testing

### 1. Test Initial Load Time

```bash
# Build production version
npm run build
npm start

# Open Chrome DevTools
# Network tab > Throttling > Slow 3G
# Reload page and measure:
# - Time to First Byte (TTFB)
# - First Contentful Paint (FCP)
# - Time to Interactive (TTI)
```

### 2. Test Code Splitting

```bash
# Build and check output
npm run build

# Look for:
# ✓ Multiple chunk files
# ✓ Vendor chunk separate from app code
# ✓ Route-specific bundles
```

### 3. Lighthouse Audit

```bash
# Run Lighthouse
# Chrome DevTools > Lighthouse > Mobile > Performance
# Target scores:
# - Performance: > 90
# - First Contentful Paint: < 1.5s
# - Time to Interactive: < 3s
# - Total Blocking Time: < 300ms
```

## Future Optimizations

### 1. Service Worker for Caching

```typescript
// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

module.exports = withPWA(nextConfig);
```

### 2. Preload Critical Resources

```tsx
// app/layout.tsx
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
```

### 3. Resource Hints

```tsx
<link rel="dns-prefetch" href="https://firestore.googleapis.com" />
<link rel="preconnect" href="https://firestore.googleapis.com" />
```

## Troubleshooting

### Bundle Too Large

1. Run bundle analyzer to identify large dependencies
2. Check if dependencies can be replaced with lighter alternatives
3. Ensure tree-shaking is working (use ES modules)
4. Consider lazy loading heavy components

### Slow Time to Interactive

1. Reduce JavaScript execution time
2. Lazy load non-critical components
3. Use code splitting more aggressively
4. Defer non-critical scripts

### High Total Blocking Time

1. Break up long tasks (use setTimeout for heavy operations)
2. Lazy load components below the fold
3. Optimize third-party scripts
4. Use web workers for heavy computations
