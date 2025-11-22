# Responsive Utilities

This document describes the responsive utility functions and hooks available for mobile optimization.

## Overview

The responsive utilities provide JavaScript-based breakpoint detection and orientation tracking. These utilities complement Tailwind CSS's responsive classes and should be used when you need conditional logic that can't be achieved with CSS alone.

## Breakpoints

The system uses the following breakpoints, matching Tailwind CSS:

- **Mobile**: `< 768px` (default styles)
- **Tablet**: `768px - 1023px` (`md:` prefix in Tailwind)
- **Desktop**: `≥ 1024px` (`lg:` prefix in Tailwind)

## Hooks

### `useBreakpoint()`

Returns the current breakpoint as a string: `'mobile'`, `'tablet'`, or `'desktop'`.

```typescript
import { useBreakpoint } from '@/lib/responsive';

function MyComponent() {
  const breakpoint = useBreakpoint();
  
  return (
    <div>
      {breakpoint === 'mobile' && <MobileView />}
      {breakpoint === 'tablet' && <TabletView />}
      {breakpoint === 'desktop' && <DesktopView />}
    </div>
  );
}
```

### `useIsMobile()`

Returns `true` if the viewport width is less than 768px.

```typescript
import { useIsMobile } from '@/lib/responsive';

function MyComponent() {
  const isMobile = useIsMobile();
  
  return (
    <div>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
    </div>
  );
}
```

### `useIsTablet()`

Returns `true` if the viewport width is between 768px and 1023px.

```typescript
import { useIsTablet } from '@/lib/responsive';

function MyComponent() {
  const isTablet = useIsTablet();
  
  return (
    <div>
      {isTablet && <TabletSpecificFeature />}
    </div>
  );
}
```

### `useIsDesktop()`

Returns `true` if the viewport width is 1024px or greater.

```typescript
import { useIsDesktop } from '@/lib/responsive';

function MyComponent() {
  const isDesktop = useIsDesktop();
  
  return (
    <div>
      {isDesktop && <AdvancedFeatures />}
    </div>
  );
}
```

### `useOrientation()`

Returns the current device orientation: `'portrait'` or `'landscape'`.

```typescript
import { useOrientation } from '@/lib/responsive';

function MyComponent() {
  const orientation = useOrientation();
  
  return (
    <div>
      <p>Current orientation: {orientation}</p>
    </div>
  );
}
```

### `useIsPortrait()`

Returns `true` if the device is in portrait orientation.

```typescript
import { useIsPortrait } from '@/lib/responsive';

function MyComponent() {
  const isPortrait = useIsPortrait();
  
  return (
    <div>
      {isPortrait && <PortraitLayout />}
    </div>
  );
}
```

### `useIsLandscape()`

Returns `true` if the device is in landscape orientation.

```typescript
import { useIsLandscape } from '@/lib/responsive';

function MyComponent() {
  const isLandscape = useIsLandscape();
  
  return (
    <div>
      {isLandscape && <LandscapeLayout />}
    </div>
  );
}
```

## Synchronous Utilities

These functions can be used in event handlers or other non-React contexts. They should only be used in client-side code (not during SSR).

### `getCurrentBreakpoint()`

Returns the current breakpoint synchronously.

```typescript
import { getCurrentBreakpoint } from '@/lib/responsive';

function handleClick() {
  const breakpoint = getCurrentBreakpoint();
  console.log('Current breakpoint:', breakpoint);
}
```

### `isMobile()`, `isTablet()`, `isDesktop()`

Synchronous boolean checks for each breakpoint.

```typescript
import { isMobile, isTablet, isDesktop } from '@/lib/responsive';

function handleResize() {
  if (isMobile()) {
    console.log('Mobile view');
  } else if (isTablet()) {
    console.log('Tablet view');
  } else {
    console.log('Desktop view');
  }
}
```

## Best Practices

### 1. Prefer Tailwind CSS Classes

For most responsive styling, use Tailwind's responsive classes:

```tsx
// ✅ Good - Use Tailwind for styling
<div className="p-4 lg:p-6">
  <h1 className="text-2xl lg:text-4xl">Title</h1>
</div>

// ❌ Avoid - Don't use hooks for simple styling
const isMobile = useIsMobile();
<div className={isMobile ? "p-4" : "p-6"}>
  <h1 className={isMobile ? "text-2xl" : "text-4xl"}>Title</h1>
</div>
```

### 2. Use Hooks for Conditional Logic

Use these hooks when you need JavaScript-based conditional rendering or behavior:

```tsx
// ✅ Good - Use hooks for conditional features
const isMobile = useIsMobile();
return (
  <div>
    {isMobile ? <MobileOnlyFeature /> : <DesktopOnlyFeature />}
  </div>
);
```

### 3. Combine with Tailwind

Use both approaches together for optimal results:

```tsx
// ✅ Good - Tailwind for styling, hooks for logic
const isMobile = useIsMobile();
return (
  <div className="p-4 lg:p-6">
    <h1 className="text-2xl lg:text-4xl">Title</h1>
    {isMobile && <MobileOnlyFeature />}
  </div>
);
```

### 4. SSR Considerations

All hooks are SSR-safe and will default to desktop on the server. The correct breakpoint will be detected on the client after hydration.

### 5. Performance

These hooks use a single resize event listener that's shared across all instances. They're optimized for performance and won't cause unnecessary re-renders.

## When to Use

Use these utilities when you need to:

- Conditionally render different components based on screen size
- Change component behavior based on viewport size
- Track orientation changes for layout adjustments
- Implement features that can't be achieved with CSS alone
- Add analytics or logging based on device type

## When NOT to Use

Don't use these utilities for:

- Simple responsive styling (use Tailwind classes instead)
- Hiding/showing elements (use Tailwind's `hidden lg:block` pattern)
- Responsive layouts (use Tailwind's grid and flex utilities)
- Font sizes, spacing, or colors (use Tailwind's responsive variants)

## Import Options

You can import from either location:

```typescript
// Direct import
import { useIsMobile } from '@/lib/responsive';

// Via utils (convenience re-export)
import { useIsMobile } from '@/lib/utils';
```

## Examples

See `responsive.example.tsx` for complete working examples of all utilities.
