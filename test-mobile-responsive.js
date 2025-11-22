/**
 * Mobile Responsive Testing Script
 * 
 * This script validates responsive breakpoints and mobile optimizations
 * Run with: node test-mobile-responsive.js
 */

const breakpoints = {
  mobile: {
    name: 'Mobile',
    widths: [375, 390, 430], // iPhone SE, iPhone 12/13/14, iPhone 14 Pro Max
    minTouchTarget: 44,
    minInputHeight: 48,
    minFontSize: 16,
  },
  tablet: {
    name: 'Tablet',
    widths: [768, 1023], // iPad Mini, iPad Pro (before desktop)
    minTouchTarget: 44,
  },
  desktop: {
    name: 'Desktop',
    widths: [1024, 1280, 1920], // Desktop breakpoint, common desktop, large desktop
  },
};

const testResults = {
  passed: [],
  failed: [],
  warnings: [],
};

function log(type, message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
  
  if (type === 'pass') {
    testResults.passed.push(entry);
    console.log('\x1b[32m✓\x1b[0m', message);
  } else if (type === 'fail') {
    testResults.failed.push(entry);
    console.log('\x1b[31m✗\x1b[0m', message);
  } else if (type === 'warn') {
    testResults.warnings.push(entry);
    console.log('\x1b[33m⚠\x1b[0m', message);
  } else {
    console.log('\x1b[36mℹ\x1b[0m', message);
  }
}

function testTailwindConfig() {
  console.log('\n=== Testing Tailwind Configuration ===\n');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const configPath = path.join(__dirname, 'tailwind.config.ts');
    
    if (!fs.existsSync(configPath)) {
      log('fail', 'tailwind.config.ts not found');
      return;
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for safe area insets
    if (configContent.includes('safe-area-inset')) {
      log('pass', 'Safe area insets configured in Tailwind');
    } else {
      log('warn', 'Safe area insets not found in Tailwind config');
    }
    
    // Check for scrollbar-hide utility
    if (configContent.includes('scrollbar-hide')) {
      log('pass', 'Scrollbar-hide utility configured');
    } else {
      log('warn', 'Scrollbar-hide utility not found in Tailwind config');
    }
    
    // Check for touch target utilities
    if (configContent.includes('touch') || configContent.includes('44px')) {
      log('pass', 'Touch target utilities appear to be configured');
    } else {
      log('warn', 'Touch target utilities not explicitly found');
    }
    
    // Check for responsive breakpoints
    if (configContent.includes('screens') || configContent.includes('768px') || configContent.includes('1024px')) {
      log('pass', 'Responsive breakpoints configured');
    } else {
      log('fail', 'Responsive breakpoints not found');
    }
    
  } catch (error) {
    log('fail', `Error reading Tailwind config: ${error.message}`);
  }
}

function testGlobalStyles() {
  console.log('\n=== Testing Global Styles ===\n');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const cssPath = path.join(__dirname, 'src', 'app', 'globals.css');
    
    if (!fs.existsSync(cssPath)) {
      log('fail', 'globals.css not found');
      return;
    }
    
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for safe area insets
    if (cssContent.includes('safe-area-inset') || cssContent.includes('env(safe-area')) {
      log('pass', 'Safe area insets implemented in global CSS');
    } else {
      log('warn', 'Safe area insets not found in global CSS');
    }
    
    // Check for smooth scrolling
    if (cssContent.includes('scroll-behavior: smooth')) {
      log('pass', 'Smooth scrolling enabled');
    } else {
      log('warn', 'Smooth scrolling not explicitly enabled');
    }
    
    // Check for reduced motion support
    if (cssContent.includes('prefers-reduced-motion')) {
      log('pass', 'Reduced motion preference supported');
    } else {
      log('warn', 'Reduced motion preference not found');
    }
    
    // Check for webkit scrolling
    if (cssContent.includes('-webkit-overflow-scrolling')) {
      log('pass', 'iOS momentum scrolling enabled');
    } else {
      log('warn', 'iOS momentum scrolling not found');
    }
    
  } catch (error) {
    log('fail', `Error reading global CSS: ${error.message}`);
  }
}

