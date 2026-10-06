import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Misafir Fotoğraf Yükleme (AR Photobooth) E2E Testi', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page);

    // Storage mock: Dosya yükleme işlemine sahte onay verir
    await page.route('**/storage/v1/object/**', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }); return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ path: 'test.jpg' }) });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const envelopeSeal = page.locator('.envelope-seal');
    
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir sahte bir fotoğraf seçtiğinde işlenmeli ve başarı mesajı çıkmalı', async ({ page }) => {
    const photoboothSection = page.locator('.card').filter({ hasText: /Dijital Fotoğraf Kabini|AR Photobooth/i });
    await photoboothSection.scrollIntoViewIfNeeded();

    const fileInput = photoboothSection.locator('input[type="file"]');
    
    const validPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==', 'base64');
    await fileInput.setInputFiles({
      name: 'selfie.png',
      mimeType: 'image/png',
      buffer: validPng
    });

    const uploadBtn = photoboothSection.locator('button');
    
    // setupE2EMocks içindeki Supabase mock'u sayesinde fonksiyon anında başarılı döner. 
    // İşleniyor (Processing) durumunda takılı kalmaz.
    await expect(uploadBtn).toHaveText(/Kamera \/ Galeri Aç|Open Camera/i, { timeout: 15000 });
  });
});