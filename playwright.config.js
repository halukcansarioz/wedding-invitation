import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // CI ortamında takılan bir testin tüm süreyi yememesi için süreyi 30 saniyeye çektik
  timeout: 30 * 1000, 
  expect: {
    timeout: 10 * 1000, 
  },
  // CI ortamında 'html' raporu bazen süreci açık bırakıp asılı kalabilir, 'list' ve 'html' birlikte daha güvenlidir
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  fullyParallel: true,
  
  // GitHub Actions sunucuları 2 çekirdeklidir. 2 worker kullanarak test süresini yarı yarıya indiriyoruz
  workers: process.env.CI ? 2 : undefined,
  
  // 2 tekrar (toplam 3 deneme) süreyi 3 katına çıkarır. CI için 1 tekrar (toplam 2 deneme) idealdir
  retries: process.env.CI ? 1 : 0, 
  
  // Çok fazla test çöküyorsa 20 dakika beklemek yerine 5 hatadan sonra erken durdur (isteğe bağlı)
  maxFailures: process.env.CI ? 10 : 0,

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
    actionTimeout: 15 * 1000, 
    navigationTimeout: 20 * 1000, 
    launchOptions: {
      args: ['--disable-web-security']
    }
  },
  webServer: {
    // Vite sunucusunun CI ortamında port sorunları yaşamaması için --host ekledik
    command: 'npm run dev -- --host',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});