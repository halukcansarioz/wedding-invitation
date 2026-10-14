import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Testin global olarak bekleme süresi 60 saniye (yeterli bir süre)
  timeout: 60000, 
  expect: {
    // Assert işlemleri (toBeVisible vb.) için bekleme süresi
    timeout: 15000, 
  },
  reporter: 'html',
  fullyParallel: true,
  
  // EKLENDİ: GitHub (CI) ortamında sunucunun çökmemesi için worker sayısı 1'e düşürüldü. Yerelde sınırsız çalışır.
  workers: process.env.CI ? 1 : undefined,
  
  retries: 2, 
  use: {
    // GÜNCELLENDİ: CI ortamlarındaki IP çözümleme hatalarını önlemek için 127.0.0.1 yerine localhost yapıldı.
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
    actionTimeout: 20000, 
    navigationTimeout: 30000, 
    launchOptions: {
      args: ['--disable-web-security']
    }
  },
  webServer: {
    command: 'npm run dev',
    // GÜNCELLENDİ: CI ortamlarındaki IP çözümleme hatalarını önlemek için 127.0.0.1 yerine localhost yapıldı.
    url: 'http://localhost:5173',
    // CI ortamlarında sunucunun başlaması uzun sürdüğü için en kritik ayar: 2 dakika bekle
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});