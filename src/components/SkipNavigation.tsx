"use client";

import { cn } from "@/lib/utils";

/**
 * Skip Navigation Component
 * Provides keyboard users with a way to skip repetitive navigation and jump directly to main content
 * Meets WCAG 2.1 Level A requirement for bypass blocks
 */
export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only",
        "fixed top-4 left-4 z-[100]",
        "bg-primary text-primary-foreground",
        "px-4 py-2 rounded-md",
        "font-medium text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "transition-all duration-200"
      )}
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  );
}
