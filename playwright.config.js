import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  fullyParallel: true,
  retries: 1,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
    // EKLENDİ: Tarayıcının PWA, CORS ve Cross-Origin kısıtlamalarını testlerde devre dışı bırakır.
    launchOptions: {
      args: ['--disable-web-security']
    }
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});