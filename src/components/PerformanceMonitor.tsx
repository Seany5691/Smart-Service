'use client';

import { useEffect, useState } from 'react';
import {
  initPerformanceMonitoring,
  getPerformanceSummary,
  getMobilePerformanceInfo,
  isSlowConnection,
  type WebVitalsMetrics,
} from '@/lib/performance';

/**
 * Performance monitoring component
 * Initializes performance tracking and optionally displays metrics
 */
export function PerformanceMonitor({ showDebugPanel = false }: { showDebugPanel?: boolean }) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({});
  const [overallRating, setOverallRating] = useState<'good' | 'needs-improvement' | 'poor'>('good');
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Update metrics every 5 seconds if debug panel is enabled
    if (showDebugPanel) {
      const interval = setInterval(() => {
        const summary = getPerformanceSummary();
        setMetrics(summary.metrics);
        setOverallRating(summary.overallRating);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [showDebugPanel]);

  // Don't render anything if debug panel is disabled
  if (!showDebugPanel) {
    return null;
  }

  const mobileInfo = getMobilePerformanceInfo();
  const slowConnection = isSlowConnection();

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-4 right-4 z-[9999] bg-primary text-primary-foreground rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
        title="Performance Metrics"
      >
        📊
      </button>

      {/* Debug panel */}
      {showPanel && (
        <div className="fixed bottom-20 right-4 z-[9999] bg-white dark:bg-slate-900 rounded-lg shadow-2xl p-4 max-w-sm max-h-[80vh] overflow-y-auto border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Performance Metrics</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Overall rating */}
          <div className="mb-4 p-3 rounded-lg bg-accent">
            <div className="text-sm text-muted-foreground mb-1">Overall Rating</div>
            <div
              className={`text-lg font-semibold ${
                overallRating === 'good'
                  ? 'text-green-600'
                  : overallRating === 'needs-improvement'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              {overallRating === 'good' ? '✓ Good' : overallRating === 'needs-improvement' ? '⚠ Needs Improvement' : '✗ Poor'}
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="space-y-3 mb-4">
            <h4 className="font-medium text-sm text-muted-foreground">Core Web Vitals</h4>
            
            {metrics.LCP && (
              <MetricRow
                name="LCP"
                description="Largest Contentful Paint"
                value={metrics.LCP.value}
                unit="ms"
                rating={metrics.LCP.rating}
                target="< 2500ms"
              />
            )}

            {metrics.FID && (
              <MetricRow
                name="FID"
                description="First Input Delay"
                value={metrics.FID.value}
                unit="ms"
                rating={metrics.FID.rating}
                target="< 100ms"
              />
            )}

            {metrics.INP && (
              <MetricRow
                name="INP"
                description="Interaction to Next Paint"
                value={metrics.INP.value}
                unit="ms"
                rating={metrics.INP.rating}
                target="< 200ms"
              />
            )}

            {metrics.CLS && (
              <MetricRow
                name="CLS"
                description="Cumulative Layout Shift"
                value={metrics.CLS.value}
                unit=""
                rating={metrics.CLS.rating}
                target="< 0.1"
              />
            )}

            {metrics.FCP && (
              <MetricRow
                name="FCP"
                description="First Contentful Paint"
                value={metrics.FCP.value}
                unit="ms"
                rating={metrics.FCP.rating}
                target="< 1800ms"
              />
            )}

            {metrics.TTFB && (
              <MetricRow
                name="TTFB"
                description="Time to First Byte"
                value={metrics.TTFB.value}
                unit="ms"
                rating={metrics.TTFB.rating}
                target="< 800ms"
              />
            )}
          </div>

          {/* Device info */}
          {mobileInfo && (
            <div className="space-y-2 pt-4 border-t border-border">
              <h4 className="font-medium text-sm text-muted-foreground">Device Info</h4>
              
              {slowConnection && (
                <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                  ⚠ Slow connection detected
                </div>
              )}

              <div className="text-xs space-y-1">
                <div>Screen: {mobileInfo.screenSize.width}x{mobileInfo.screenSize.height}</div>
                <div>Viewport: {mobileInfo.viewportSize.width}x{mobileInfo.viewportSize.height}</div>
                <div>DPR: {mobileInfo.devicePixelRatio}x</div>
                {mobileInfo.deviceMemory && <div>Memory: {mobileInfo.deviceMemory}GB</div>}
                {mobileInfo.hardwareConcurrency && <div>CPU Cores: {mobileInfo.hardwareConcurrency}</div>}
                {mobileInfo.connection && (
                  <>
                    <div>Connection: {mobileInfo.connection.effectiveType}</div>
                    {mobileInfo.connection.downlink && <div>Downlink: {mobileInfo.connection.downlink}Mbps</div>}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 text-xs text-muted-foreground">
            Metrics update every 5 seconds
          </div>
        </div>
      )}
    </>
  );
}

function MetricRow({
  name,
  description,
  value,
  unit,
  rating,
  target,
}: {
  name: string;
  description: string;
  value: number;
  unit: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  target: string;
}) {
  const ratingColor =
    rating === 'good' ? 'text-green-600' : rating === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="flex items-center justify-between text-sm">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
        <div className="text-xs text-muted-foreground">Target: {target}</div>
      </div>
      <div className={`font-semibold ${ratingColor}`}>
        {value.toFixed(unit === 'ms' ? 0 : 3)}
        {unit}
      </div>
    </div>
  );
}
