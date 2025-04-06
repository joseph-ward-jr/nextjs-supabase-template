import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Use process.env.PORT by default and fallback to 3000
const PORT = process.env.PORT || 3000;

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct PORT variable
const baseURL = `http://localhost:${PORT}`;

/**
 * Read environment variables from file.
 * [https://github.com/motdotla/dotenv](https://github.com/motdotla/dotenv)
 */
// require('dotenv').config();

/**
 * See [https://playwright.dev/docs/test-configuration.](https://playwright.dev/docs/test-configuration.)
 */
export default defineConfig({
  // Timeout per test
  timeout: 30 * 1000,
  // Test directory
  testDir: path.join(__dirname, 'tests/e2e'), // Point to your E2E test directory
  // If a test fails, retry it additional 2 times
  retries: 2,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: 'test-results/',

  // Run your local dev server before starting the tests:
  // [https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests](https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests)
  webServer: {
    command: 'npm run dev', // Command to start the dev server
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Use baseURL so to make navigations relative.
    // More information: [https://playwright.dev/docs/api/class-testoptions#test-options-base-url](https://playwright.dev/docs/api/class-testoptions#test-options-base-url)
    baseURL,

    // Collect trace when retrying the failed test. See [https://playwright.dev/docs/trace-viewer](https://playwright.dev/docs/trace-viewer)
    trace: 'on-first-retry',
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Optionally add Firefox, Webkit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