function testComponentFiles() {
  console.log('\n=== Testing Component Files ===\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const componentsToTest = [
    { path: 'src/components/ui/button.tsx', name: 'Button Component' },
    { path: 'src/components/ui/input.tsx', name: 'Input Component' },
    { path: 'src/components/MobileModal.tsx', name: 'MobileModal Component' },
    { path: 'src/components/ResponsiveTable.tsx', name: 'ResponsiveTable Component' },
    { path: 'src/app/dashboard/layout.tsx', name: 'Dashboard Layout' },
  ];
  
  componentsToTest.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for responsive classes
      const hasResponsiveClasses = /\b(sm:|md:|lg:|xl:)/.test(content);
      if (hasResponsiveClasses) {
        log('pass', `${name} uses responsive Tailwind classes`);
      } else {
        log('warn', `${name} may not have responsive classes`);
      }
      
      // Check for touch-friendly classes
      const hasTouchClasses = /\b(active:|touch-|min-h-\[44px\]|min-h-11|min-h-12|h-11|h-12)/.test(content);
      if (hasTouchClasses) {
        log('pass', `${name} has touch-friendly sizing`);
      } else if (name.includes('Button') || name.includes('Input')) {
        log('warn', `${name} may not have optimal touch targets`);
      }
      
    } else {
      log('warn', `${name} not found at ${filePath}`);
    }
  });
}

function testPageFiles() {
  console.log('\n=== Testing Page Files ===\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const pagesToTest = [
    { path: 'src/app/dashboard/page.tsx', name: 'Dashboard Page' },
    { path: 'src/app/dashboard/tickets/page.tsx', name: 'Tickets Page' },
    { path: 'src/app/dashboard/customers/page.tsx', name: 'Customers Page' },
    { path: 'src/app/dashboard/tickets/[id]/page.tsx', name: 'Ticket Detail Page' },
    { path: 'src/app/dashboard/customers/[id]/page.tsx', name: 'Customer Detail Page' },
  ];
  
  pagesToTest.forEach(({ path: filePath, name }) => {
    const fullPath = path.join(__dirname, filePath);
    
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for responsive grid classes
      const hasResponsiveGrid = /grid-cols-1.*(?:md:|lg:)grid-cols-/.test(content);
      if (hasResponsiveGrid) {
        log('pass', `${name} has responsive grid layouts`);
      } else {
        log('warn', `${name} may not have responsive grids`);
      }
      
      // Check for mobile-first padding
      const hasResponsivePadding = /\b(p-\d+.*lg:p-\d+|px-\d+.*lg:px-\d+|py-\d+.*lg:py-\d+)/.test(content);
      if (hasResponsivePadding) {
        log('pass', `${name} has responsive padding`);
      } else {
        log('info', `${name} may use consistent padding across breakpoints`);
      }
      
    } else {
      log('fail', `${name} not found at ${filePath}`);
    }
  });
}

function testResponsiveUtilities() {
  console.log('\n=== Testing Responsive Utilities ===\n');
  
  const fs = require('fs');
  const path = require('path');
  
  const utilsPath = path.join(__dirname, 'src', 'lib', 'responsive.ts');
  
  if (fs.existsSync(utilsPath)) {
    const content = fs.readFileSync(utilsPath, 'utf8');
    
    if (content.includes('useBreakpoint')) {
      log('pass', 'useBreakpoint hook implemented');
    } else {
      log('warn', 'useBreakpoint hook not found');
    }
    
    if (content.includes('useIsMobile')) {
      log('pass', 'useIsMobile hook implemented');
    } else {
      log('warn', 'useIsMobile hook not found');
    }
    
    if (content.includes('useIsTablet')) {
      log('pass', 'useIsTablet hook implemented');
    } else {
      log('warn', 'useIsTablet hook not found');
    }
    
  } else {
    log('warn', 'Responsive utilities file not found');
  }
}

