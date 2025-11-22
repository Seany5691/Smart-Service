"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to detect system font scaling
 * Returns the current font scale factor (1 = 100%, 2 = 200%, etc.)
 */
export function useFontScale() {
  const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    const detectFontScale = () => {
      // Create a temporary element to measure font size
      const testElement = document.createElement('div');
      testElement.style.cssText = 'position: absolute; visibility: hidden; font-size: 1rem; width: 1rem;';
      document.body.appendChild(testElement);
      
      // Get computed font size in pixels
      const computedSize = parseFloat(window.getComputedStyle(testElement).fontSize);
      
      // Calculate scale factor (16px is the default base)
      const scale = computedSize / 16;
      
      document.body.removeChild(testElement);
      
      setFontScale(scale);
    };

    // Detect on mount
    detectFontScale();

    // Detect on resize (user might change browser zoom)
    window.addEventListener('resize', detectFontScale);

    return () => {
      window.removeEventListener('resize', detectFontScale);
    };
  }, []);

  return {
    fontScale,
    isLargeText: fontScale >= 1.5,
    isVeryLargeText: fontScale >= 2,
    fontScalePercentage: Math.round(fontScale * 100),
  };
}

/**
 * Hook to check if user prefers large text
 */
export function usePrefersLargeText() {
  const [prefersLargeText, setPrefersLargeText] = useState(false);

  useEffect(() => {
    // Check for prefers-contrast media query (often correlates with accessibility needs)
    const mediaQuery = window.matchMedia('(prefers-contrast: more)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersLargeText(e.matches);
    };

    handleChange(mediaQuery);
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } 
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  return prefersLargeText;
}
