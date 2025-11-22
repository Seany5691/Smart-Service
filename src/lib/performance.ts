'use client';

/**
 * Performance monitoring utilities for tracking Core Web Vitals
 * and mobile-specific metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface WebVitalsMetrics {
  CLS?: PerformanceMetric;
  FID?: PerformanceMetric;
  FCP?: PerformanceMetric;
  LCP?: PerformanceMetric;
  TTFB?: PerformanceMetric;
  INP?: PerformanceMetric;
}

/**
 * Thresholds for Core Web Vitals (mobile-optimized)
 */
const THRESHOLDS = {
  // Cumulative Layout Shift
  CLS: {
    good: 0.1,
    poor: 0.25,
  },
  // First Input Delay
  FID: {
    good: 100,
    poor: 300,
  },
  // First Contentful Paint
  FCP: {
    good: 1800,
    poor: 3000,
  },
  // Largest Contentful Paint
  LCP: {
    good: 2500,
    poor: 4000,
  },
  // Time to First Byte
  TTFB: {
    good: 800,
    poor: 1800,
  },
  // Interaction to Next Paint
  INP: {
    good: 200,
    poor: 500,
  },
};

/**
 * Get rating based on metric value and thresholds
 */
function getRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Report metric to analytics (can be extended to send to analytics service)
 */
function reportMetric(metric: PerformanceMetric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: metric.rating,
      timestamp: new Date(metric.timestamp).toISOString(),
    });
  }

  // In production, send to analytics service
  // Example: Google Analytics, Firebase Analytics, etc.
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_value: metric.value,
    });
  }

  // Store in localStorage for debugging
  try {
    const metrics = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
    metrics.push(metric);
    // Keep only last 50 metrics
    if (metrics.length > 50) {
      metrics.shift();
    }
    localStorage.setItem('performance_metrics', JSON.stringify(metrics));
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Monitor Core Web Vitals using the web-vitals library pattern
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // CLS - Cumulative Layout Shift
  if ('PerformanceObserver' in window) {
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            const value = (entry as any).value;
            reportMetric({
              name: 'CLS',
              value,
              rating: getRating('CLS', value),
              timestamp: Date.now(),
            });
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      console.warn('CLS monitoring not supported');
    }

    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const value = (entry as any).processingStart - entry.startTime;
          reportMetric({
            name: 'FID',
            value,
            rating: getRating('FID', value),
            timestamp: Date.now(),
          });
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.warn('FID monitoring not supported');
    }

    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        const value = lastEntry.startTime;
        reportMetric({
          name: 'LCP',
          value,
          rating: getRating('LCP', value),
          timestamp: Date.now(),
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.warn('LCP monitoring not supported');
    }

    // FCP - First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime;
            reportMetric({
              name: 'FCP',
              value,
              rating: getRating('FCP', value),
              timestamp: Date.now(),
            });
          }
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
    } catch (e) {
      console.warn('FCP monitoring not supported');
    }

    // INP - Interaction to Next Paint (replaces FID)
    try {
      const inpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const value = (entry as any).duration;
          reportMetric({
            name: 'INP',
            value,
            rating: getRating('INP', value),
            timestamp: Date.now(),
          });
        }
      });
      // Note: INP monitoring requires specific browser support
      inpObserver.observe({ type: 'event', buffered: true } as any);
    } catch (e) {
      console.warn('INP monitoring not supported');
    }
  }

  // TTFB - Time to First Byte
  if ('performance' in window && 'timing' in window.performance) {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const value = navigation.responseStart - navigation.requestStart;
        reportMetric({
          name: 'TTFB',
          value,
          rating: getRating('TTFB', value),
          timestamp: Date.now(),
        });
      }
    });
  }
}

/**
 * Get all stored performance metrics
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  if (typeof window === 'undefined') return [];
  
  try {
    return JSON.parse(localStorage.getItem('performance_metrics') || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * Clear stored performance metrics
 */
export function clearPerformanceMetrics() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('performance_metrics');
  } catch (e) {
    // Ignore errors
  }
}

/**
 * Get performance summary
 */
export function getPerformanceSummary(): {
  metrics: WebVitalsMetrics;
  overallRating: 'good' | 'needs-improvement' | 'poor';
} {
  const metrics = getPerformanceMetrics();
  const summary: WebVitalsMetrics = {};
  
  // Get latest value for each metric
  ['CLS', 'FID', 'FCP', 'LCP', 'TTFB', 'INP'].forEach((name) => {
    const metricValues = metrics.filter((m) => m.name === name);
    if (metricValues.length > 0) {
      summary[name as keyof WebVitalsMetrics] = metricValues[metricValues.length - 1];
    }
  });

  // Calculate overall rating
  const ratings = Object.values(summary).map((m) => m?.rating);
  const overallRating = ratings.includes('poor')
    ? 'poor'
    : ratings.includes('needs-improvement')
    ? 'needs-improvement'
    : 'good';

  return { metrics: summary, overallRating };
}

/**
 * Mobile-specific performance checks
 */
export function getMobilePerformanceInfo() {
  if (typeof window === 'undefined') return null;

  return {
    // Connection info
    connection: (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection,
    // Device memory (if available)
    deviceMemory: (navigator as any).deviceMemory,
    // Hardware concurrency (CPU cores)
    hardwareConcurrency: navigator.hardwareConcurrency,
    // Screen size
    screenSize: {
      width: window.screen.width,
      height: window.screen.height,
    },
    // Viewport size
    viewportSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    // Device pixel ratio
    devicePixelRatio: window.devicePixelRatio,
  };
}

/**
 * Check if device is on slow connection
 */
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined') return false;

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;

  // Check for slow connection types
  const slowTypes = ['slow-2g', '2g', '3g'];
  if (slowTypes.includes(connection.effectiveType)) {
    return true;
  }

  // Check for save-data mode
  if (connection.saveData) {
    return true;
  }

  return false;
}

/**
 * Measure custom performance metric
 */
export function measurePerformance(name: string, fn: () => void | Promise<void>) {
  const start = performance.now();
  
  const result = fn();
  
  if (result instanceof Promise) {
    return result.then(() => {
      const duration = performance.now() - start;
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      return duration;
    });
  } else {
    const duration = performance.now() - start;
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, any>
    ) => void;
  }
}
