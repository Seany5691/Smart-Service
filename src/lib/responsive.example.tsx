/**
 * Example usage of responsive utility functions
 * 
 * This file demonstrates how to use the responsive hooks and utilities
 * for conditional rendering and responsive behavior.
 */

import {
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useOrientation,
  useIsPortrait,
  useIsLandscape,
  getCurrentBreakpoint,
  isMobile,
  isTablet,
  isDesktop,
} from "./responsive";

/**
 * Example 1: Conditional rendering based on breakpoint
 */
export function ResponsiveComponent() {
  const breakpoint = useBreakpoint();

  return (
    <div>
      {breakpoint === "mobile" && <MobileView />}
      {breakpoint === "tablet" && <TabletView />}
      {breakpoint === "desktop" && <DesktopView />}
    </div>
  );
}

/**
 * Example 2: Using boolean hooks for simpler conditions
 */
export function SimpleResponsiveComponent() {
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();

  return (
    <div>
      {isMobile ? (
        <MobileNavigation />
      ) : (
        <DesktopNavigation />
      )}
      
      {isDesktop && <AdvancedFeatures />}
    </div>
  );
}

/**
 * Example 3: Orientation-based rendering
 */
export function OrientationAwareComponent() {
  const orientation = useOrientation();
  const isLandscape = useIsLandscape();

  return (
    <div>
      <p>Current orientation: {orientation}</p>
      {isLandscape && <LandscapeOnlyFeature />}
    </div>
  );
}

/**
 * Example 4: Using synchronous utilities in event handlers
 */
export function ComponentWithEventHandlers() {
  const handleClick = () => {
    // Use synchronous utilities in event handlers
    if (isMobile()) {
      console.log("Mobile click behavior");
    } else if (isTablet()) {
      console.log("Tablet click behavior");
    } else {
      console.log("Desktop click behavior");
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}

/**
 * Example 5: Combining with Tailwind CSS classes
 * 
 * Note: For most cases, Tailwind's responsive classes (sm:, md:, lg:)
 * are preferred. Use these hooks only when you need JavaScript-based
 * conditional logic that can't be achieved with CSS alone.
 */
export function HybridResponsiveComponent() {
  const isMobile = useIsMobile();

  return (
    <div className="p-4 lg:p-6">
      {/* Tailwind handles the visual styling */}
      <h1 className="text-2xl lg:text-4xl">Title</h1>
      
      {/* JavaScript handles conditional features */}
      {isMobile && <MobileOnlyFeature />}
      
      {/* Tailwind handles responsive layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Content */}
      </div>
    </div>
  );
}

// Placeholder components for examples
function MobileView() { return <div>Mobile View</div>; }
function TabletView() { return <div>Tablet View</div>; }
function DesktopView() { return <div>Desktop View</div>; }
function MobileNavigation() { return <nav>Mobile Nav</nav>; }
function DesktopNavigation() { return <nav>Desktop Nav</nav>; }
function AdvancedFeatures() { return <div>Advanced Features</div>; }
function LandscapeOnlyFeature() { return <div>Landscape Feature</div>; }
function MobileOnlyFeature() { return <div>Mobile Only</div>; }
