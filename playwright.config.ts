import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Set to false for better visibility when running visible tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? (parseInt(process.env.MAX_RETRIES) || 2) : 1, // Allow retries for flaky tests
  workers: parseInt(process.env.PARALLEL_WORKERS) || 1, // Single worker for visible mode
  timeout: parseInt(process.env.BROWSER_TIMEOUT) || 60000, // 1 minute per test (max 60 seconds for web operations)
  globalTimeout: 600000, // 10 minutes total
  reporter: [
    ['./tests/utils/custom-reporter.ts'], // Custom PMI reporter first
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'], // Console output
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://pmiloc.org',
    trace: 'on-first-retry',
    screenshot: process.env.SCREENSHOT_ON_FAILURE === 'true' ? 'only-on-failure' : 'off',
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'retain-on-failure' : 'off',
    headless: process.env.CI ? true : false, // Always visible in local mode
    viewport: { width: 1920, height: 1080 }, // Large viewport for better visibility
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    launchOptions: {
      slowMo: process.env.CI ? 0 : (parseInt(process.env.SLOW_MOTION_DELAY) || 500), // Slow motion for better visibility
      args: process.env.CI ? [] : ['--start-maximized', '--disable-web-security']
    },
    // Reuse browser context across tests for better performance
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: 'pmiloc-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          headless: process.env.CI ? true : false,
          slowMo: process.env.CI ? 0 : (parseInt(process.env.SLOW_MOTION_DELAY) || 500),
          args: process.env.CI ? [] : ['--start-maximized', '--disable-web-security']
        }
      },
    },
    // Commented out other browsers for focused testing
    // Uncomment when needed for cross-browser testing
    /*
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
    */
  ],
  // webServer removed - no start script available
});