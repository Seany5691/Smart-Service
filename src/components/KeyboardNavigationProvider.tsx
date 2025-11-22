"use client";

import { useEffect } from 'react';
import { useKeyboardUser } from '@/hooks/useKeyboardNavigation';

/**
 * Provider component that enables keyboard navigation features globally
 * Should be placed at the root of the application
 */
export function KeyboardNavigationProvider({ children }: { children: React.ReactNode }) {
  // Detect keyboard users and add appropriate class
  useKeyboardUser();

  useEffect(() => {
    // Add keyboard navigation hints to the document
    const style = document.createElement('style');
    style.textContent = `
      /* Enhanced focus indicators for keyboard users */
      .keyboard-user *:focus {
        outline: 2px solid hsl(var(--ring)) !important;
        outline-offset: 2px !important;
      }

      /* Skip link styling */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 0;
        background: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        padding: 8px;
        text-decoration: none;
        z-index: 100;
      }

      .skip-link:focus {
        top: 0;
      }

      /* Ensure focus is visible on all interactive elements */
      .keyboard-user button:focus,
      .keyboard-user a:focus,
      .keyboard-user input:focus,
      .keyboard-user select:focus,
      .keyboard-user textarea:focus,
      .keyboard-user [role="button"]:focus,
      .keyboard-user [role="link"]:focus,
      .keyboard-user [tabindex]:not([tabindex="-1"]):focus {
        box-shadow: 0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--ring));
      }

      /* High contrast mode support */
      @media (prefers-contrast: high) {
        *:focus {
          outline: 3px solid currentColor !important;
          outline-offset: 3px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
}
