"use client";

import { useEffect, useCallback, RefObject } from 'react';

/**
 * Hook to handle keyboard navigation within a container
 * Supports arrow keys, home, end, and tab navigation
 */
export function useKeyboardNavigation(
  containerRef: RefObject<HTMLElement>,
  options: {
    enabled?: boolean;
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    selector?: string;
  } = {}
) {
  const {
    enabled = true,
    orientation = 'both',
    loop = true,
    selector = 'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
  } = options;

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(selector)
    ).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
  }, [containerRef, selector]);

  const focusElement = useCallback((element: HTMLElement) => {
    element.focus();
    element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const currentIndex = focusableElements.findIndex(el => el === document.activeElement);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= focusableElements.length) {
            nextIndex = loop ? 0 : focusableElements.length - 1;
          }
        }
        break;

      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? focusableElements.length - 1 : 0;
          }
        }
        break;

      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex + 1;
          if (nextIndex >= focusableElements.length) {
            nextIndex = loop ? 0 : focusableElements.length - 1;
          }
        }
        break;

      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          e.preventDefault();
          nextIndex = currentIndex - 1;
          if (nextIndex < 0) {
            nextIndex = loop ? focusableElements.length - 1 : 0;
          }
        }
        break;

      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;

      case 'End':
        e.preventDefault();
        nextIndex = focusableElements.length - 1;
        break;

      default:
        return;
    }

    if (nextIndex !== currentIndex && focusableElements[nextIndex]) {
      focusElement(focusableElements[nextIndex]);
    }
  }, [enabled, orientation, loop, getFocusableElements, focusElement]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [containerRef, enabled, handleKeyDown]);
}

/**
 * Hook to handle escape key to close modals/dialogs
 */
export function useEscapeKey(callback: () => void, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        callback();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [callback, enabled]);
}

/**
 * Hook to handle Enter/Space key for custom interactive elements
 */
export function useActivationKeys(
  callback: () => void,
  elementRef: RefObject<HTMLElement>,
  enabled = true
) {
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        callback();
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
    };
  }, [callback, elementRef, enabled]);
}

/**
 * Hook to detect if user is navigating with keyboard
 */
export function useKeyboardUser() {
  useEffect(() => {
    let isKeyboardUser = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        isKeyboardUser = true;
        document.body.classList.add('keyboard-user');
      }
    };

    const handleMouseDown = () => {
      isKeyboardUser = false;
      document.body.classList.remove('keyboard-user');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);
}

/**
 * Hook to manage focus trap in modals
 */
export function useFocusTrap(
  containerRef: RefObject<HTMLElement>,
  enabled = true,
  options: {
    initialFocus?: RefObject<HTMLElement>;
    returnFocus?: boolean;
  } = {}
) {
  const { initialFocus, returnFocus = true } = options;

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement as HTMLElement;

    // Focus initial element or first focusable element
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (initialFocus?.current) {
      initialFocus.current.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(focusableElements).filter(
        el => !el.hasAttribute('disabled') && el.offsetParent !== null
      );

      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      
      // Return focus to previously focused element
      if (returnFocus && previouslyFocused) {
        previouslyFocused.focus();
      }
    };
  }, [containerRef, enabled, initialFocus, returnFocus]);
}
