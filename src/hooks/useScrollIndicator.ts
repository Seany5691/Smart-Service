import { useEffect, useState, RefObject } from 'react';

interface ScrollIndicatorState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

/**
 * Hook to detect scroll position and determine if scroll indicators should be shown
 * @param ref - Reference to the scrollable element
 * @param direction - Scroll direction to monitor ('horizontal' | 'vertical' | 'both')
 * @returns Object with scroll indicator states
 */
export function useScrollIndicator(
  ref: RefObject<HTMLElement>,
  direction: 'horizontal' | 'vertical' | 'both' = 'horizontal'
): ScrollIndicatorState {
  const [state, setState] = useState<ScrollIndicatorState>({
    canScrollLeft: false,
    canScrollRight: false,
    canScrollUp: false,
    canScrollDown: false,
  });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const checkScroll = () => {
      const { scrollLeft, scrollTop, scrollWidth, scrollHeight, clientWidth, clientHeight } = element;

      const newState: ScrollIndicatorState = {
        canScrollLeft: false,
        canScrollRight: false,
        canScrollUp: false,
        canScrollDown: false,
      };

      // Check horizontal scroll
      if (direction === 'horizontal' || direction === 'both') {
        newState.canScrollLeft = scrollLeft > 0;
        newState.canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;
      }

      // Check vertical scroll
      if (direction === 'vertical' || direction === 'both') {
        newState.canScrollUp = scrollTop > 0;
        newState.canScrollDown = scrollTop < scrollHeight - clientHeight - 1;
      }

      setState(newState);
    };

    // Initial check
    checkScroll();

    // Add scroll listener
    element.addEventListener('scroll', checkScroll, { passive: true });

    // Add resize observer to handle dynamic content changes
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', checkScroll);
      resizeObserver.disconnect();
    };
  }, [ref, direction]);

  return state;
}

/**
 * Hook to enable smooth scrolling with momentum on iOS
 * @param ref - Reference to the scrollable element
 */
export function useSmoothScroll(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Apply iOS momentum scrolling (using type assertion for webkit-specific property)
    (element.style as any).webkitOverflowScrolling = 'touch';
    element.style.scrollBehavior = 'smooth';

    // GPU acceleration for better performance
    element.style.transform = 'translateZ(0)';
    element.style.willChange = 'scroll-position';

    return () => {
      (element.style as any).webkitOverflowScrolling = '';
      element.style.scrollBehavior = '';
      element.style.transform = '';
      element.style.willChange = '';
    };
  }, [ref]);
}

/**
 * Hook to scroll an element into view smoothly
 * @returns Function to scroll to an element
 */
export function useScrollIntoView() {
  return (element: HTMLElement | null, options?: ScrollIntoViewOptions) => {
    if (!element) return;

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest',
      ...options,
    });
  };
}
