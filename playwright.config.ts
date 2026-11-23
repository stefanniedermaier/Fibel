import { defineConfig, devices } from '@playwright/test'

// End-to-end tests against the production build (npm run build), served by
// `vite preview`. Usage: npm run build && npm run e2e
// In CI the very artifact that gets deployed is tested: built and served with
// BASE_PATH=/<repo-name>/ (vite.config.ts reads it for both).
const PORT = 4173
const BASE = process.env.BASE_PATH ?? '/'

export default defineConfig({
  testDir: 'e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    trace: 'off',
    // A real-world target: Android phone in portrait.
    ...devices['Pixel 7'],
    // Pre-installed browser (e.g. in a sandbox) instead of the downloaded one.
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {},
  },
  webServer: {
    command: `npx vite preview --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
  },
})
