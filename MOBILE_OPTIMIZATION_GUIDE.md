# Mobile Optimization Guide

## Overview

This guide documents the mobile optimization implementation for the Smart Service Ticketing System. The application is now fully responsive and optimized for mobile devices, tablets, and desktops.

## Responsive Breakpoints

The application uses Tailwind CSS's responsive breakpoints:

| Breakpoint | Width | Target Devices | Prefix |
|------------|-------|----------------|--------|
| Mobile | < 768px | Smartphones | (default) |
| Tablet | 768px - 1023px | Tablets, small laptops | `md:` |
| Desktop | ≥ 1024px | Desktops, large laptops | `lg:` |

### Usage Pattern

```tsx
// Mobile-first approach
<div className="p-4 lg:p-6">  {/* 16px padding on mobile, 24px on desktop */}
  <h1 className="text-2xl lg:text-4xl">  {/* Smaller text on mobile */}
    Title
  </h1>
</div>
```

## Mobile-Specific Components

### 1. LoadingState Component

Location: `src/components/LoadingState.tsx`

Provides mobile-optimized loading indicators with skeleton screens for better perceived performance.

**Usage:**

```tsx
import { LoadingState, SkeletonTable, SkeletonStats, SkeletonCard } from "@/components/LoadingState";

// Full-screen loading
<LoadingState message="Loading..." fullScreen />

// Card loading
<LoadingState message="Loading tickets..." />

// Skeleton screens
<SkeletonTable />
<SkeletonStats />
<SkeletonCard />
```

**Features:**
- Responsive sizing (larger on desktop)
- Animated spinners and pulse effects
- Full-screen and inline variants
- Skeleton screens for better UX

### 2. EmptyState Component

Location: `src/components/EmptyState.tsx`

Mobile-friendly empty states with touch-optimized action buttons.

**Usage:**

```tsx
import { EmptyState } from "@/components/EmptyState";
import { Ticket } from "lucide-react";

<EmptyState
  icon={Ticket}
  title="No tickets found"
  description="Create your first ticket to get started"
  actionLabel="Create Ticket"
  onAction={() => setShowModal(true)}
  secondaryActionLabel="Learn More"
  onSecondaryAction={() => router.push('/help')}
/>
```

**Features:**
- Touch-friendly buttons (min 44px height)
- Responsive icon sizing
- Gradient backgrounds
- Optional primary and secondary actions
- Full-width buttons on mobile, auto-width on desktop

### 3. ErrorState Component

Location: `src/components/ErrorState.tsx`

Mobile-optimized error displays with recovery actions.

**Usage:**

```tsx
import { ErrorState, NetworkError, PermissionError, NotFoundError } from "@/components/ErrorState";

// Generic error
<ErrorState
  title="Something went wrong"
  message="Unable to load data. Please try again."
  onRetry={() => loadData()}
  onGoHome={() => router.push('/dashboard')}
/>

// Specific error types
<NetworkError onRetry={() => loadData()} />
<PermissionError message="You don't have access to this resource" />
<NotFoundError resourceName="ticket" />
```

**Features:**
- Touch-friendly action buttons
- Full-screen and inline variants
- Pre-built error types (Network, Permission, NotFound)
- Responsive sizing and spacing

### 4. MobileModal Component

Location: `src/components/MobileModal.tsx`

Full-screen modals on mobile, centered on desktop.

**Usage:**

```tsx
import { MobileModal } from "@/components/MobileModal";

<MobileModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Edit Ticket"
  size="lg"  // sm, md, lg, xl, full
>
  <form>
    {/* Form content */}
  </form>
</MobileModal>
```

**Features:**
- Full-screen on mobile (< 768px)
- Centered with max-width on desktop
- Sticky header with close button
- Scrollable content area
- Prevents background scrolling
- Multiple size variants

### 5. ResponsiveTable Component

Location: `src/components/ResponsiveTable.tsx`

Automatically switches between table and card views based on screen size.

**Usage:**

```tsx
import { ResponsiveTable } from "@/components/ResponsiveTable";

<ResponsiveTable
  data={tickets}
  columns={[
    { key: 'ticketId', label: 'ID', mobileLabel: 'Ticket' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
  ]}
  mobileCardRenderer={(item) => (
    <div>
      <h3>{item.title}</h3>
      <p>{item.ticketId}</p>
    </div>
  )}
  onRowClick={(item) => router.push(`/tickets/${item.id}`)}
/>
```

**Features:**
- Table view on desktop (≥ 1024px)
- Card view on mobile (< 1024px)
- Custom mobile card renderer
- Touch-optimized interactions
- Responsive spacing

## Touch Optimization Guidelines

### Minimum Touch Targets

All interactive elements must meet minimum touch target sizes:

- **Buttons**: 44px × 44px minimum
- **Icon buttons**: 44px × 44px minimum
- **Form inputs**: 48px height minimum
- **Links**: 44px height minimum
- **Spacing**: 8px minimum between touch targets

### Implementation

