import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Set to false for better visibility when running visible tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1, // Allow retries for flaky tests
  workers: process.env.CI ? 1 : 1, // Single worker for visible mode
  timeout: 120000, // 2 minutes per test
  globalTimeout: 600000, // 10 minutes total
  reporter: [
    ['./tests/utils/custom-reporter.ts'], // Custom PMI reporter first
    ['html', { outputFolder: 'test-results/html-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }],
    ['list'], // Console output
  ],
  use: {
    baseURL: process.env.BASE_URL || 'https://pmiloc.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: process.env.CI ? true : false, // Always visible in local mode
    viewport: { width: 1920, height: 1080 }, // Large viewport for better visibility
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    launchOptions: {
      slowMo: process.env.CI ? 0 : 500, // Slow motion for better visibility
      args: process.env.CI ? [] : ['--start-maximized', '--disable-web-security']
    }
  },
  projects: [
    {
      name: 'pmiloc-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        launchOptions: {
          headless: process.env.CI ? true : false,
          slowMo: process.env.CI ? 0 : 500,
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
  webServer: process.env.START_SERVER ? {
    command: 'npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  } : undefined,
});