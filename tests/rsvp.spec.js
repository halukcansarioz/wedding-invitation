import { test, expect } from '@playwright/test';

test.describe('Düğün Davetiyesi LCV (RSVP) Süreçleri', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
    
    await page.addInitScript(() => { 
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true }); 
    });
    
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.waitFor({ state: 'visible' });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('LCV formu boş gönderilmek istendiğinde doğrulama hataları (Zod) gösterilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    const submitBtn = rsvpSection.locator('button[type="submit"]');
    await submitBtn.click();

    const errorMsg = rsvpSection.locator('span').filter({ hasText: /./ }).first();
    await expect(errorMsg).toBeVisible({ timeout: 10000 });
  });
});