function testAccessibilityFeatures() {
  console.log('\n=== Testing Accessibility Features ===\n');
  
  const fs = require('fs');
  const path = require('path');
  
  // Check for accessibility utilities
  const a11yPath = path.join(__dirname, 'src', 'lib', 'accessibility.ts');
  if (fs.existsSync(a11yPath)) {
    log('pass', 'Accessibility utilities file exists');
  } else {
    log('warn', 'Accessibility utilities file not found');
  }
  
  // Check for keyboard navigation
  const keyboardNavPath = path.join(__dirname, 'src', 'hooks', 'useKeyboardNavigation.ts');
  if (fs.existsSync(keyboardNavPath)) {
    log('pass', 'Keyboard navigation hook exists');
  } else {
    log('warn', 'Keyboard navigation hook not found');
  }
  
  // Check for font scaling support
  const fontScalePath = path.join(__dirname, 'src', 'hooks', 'useFontScale.ts');
  if (fs.existsSync(fontScalePath)) {
    log('pass', 'Font scaling hook exists');
  } else {
    log('warn', 'Font scaling hook not found');
  }
}

function testPerformanceOptimizations() {
  console.log('\n=== Testing Performance Optimizations ===\n');
  
  const fs = require('fs');
  const path = require('path');
  
  // Check for lazy loading
  const lazyModalPath = path.join(__dirname, 'src', 'components', 'LazyModal.tsx');
  if (fs.existsSync(lazyModalPath)) {
    log('pass', 'Lazy modal component exists');
  } else {
    log('warn', 'Lazy modal component not found');
  }
  
  // Check for optimized images
  const optimizedImagePath = path.join(__dirname, 'src', 'components', 'OptimizedImage.tsx');
  if (fs.existsSync(optimizedImagePath)) {
    log('pass', 'Optimized image component exists');
  } else {
    log('warn', 'Optimized image component not found');
  }
  
  // Check for performance monitoring
  const perfMonitorPath = path.join(__dirname, 'src', 'components', 'PerformanceMonitor.tsx');
  if (fs.existsSync(perfMonitorPath)) {
    log('pass', 'Performance monitor component exists');
  } else {
    log('warn', 'Performance monitor component not found');
  }
  
  // Check for Lighthouse config
  const lighthousePath = path.join(__dirname, 'lighthouserc.json');
  if (fs.existsSync(lighthousePath)) {
    log('pass', 'Lighthouse CI configuration exists');
  } else {
    log('warn', 'Lighthouse CI configuration not found');
  }
}

function generateReport() {
  console.log('\n=== Test Summary ===\n');
  
  console.log(`\x1b[32mPassed: ${testResults.passed.length}\x1b[0m`);
  console.log(`\x1b[31mFailed: ${testResults.failed.length}\x1b[0m`);
  console.log(`\x1b[33mWarnings: ${testResults.warnings.length}\x1b[0m`);
  
  if (testResults.failed.length > 0) {
    console.log('\n\x1b[31m=== Failed Tests ===\x1b[0m\n');
    testResults.failed.forEach(entry => console.log(entry));
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n\x1b[33m=== Warnings ===\x1b[0m\n');
    testResults.warnings.forEach(entry => console.log(entry));
  }
  
  // Write report to file
  const fs = require('fs');
  const reportPath = './mobile-test-report.txt';
  const reportContent = `
Mobile Responsive Testing Report
Generated: ${new Date().toISOString()}

SUMMARY
=======
Passed: ${testResults.passed.length}
Failed: ${testResults.failed.length}
Warnings: ${testResults.warnings.length}

PASSED TESTS
============
${testResults.passed.join('\n')}

FAILED TESTS
============
${testResults.failed.join('\n')}

WARNINGS
========
${testResults.warnings.join('\n')}
`;
  
  fs.writeFileSync(reportPath, reportContent);
  console.log(`\n\x1b[36mReport saved to: ${reportPath}\x1b[0m\n`);
  
  // Exit with error code if tests failed
  if (testResults.failed.length > 0) {
    process.exit(1);
  }
}

// Run all tests
console.log('\x1b[36m');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Mobile Responsive Testing Script                      ║');
console.log('║     Smart Service Ticketing System                        ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('\x1b[0m');

testTailwindConfig();
testGlobalStyles();
testComponentFiles();
testPageFiles();
testResponsiveUtilities();
testAccessibilityFeatures();
testPerformanceOptimizations();
generateReport();