```tsx
// Button component with mobile optimization
<Button
  size="lg"  // Ensures 44px minimum height
  className="min-h-[44px] w-full sm:w-auto"
>
  Submit
</Button>

// Input component with mobile optimization
<Input
  className="h-12 text-base"  // 48px height, 16px font to prevent zoom
  type="email"  // Appropriate keyboard on mobile
/>
```

### Touch Feedback

Add active states for visual feedback:

```tsx
<div className="active:scale-95 active:bg-accent transition-transform">
  Tappable Element
</div>
```

## Typography Guidelines

### Font Sizes

| Element | Mobile | Desktop | Reasoning |
|---------|--------|---------|-----------|
| Body text | 16px | 16px | Prevents zoom on iOS |
| Small text | 14px | 14px | Minimum readable size |
| Headings (h1) | 24px-32px | 36px-48px | Proportional scaling |
| Headings (h2) | 20px-24px | 28px-32px | Proportional scaling |
| Headings (h3) | 18px-20px | 24px-28px | Proportional scaling |

### Implementation

```tsx
<h1 className="text-2xl lg:text-4xl font-bold">
  Page Title
</h1>

<p className="text-base">  {/* 16px - prevents zoom */}
  Body text content
</p>

<span className="text-sm text-muted-foreground">  {/* 14px */}
  Secondary text
</span>
```

## Layout Patterns

### Grid Layouts

```tsx
// Stats grid: 1 column mobile, 2 tablet, 4 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>

// Card grid: 1 column mobile, 2 tablet, 3 desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

### Flex Layouts

```tsx
// Stack on mobile, row on desktop
<div className="flex flex-col lg:flex-row gap-4">
  <div>Left content</div>
  <div>Right content</div>
</div>

// Reverse order on mobile
<div className="flex flex-col-reverse lg:flex-row gap-4">
  <div>Shows second on mobile, first on desktop</div>
  <div>Shows first on mobile, second on desktop</div>
</div>
```

### Spacing

```tsx
// Responsive padding
<div className="p-4 lg:p-6">  {/* 16px mobile, 24px desktop */}
  Content
</div>

// Responsive margins
<div className="mb-4 lg:mb-6">  {/* 16px mobile, 24px desktop */}
  Content
</div>

// Responsive gaps
<div className="flex gap-3 lg:gap-4">  {/* 12px mobile, 16px desktop */}
  Items
