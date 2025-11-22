'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RotateCw,
  Maximize2
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
}

export default function ResponsiveTestPage() {
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  const updateViewport = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    setViewport({ width, height });
    setOrientation(width > height ? 'landscape' : 'portrait');
    
    if (width < 768) {
      setDeviceType('mobile');
    } else if (width < 1024) {
      setDeviceType('tablet');
    } else {
      setDeviceType('desktop');
    }
  };

  const runTests = () => {
    const results: TestResult[] = [];
    const width = viewport.width;

    // Test 1: Viewport width detection
    results.push({
      name: 'Viewport Detection',
      status: 'pass',
      message: `Viewport: ${width}x${viewport.height}px (${deviceType})`
    });

    // Test 2: Touch target size
    const buttons = document.querySelectorAll('button');
    let minButtonSize = Infinity;
    buttons.forEach(btn => {
      const rect = btn.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height);
      if (size < minButtonSize) minButtonSize = size;
    });
    
    if (deviceType === 'mobile' || deviceType === 'tablet') {
      results.push({
        name: 'Touch Targets',
        status: minButtonSize >= 44 ? 'pass' : 'fail',
        message: `Minimum button size: ${Math.round(minButtonSize)}px (target: 44px)`
      });
    }

    // Test 3: Font size
    const bodyFontSize = parseFloat(getComputedStyle(document.body).fontSize);
    if (deviceType === 'mobile') {
      results.push({
        name: 'Mobile Font Size',
        status: bodyFontSize >= 16 ? 'pass' : 'warn',
        message: `Body font size: ${bodyFontSize}px (target: ≥16px)`
      });
    }

    // Test 4: Responsive breakpoints
    const breakpointTest = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
    results.push({
      name: 'Breakpoint Logic',
      status: breakpointTest === deviceType ? 'pass' : 'fail',
      message: `Detected: ${deviceType}, Expected: ${breakpointTest}`
    });

    // Test 5: Horizontal scrolling
    const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    results.push({
      name: 'Horizontal Scroll',
      status: hasHorizontalScroll ? 'fail' : 'pass',
      message: hasHorizontalScroll ? 'Horizontal scrolling detected' : 'No horizontal scrolling'
    });

    // Test 6: Safe area insets (for notched devices)
    const safeAreaTop = getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top');
    if (safeAreaTop) {
      results.push({
        name: 'Safe Area Insets',
        status: 'pass',
        message: `Safe area top: ${safeAreaTop}`
      });
    } else if (deviceType === 'mobile') {
      results.push({
        name: 'Safe Area Insets',
        status: 'warn',
        message: 'Safe area insets not detected'
      });
    }

    // Test 7: Orientation support
    results.push({
      name: 'Orientation',
      status: 'pass',
      message: `Current: ${orientation} (${width}x${viewport.height})`
    });

    // Test 8: Input field sizes
    const inputs = document.querySelectorAll('input');
    let minInputHeight = Infinity;
    inputs.forEach(input => {
      const rect = input.getBoundingClientRect();
      if (rect.height < minInputHeight) minInputHeight = rect.height;
    });
    
    if (inputs.length > 0 && deviceType === 'mobile') {
      results.push({
        name: 'Input Field Height',
        status: minInputHeight >= 48 ? 'pass' : 'warn',
        message: `Minimum input height: ${Math.round(minInputHeight)}px (target: 48px)`
      });
    }

    setTestResults(results);
  };

  const getDeviceIcon = () => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-6 w-6" />;
      case 'tablet': return <Tablet className="h-6 w-6" />;
      case 'desktop': return <Monitor className="h-6 w-6" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warn': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-500">Pass</Badge>;
      case 'fail': return <Badge className="bg-red-500">Fail</Badge>;
      case 'warn': return <Badge className="bg-yellow-500">Warning</Badge>;
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading test environment...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const passCount = testResults.filter(r => r.status === 'pass').length;
  const failCount = testResults.filter(r => r.status === 'fail').length;
  const warnCount = testResults.filter(r => r.status === 'warn').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl flex items-center gap-3">
              <Maximize2 className="h-8 w-8" />
              Responsive Testing Dashboard
            </CardTitle>
            <p className="text-blue-100 text-sm lg:text-base">
              Real-time validation of mobile optimization and responsive design
            </p>
          </CardHeader>
        </Card>

        {/* Current Viewport Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-2">
                {getDeviceIcon()}
                <h3 className="font-semibold">Device Type</h3>
              </div>
              <p className="text-2xl font-bold capitalize">{deviceType}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Maximize2 className="h-6 w-6" />
                <h3 className="font-semibold">Viewport</h3>
              </div>
              <p className="text-2xl font-bold">{viewport.width}×{viewport.height}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-2">
                <RotateCw className="h-6 w-6" />
                <h3 className="font-semibold">Orientation</h3>
              </div>
              <p className="text-2xl font-bold capitalize">{orientation}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-2">
                <Monitor className="h-6 w-6" />
                <h3 className="font-semibold">Pixel Ratio</h3>
              </div>
              <p className="text-2xl font-bold">{window.devicePixelRatio}x</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <Card>
          <CardContent className="p-4 lg:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">Run Responsive Tests</h3>
                <p className="text-sm text-muted-foreground">
                  Validate touch targets, font sizes, and responsive behavior
                </p>
              </div>
              <Button onClick={runTests} size="lg" className="w-full sm:w-auto">
                Run Tests
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <CardContent className="p-4 lg:p-6 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-700 dark:text-green-400">{passCount}</p>
                  <p className="text-sm text-green-600 dark:text-green-500">Passed</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                <CardContent className="p-4 lg:p-6 text-center">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-red-700 dark:text-red-400">{failCount}</p>
                  <p className="text-sm text-red-600 dark:text-red-500">Failed</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4 lg:p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{warnCount}</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-500">Warnings</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent className="p-4 lg:p-6">
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-start gap-3 p-3 lg:p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                    >
                      <div className="mt-0.5">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm lg:text-base">{result.name}</h4>
                          {getStatusBadge(result.status)}
                        </div>
                        <p className="text-xs lg:text-sm text-muted-foreground">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Testing Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Desktop Testing (≥1024px)</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Resize browser to 1024px, 1280px, and 1920px widths</li>
                  <li>Verify desktop layouts are unchanged</li>
                  <li>Check that no mobile styles appear</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Tablet Testing (768-1023px)</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Resize browser to 768px and 1023px widths</li>
                  <li>Verify two-column layouts appear</li>
                  <li>Check hamburger menu is visible</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Mobile Testing (&lt;768px)</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Resize browser to 375px, 390px, and 430px widths</li>
                  <li>Verify single-column layouts</li>
                  <li>Check touch targets are ≥44px</li>
                  <li>Verify font sizes are ≥16px</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Orientation Testing</h4>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use browser DevTools device mode</li>
                  <li>Toggle between portrait and landscape</li>
                  <li>Verify layouts adapt smoothly</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Navigation</CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard">Dashboard</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/tickets">Tickets</a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/dashboard/customers">Customers</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
