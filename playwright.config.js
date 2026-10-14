import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  // CI ortamında takılan bir testin tüm süreyi yememesi için süreyi 30 saniyeye çektik
  timeout: 30 * 1000, 
  expect: {
    timeout: 10 * 1000, 
  },
  // CI ortamında konsolda anlık çıktı görmek ve HTML raporunun takılı kalmasını önlemek için:
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  fullyParallel: true,
  
  // GitHub Actions sunucuları 2 çekirdeklidir. 2 worker kullanarak test süresini optimize ediyoruz
  workers: process.env.CI ? 2 : undefined,
  
  // CI ortamında 1 tekrar (toplam 2 deneme), yerelde 0 tekrar
  retries: process.env.CI ? 1 : 0, 
  
  // Çok fazla test çöküyorsa 20 dakika beklemek yerine 10 hatadan sonra erken durdur
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
    // Vite sunucusunun CI ortamında port sorunları yaşamaması için --host eklendi
    command: 'npm run dev -- --host',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    // ÇÖZÜM: GitHub'da .env dosyası olmadığı için Vite sunucusuna sahte Supabase anahtarları veriyoruz
    env: {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://mock.supabase.co',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key',
    },
  },
});