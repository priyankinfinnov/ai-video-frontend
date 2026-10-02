import { defineConfig, devices } from '@playwright/test';

process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6011';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:6003',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:6003',
      reuseExistingServer: true,
      timeout: 60000,
      env: {
        NODE_ENV: 'test',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6011',
      },
    },
    {
      command: 'npm run test:api',
      url: 'http://localhost:6011/health',
      reuseExistingServer: true,
      timeout: 60000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

