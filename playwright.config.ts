import { defineConfig, devices } from '@playwright/test'

const startUrl = process.env.START_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './src/tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: startUrl,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm run build && pnpm run start',
    url: startUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
