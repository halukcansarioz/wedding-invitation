import { test, expect } from '@playwright/test';

test.describe('Realtime Senkronizasyon: Anı Defteri ve Barkovizyon', () => {
  
  test('Bir ekrandan gönderilen mesaj diğer ekrana anında yansımalı', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const pageForm = await context1.newPage();
    const pageLive = await context2.newPage();

    const setupPage = async (page) => {
      // Turnstile kontrolünü bypass et
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
      });

      // Medyaları ve animasyonları engelle
      await page.route('**/*.{png,jpg,jpeg,webp,gif}', r => r.fulfill({ body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'), contentType: 'image/png' }));
      await page.route('**/*.{mp4,webm,ogg,mp3,wav}', r => r.abort());
      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }' });

      // Supabase Edge Function Mock'u
      await page.route('**/functions/v1/submit-form', async route => {
        if (route.request().method() === 'OPTIONS') {
          await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ 
            success: true, 
            data: { id: 'mock-live-1', name: 'Canlı Test', message: 'Ekranda belirecek canlı mesaj', approved: true } 
          })
        });
      });
    };

    await setupPage(pageForm);
    await setupPage(pageLive);

    // 1. Ziyaretçi Sayfası (Form)
    await pageForm.goto('/');
    const envelopeSeal = pageForm.locator('.envelope-seal');
    await envelopeSeal.waitFor({ state: 'visible', timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(pageForm.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    // 2. Barkovizyon Sayfası
    await pageLive.goto('/live'); 

    // Formu doldur
    const sectionQuery = 'section.card:has-text("Anı Defteri"), section.card:has-text("Guestbook")';
    const wishesSection = pageForm.locator(sectionQuery).first();
    await wishesSection.scrollIntoViewIfNeeded();
    
    await wishesSection.locator('input[name="name"]').fill('Canlı Test');
    await wishesSection.locator('textarea[name="message"]').fill('Ekranda belirecek canlı mesaj');

    const submitBtn = wishesSection.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    
    // Gönder Butonuna Bas
    await submitBtn.click({ force: true });

    // Form sıfırlanmalı
    await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 15000 });
    await expect(wishesSection.locator('textarea[name="message"]')).toHaveValue('', { timeout: 15000 });

    // Canlı ekranda mesajın göründüğünü doğrula
    await expect(pageLive.locator('text=Ekranda belirecek canlı mesaj').first()).toBeVisible({ timeout: 15000 });

    await context1.close();
    await context2.close();
  });
});