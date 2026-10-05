import { test, expect } from '@playwright/test';

test.describe('Anı Defteri ve Admin Süreçleri', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4,webm,ogg,mp3,wav}', route => route.abort());
    
    // CORS (Cross-Origin) başlıkları ve Content-Type eksiksiz eklendi
    await page.route('**/functions/v1/submit-form', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ 
          status: 200, 
          headers: { 
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*'
          } 
        });
        return;
      }
      await route.fulfill({ 
        status: 200, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { id: 'w1' } }) 
      });
    });
  });

  test('Misafir anı defterine mesaj bırakabilmeli ve form sıfırlanmalı', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.waitFor({ state: 'visible' });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    const wishesSection = page.locator('.card', { hasText: /Anı Defteri|Guestbook/i });
    await wishesSection.scrollIntoViewIfNeeded();

    await wishesSection.locator('input[name="name"]').fill('Playwright Test');
    await wishesSection.locator('textarea[name="message"]').fill('Tebrikler, çok mutlu olun!');

    const submitBtn = wishesSection.locator('button[type="submit"]');
    
    // Cloudflare Turnstile token'ının otomatik oluşturulup butonun aktifleşmesini bekle
    await expect(submitBtn).toBeEnabled({ timeout: 15000 });
    
    // İstek-yanıt döngüsünü kesin olarak yakala
    const responsePromise = page.waitForResponse(res => res.url().includes('submit-form'));
    await submitBtn.click();
    
    // Sunucu (veya Mock) yanıtını bekle. Bu sayede React Hook Form'un reset() işlemini kesinleştireceğiz.
    await responsePromise;

    // Form sıfırlandıktan sonra değerlerin boş olduğunu onayla
    await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
    await expect(wishesSection.locator('textarea[name="message"]')).toHaveValue('', { timeout: 10000 });
  });
});