</div>
```

## Form Optimization

### Mobile-Friendly Forms

```tsx
<form className="space-y-4">
  {/* Full-width inputs on mobile */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">Name *</label>
      <Input
        type="text"
        className="h-12 text-base"  {/* 48px height, 16px font */}
        placeholder="Enter name"
      />
    </div>
    
    <div className="space-y-2">
      <label className="text-sm font-medium">Email *</label>
      <Input
        type="email"  {/* Shows email keyboard on mobile */}
        className="h-12 text-base"
        placeholder="Enter email"
      />
    </div>
  </div>
  
  {/* Full-width buttons on mobile */}
  <div className="flex flex-col sm:flex-row gap-3">
    <Button
      type="button"
      variant="outline"
      className="w-full sm:w-auto min-h-[44px]"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      className="w-full sm:w-auto min-h-[44px]"
    >
      Submit
    </Button>
  </div>
</form>
```

### Input Types for Mobile Keyboards

```tsx
<Input type="tel" />      {/* Numeric keyboard */}
<Input type="email" />    {/* Email keyboard with @ */}
<Input type="url" />      {/* URL keyboard with .com */}
<Input type="number" />   {/* Numeric keyboard */}
<Input type="date" />     {/* Date picker */}
<Input type="time" />     {/* Time picker */}
```

## Navigation Patterns

### Mobile Navigation

The dashboard layout includes a hamburger menu for mobile:

```tsx
// Hamburger button (visible on mobile only)
<button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
  <Menu className="h-6 w-6" />
</button>

// Sidebar (slide-out on mobile, static on desktop)
<aside className={cn(
  "fixed inset-y-0 left-0 z-50 w-64",
  "transform transition-transform duration-300",
  "lg:static lg:translate-x-0",
  sidebarOpen ? "translate-x-0" : "-translate-x-full"
)}>
  {/* Navigation items */}
</aside>

// Backdrop (mobile only)
{sidebarOpen && (
  <div
    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
    onClick={() => setSidebarOpen(false)}
  />
)}
```

### Tabs Navigation

```tsx
<div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
  {tabs.map(tab => (
    <button
      key={tab.id}
      className={cn(
        "px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium",
        "min-w-[100px] min-h-[44px]",  {/* Touch-friendly */}
        activeTab === tab.id ? "bg-primary text-primary-foreground" : "bg-accent"
      )}
      onClick={() => setActiveTab(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>
```

## Performance Optimization

### Image Optimization

```tsx
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  className="w-full h-auto"
  loading="lazy"  {/* Lazy load off-screen images */}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### Code Splitting

```tsx
// Lazy load modals
import dynamic from "next/dynamic";

const EnhancedTicketModal = dynamic(
  () => import("@/components/modals/EnhancedTicketModal"),
  { ssr: false }
);
```

### Skeleton Screens

Use skeleton screens instead of spinners for better perceived performance:

```tsx
{loading ? (
  <SkeletonTable />
) : (
  <DataTable data={data} />
)}
```

## Testing Guidelines

### Device Testing

Test on the following devices/viewports:

**Mobile:**
- iPhone SE (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)
- Google Pixel 5 (393px)

**Tablet:**
- iPad Mini (768px)
- iPad Air (820px)
- iPad Pro (1024px)

**Desktop:**
- 1280px (small laptop)
- 1440px (standard desktop)
- 1920px (large desktop)

### Browser Testing

Test on:
- iOS Safari (primary mobile browser)
- Chrome Mobile (Android)
- Samsung Internet
- Firefox Mobile

### Testing Checklist

- [ ] All touch targets are minimum 44×44px
- [ ] Text is readable without zooming (16px minimum)
- [ ] Forms work with mobile keyboards
- [ ] Modals are full-screen on mobile
- [ ] Navigation is accessible via hamburger menu
- [ ] Tables convert to cards on mobile
- [ ] Images are responsive and optimized
- [ ] No horizontal scrolling on mobile
- [ ] Loading states are visible
- [ ] Empty states are helpful
- [ ] Error states provide recovery options
- [ ] Gradients render correctly
- [ ] Dark mode works on all screen sizes
- [ ] Orientation changes are handled smoothly

## Accessibility

### Mobile Accessibility Features

1. **Touch Targets**: All interactive elements meet 44×44px minimum
2. **Font Scaling**: Layouts adapt to user's font size preferences
3. **Screen Readers**: Proper ARIA labels and semantic HTML
4. **Keyboard Navigation**: Full keyboard support on tablets
5. **Color Contrast**: WCAG AA standards maintained
6. **Focus Indicators**: Visible focus states for all interactive elements

### Implementation

```tsx
// Proper ARIA labels
<button aria-label="Close modal" onClick={onClose}>
  <X className="h-5 w-5" />
</button>

// Semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// Focus indicators
<button className="focus-ring">
  Click me
</button>
```

## Common Patterns

### Responsive Header

```tsx
<div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-6 lg:p-8 text-white">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 className="text-2xl lg:text-4xl font-bold">Page Title</h1>
      <p className="mt-2 text-sm lg:text-base">Description</p>
    </div>
    <Button size="lg" className="w-full sm:w-auto">
      Action
    </Button>
  </div>
</div>
```

### Responsive Card

```tsx
<Card className="shadow-lg hover:shadow-xl transition-shadow active:scale-[0.98] lg:active:scale-100">
  <CardHeader className="p-4 lg:p-6">
    <CardTitle className="text-base lg:text-lg">Title</CardTitle>
  </CardHeader>
  <CardContent className="p-4 lg:p-6">
    Content
  </CardContent>
</Card>
```

### Responsive Stats Grid

```tsx
<div className="grid gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
  {stats.map(stat => (
    <Card key={stat.id}>
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl lg:text-4xl font-bold mt-2">{stat.value}</p>
          </div>
          <stat.icon className="h-8 w-8 lg:h-10 lg:w-10" />
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

## Troubleshooting

### Issue: Text too small on mobile
**Solution**: Ensure base font size is 16px to prevent iOS zoom
```tsx
<Input className="text-base" />  {/* Not text-sm */}
```

### Issue: Buttons too small to tap
**Solution**: Use minimum 44px height
```tsx
<Button size="lg" className="min-h-[44px]" />
```

### Issue: Modal not full-screen on mobile
**Solution**: Use MobileModal component or apply proper classes
```tsx
<div className="fixed inset-0 lg:inset-auto lg:max-w-2xl" />
```

### Issue: Horizontal scrolling on mobile
**Solution**: Ensure containers don't exceed viewport width
```tsx
<div className="max-w-full overflow-x-auto" />
```

### Issue: Images not responsive
**Solution**: Use responsive image classes
```tsx
<img className="w-full h-auto" />
```

## Future Enhancements

Potential improvements for future development:

1. **Progressive Web App (PWA)**: Add service worker for offline support
2. **Touch Gestures**: Implement swipe gestures for navigation
3. **Haptic Feedback**: Add vibration feedback for important actions
4. **Voice Input**: Support voice-to-text for form inputs
5. **Biometric Auth**: Add fingerprint/face ID authentication
6. **Push Notifications**: Implement mobile push notifications
7. **Camera Integration**: Add photo capture for ticket attachments
8. **Location Services**: Auto-fill location data from GPS

## Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design Touch Targets](https://material.io/design/usability/accessibility.html#layout-and-typography)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Next.js Image Optimization](https://nextjs.org/docs/basic-features/image-optimization)

## Support

For questions or issues related to mobile optimization:
1. Check this guide first
2. Review the component documentation
3. Test on actual devices, not just browser DevTools
4. Consult the design document at `.kiro/specs/mobile-optimization/design.md`
