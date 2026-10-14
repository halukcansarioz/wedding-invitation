import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000, 
  expect: {
    timeout: 10 * 1000, 
  },
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: process.env.CI ? 1 : 0, 
  maxFailures: process.env.CI ? 10 : 0,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
    actionTimeout: 15 * 1000, 
    navigationTimeout: 20 * 1000, 
    // EKLENDİ: Tarayıcıya mikrofon iznini otomatik ver
    permissions: ['microphone'],
    launchOptions: {
      args: [
        '--disable-web-security',
        // EKLENDİ: GitHub Actions (CI) sunucusunda fiziksel mikrofon olmadığı için sanal mikrofon simüle et
        '--use-fake-ui-for-media-stream',
        '--use-fake-device-for-media-stream'
      ]
    }
  },
  webServer: {
    command: 'npm run dev -- --host',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://mock.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
    },
  },
});