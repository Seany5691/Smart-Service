# Mobile Optimization Quick Reference

## Breakpoints

```tsx
// Mobile: < 768px (default)
// Tablet: 768px - 1023px (md:)
// Desktop: ≥ 1024px (lg:)
```

## Essential Components

### Loading States
```tsx
import { LoadingState, SkeletonTable, SkeletonStats } from "@/components/LoadingState";

<LoadingState message="Loading..." />
<SkeletonTable />
<SkeletonStats />
```

### Empty States
```tsx
import { EmptyState } from "@/components/EmptyState";

<EmptyState
  icon={Icon}
  title="No items"
  description="Get started by creating one"
  actionLabel="Create"
  onAction={() => {}}
/>
```

### Error States
```tsx
import { ErrorState, NetworkError } from "@/components/ErrorState";

<ErrorState
  message="Something went wrong"
  onRetry={() => {}}
/>
<NetworkError onRetry={() => {}} />
```

### Mobile Modal
```tsx
import { MobileModal } from "@/components/MobileModal";

<MobileModal
  isOpen={open}
  onClose={() => {}}
  title="Title"
>
  Content
</MobileModal>
```

## Common Patterns

### Responsive Grid
```tsx
// 1 col mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
```

### Responsive Padding
```tsx
<div className="p-4 lg:p-6">  {/* 16px → 24px */}
```

### Responsive Text
```tsx
<h1 className="text-2xl lg:text-4xl">  {/* 24px → 36px */}
<p className="text-base">  {/* Always 16px - prevents zoom */}
```

### Touch-Friendly Button
```tsx
<Button size="lg" className="min-h-[44px] w-full sm:w-auto">
  Submit
</Button>
```

### Touch-Friendly Input
```tsx
<Input
  type="email"
  className="h-12 text-base"  {/* 48px height, 16px font */}
/>
```

### Stack on Mobile
```tsx
<div className="flex flex-col lg:flex-row gap-4">
```

### Hide on Mobile
```tsx
<div className="hidden lg:block">Desktop only</div>
```

### Show on Mobile Only
```tsx
<div className="lg:hidden">Mobile only</div>
```

### Active State (Touch Feedback)
```tsx
<div className="active:scale-95 active:bg-accent transition-transform">
```

### Horizontal Scroll
```tsx
<div className="flex overflow-x-auto gap-2 scrollbar-hide">
```

## Touch Target Sizes

- Buttons: **44px × 44px** minimum
- Inputs: **48px** height minimum
- Icons: **44px × 44px** minimum
- Spacing: **8px** minimum between targets

## Typography

- Body text: **16px** (prevents zoom on iOS)
- Small text: **14px** minimum
- Headings: Scale proportionally with `lg:` prefix

## Form Inputs

```tsx
<Input type="tel" />      {/* Numeric keyboard */}
<Input type="email" />    {/* Email keyboard */}
<Input type="url" />      {/* URL keyboard */}
<Input type="number" />   {/* Numeric keyboard */}
```

## Testing Viewports

- iPhone SE: **375px**
- iPhone 14: **390px**
- iPhone 14 Pro Max: **430px**
- iPad Mini: **768px**
- iPad Pro: **1024px**
- Desktop: **1280px+**

## Checklist

- [ ] Touch targets ≥ 44px
- [ ] Text ≥ 16px (body)
- [ ] Inputs 48px height
- [ ] No horizontal scroll
- [ ] Full-screen modals on mobile
- [ ] Responsive images
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] Active states for touch
- [ ] Proper input types
- [ ] Hamburger menu works
- [ ] Tables → cards on mobile
