"use client";

import { useState, useEffect } from "react";

/**
 * Responsive breakpoint configuration
 * Matches Tailwind CSS breakpoints:
 * - mobile: < 768px (default)
 * - tablet: 768px - 1023px (md:)
 * - desktop: >= 1024px (lg:)
 */
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
} as const;

export type Breakpoint = "mobile" | "tablet" | "desktop";

/**
 * Hook to detect the current responsive breakpoint
 * @returns The current breakpoint: 'mobile', 'tablet', or 'desktop'
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    // Initialize with correct breakpoint on mount (SSR-safe)
    if (typeof window === "undefined") return "desktop";
    
    const width = window.innerWidth;
    if (width < breakpoints.tablet) return "mobile";
    if (width < breakpoints.desktop) return "tablet";
    return "desktop";
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < breakpoints.tablet) {
        setBreakpoint("mobile");
      } else if (width < breakpoints.desktop) {
        setBreakpoint("tablet");
      } else {
        setBreakpoint("desktop");
      }
    };

    // Set initial breakpoint
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to detect if the current viewport is mobile size
 * @returns true if viewport width is less than 768px
 */
export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "mobile";
}

/**
 * Hook to detect if the current viewport is tablet size
 * @returns true if viewport width is between 768px and 1023px
 */
export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "tablet";
}

/**
 * Hook to detect if the current viewport is desktop size
 * @returns true if viewport width is 1024px or greater
 */
export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === "desktop";
}

/**
 * Hook to detect device orientation
 * @returns 'portrait' or 'landscape'
 */
export function useOrientation(): "portrait" | "landscape" {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(() => {
    if (typeof window === "undefined") return "portrait";
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  });

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? "portrait" : "landscape"
      );
    };

    // Set initial orientation
    handleOrientationChange();

    // Listen for resize events (orientation changes trigger resize)
    window.addEventListener("resize", handleOrientationChange);

    // Cleanup
    return () => window.removeEventListener("resize", handleOrientationChange);
  }, []);

  return orientation;
}

/**
 * Hook to detect if the device is in portrait mode
 * @returns true if device is in portrait orientation
 */
export function useIsPortrait(): boolean {
  return useOrientation() === "portrait";
}

/**
 * Hook to detect if the device is in landscape mode
 * @returns true if device is in landscape orientation
 */
export function useIsLandscape(): boolean {
  return useOrientation() === "landscape";
}

/**
 * Utility function to get the current breakpoint synchronously
 * Note: This should only be used in client-side code, not during SSR
 * @returns The current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop";
  
  const width = window.innerWidth;
  if (width < breakpoints.tablet) return "mobile";
  if (width < breakpoints.desktop) return "tablet";
  return "desktop";
}

/**
 * Utility function to check if current viewport is mobile
 * Note: This should only be used in client-side code, not during SSR
 * @returns true if viewport is mobile size
 */
export function isMobile(): boolean {
  return getCurrentBreakpoint() === "mobile";
}

/**
 * Utility function to check if current viewport is tablet
 * Note: This should only be used in client-side code, not during SSR
 * @returns true if viewport is tablet size
 */
export function isTablet(): boolean {
  return getCurrentBreakpoint() === "tablet";
}

/**
 * Utility function to check if current viewport is desktop
 * Note: This should only be used in client-side code, not during SSR
 * @returns true if viewport is desktop size
 */
export function isDesktop(): boolean {
  return getCurrentBreakpoint() === "desktop";
}

/**
 * Hook to handle orientation changes with callback
 * Useful for triggering actions when orientation changes
 * @param callback - Function to call when orientation changes
 * @param delay - Optional delay in ms before calling callback (default: 300ms for smooth transition)
 */
export function useOrientationChange(
  callback: (orientation: "portrait" | "landscape") => void,
  delay: number = 300
): void {
  const orientation = useOrientation();

  useEffect(() => {
    // Debounce the callback to allow smooth transitions
    const timeoutId = setTimeout(() => {
      callback(orientation);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [orientation, callback, delay]);
}

/**
 * Hook to detect orientation changes and maintain state
 * Returns both current orientation and previous orientation
 * @returns Object with current and previous orientation
 */
export function useOrientationWithHistory(): {
  current: "portrait" | "landscape";
  previous: "portrait" | "landscape" | null;
  isChanging: boolean;
} {
  const [current, setCurrent] = useState<"portrait" | "landscape">(() => {
    if (typeof window === "undefined") return "portrait";
    return window.innerHeight > window.innerWidth ? "portrait" : "landscape";
  });
  const [previous, setPrevious] = useState<"portrait" | "landscape" | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? "portrait" : "landscape";
      
      if (newOrientation !== current) {
        setIsChanging(true);
        setPrevious(current);
        setCurrent(newOrientation);

        // Reset isChanging after transition completes (300ms)
        setTimeout(() => {
          setIsChanging(false);
        }, 300);
      }
    };

    // Set initial orientation
    handleOrientationChange();

    // Listen for resize events
    window.addEventListener("resize", handleOrientationChange);

    return () => window.removeEventListener("resize", handleOrientationChange);
  }, [current]);

  return { current, previous, isChanging };
}

/**
 * Hook to get viewport dimensions
 * Useful for responsive calculations
 * @returns Object with width and height
 */
export function useViewportSize(): { width: number; height: number } {
  const [size, setSize] = useState(() => {
    if (typeof window === "undefined") {
      return { width: 1024, height: 768 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
