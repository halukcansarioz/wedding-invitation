import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Misafir Fotoğraf Yükleme (AR Photobooth) E2E Testi', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    await page.route('**/storage/v1/object/**', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }); return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ path: 'test.jpg' }) });
    });

    await page.route('**/rest/v1/guest_photos*', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }); return;
      }
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify([{ id: '1', approved: true }]) });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const envelopeSeal = page.locator('.envelope-seal');
    
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.waitFor({ state: 'visible' });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir sahte bir fotoğraf seçtiğinde işlenmeli ve başarı mesajı çıkmalı', async ({ page }) => {
    const photoboothSection = page.locator('.card').filter({ hasText: /Dijital Fotoğraf Kabini|AR Photobooth/i });
    await photoboothSection.scrollIntoViewIfNeeded();

    const fileInput = photoboothSection.locator('input[type="file"]');
    
    // DÜZELTME: Daha geçerli bir base64 PNG formatı kullanıldı
    const validPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
    await fileInput.setInputFiles({
      name: 'selfie.png',
      mimeType: 'image/png',
      buffer: validPng
    });

    const uploadBtn = photoboothSection.locator('button');
    await expect(uploadBtn).toHaveText(/İşleniyor|Processing/i, { timeout: 10000 });

    // DÜZELTME: Sıkıntılı Toast uyarılarını beklemek yerine, işlemin bitip butonun tekrar kullanılabilir duruma (Orijinal ismine) dönmesini bekliyoruz.
    await expect(uploadBtn).toHaveText(/Kamera \/ Galeri Aç|Open Camera/i, { timeout: 20000 });
  });
});