import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for OUR-Bikes Store E2E testing
 */
export default defineConfig({
  testDir: './src/e2e',
  
  // Global test configuration
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  
  // Retry configuration
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report.json' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
    ['line']
  ],
  
  // Browser configuration
  use: {
    // Viewport configuration
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Screenshot configuration
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true
    },
    video: {
      mode: 'retain-on-failure',
      size: { width: 1280, height: 720 }
    },
    trace: 'retain-on-failure'
  },
  
  // Projects for different environments
  projects: [
    // Desktop Chrome
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'] }
    },
    
    // Mobile Safari
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] }
    },
    
    // Tablet Chrome
    {
      name: 'tablet-chrome',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 1024, height: 768 }
      }
    },
    
    // Dark mode testing
    {
      name: 'dark-mode',
      use: {
        ...devices['Desktop Chrome'],
        colorScheme: 'dark'
      }
    },
    
    // High contrast testing
    {
      name: 'high-contrast',
      use: {
        ...devices['Desktop Chrome']
      }
    }
  ],
  
  // Output configuration
  outputDir: 'test-results'
});
