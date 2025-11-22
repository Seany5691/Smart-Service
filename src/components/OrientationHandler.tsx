"use client";

import { useEffect, useState, ReactNode } from "react";
import { useOrientationWithHistory } from "@/lib/responsive";

interface OrientationHandlerProps {
  children: ReactNode;
  onOrientationChange?: (orientation: "portrait" | "landscape") => void;
  maintainScrollPosition?: boolean;
}

/**
 * Component that handles orientation changes gracefully
 * Maintains state and provides smooth transitions during orientation changes
 */
export function OrientationHandler({
  children,
  onOrientationChange,
  maintainScrollPosition = true,
}: OrientationHandlerProps) {
  const { current, previous, isChanging } = useOrientationWithHistory();

  useEffect(() => {
    if (previous && current !== previous) {
      // Call the callback if provided
      onOrientationChange?.(current);

      // Maintain scroll position if enabled
      if (maintainScrollPosition) {
        // Store scroll position before orientation change
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        // Restore scroll position after layout adjustment
        requestAnimationFrame(() => {
          window.scrollTo(scrollX, scrollY);
        });
      }
    }
  }, [current, previous, onOrientationChange, maintainScrollPosition]);

  return (
    <div
      className={isChanging ? "orientation-transition" : ""}
      data-orientation={current}
    >
      {children}
    </div>
  );
}

/**
 * Hook to persist state across orientation changes
 * Useful for maintaining form data, scroll position, etc.
 */
export function useOrientationPersistence<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const { current } = useOrientationWithHistory();

  // Get stored value from sessionStorage
  const getStoredValue = (): T => {
    if (typeof window === "undefined") return initialValue;

    try {
      const item = sessionStorage.getItem(`orientation-${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading from sessionStorage:", error);
      return initialValue;
    }
  };

  const [value, setValueState] = useState<T>(getStoredValue);

  // Update sessionStorage when value changes
  const setValue = (newValue: T) => {
    try {
      setValueState(newValue);
      sessionStorage.setItem(`orientation-${key}`, JSON.stringify(newValue));
    } catch (error) {
      console.error("Error writing to sessionStorage:", error);
    }
  };

  // Restore value when orientation changes
  useEffect(() => {
    const storedValue = getStoredValue();
    if (storedValue !== value) {
      setValueState(storedValue);
    }
  }, [current]);

  return [value, setValue];
}
