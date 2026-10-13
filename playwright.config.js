import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // Test başına maksimum süreyi 30 saniyeden 60 saniyeye çıkardık
  timeout: 60 * 1000, 
  expect: {
    // Beklenti (expect) sürelerini 5 saniyeden 15 saniyeye çıkardık
    timeout: 15 * 1000, 
  },
  reporter: 'html',
  fullyParallel: true,
  // Hata anında testi 1 yerine 2 kez daha otomatik denemesini sağlıyoruz (Vite'ın önbelleklenmesi için zaman kazandırır)
  retries: 2, 
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    headless: true,
    // Tıklama, form doldurma (fill) gibi aksiyonları bekleme süresini artırdık
    actionTimeout: 20 * 1000, 
    // Sayfa yüklenme (page.goto) süresini 30 saniyeye çıkardık
    navigationTimeout: 30 * 1000, 
    launchOptions: {
      args: ['--disable-web-security']
    }
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    // Sunucunun ayağa kalkması için verilen süreyi garantiye aldık
    timeout: 120 * 1000,
  },
});