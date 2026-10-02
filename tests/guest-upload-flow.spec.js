import { test, expect } from '@playwright/test';

// Testi hızlandırmak için medya dosyalarını engelle
const mockMedia = async (page) => {
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Misafir Fotoğraf Yükleme (AR Photobooth) E2E Testi', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockMedia(page);

    // Supabase Storage upload isteğini mockluyoruz (Gerçek buluta dosya atmasın)
    await page.route('**/storage/v1/object/guest_photos/*', async route => {
      // CORS izni
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
        return;
      }
      await route.fulfill({ status: 200, body: JSON.stringify({ Key: 'test.jpg' }) });
    });

    // Supabase DB Insert isteğini mockluyoruz
    await page.route('**/rest/v1/guest_photos*', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
        return;
      }
      await route.fulfill({ status: 201, body: JSON.stringify([{ id: '1' }]) });
    });

    await page.goto('/');
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await page.waitForTimeout(500);
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden();
  });

  test('Misafir sahte bir fotoğraf seçtiğinde işlenmeli ve başarı mesajı çıkmalı', async ({ page }) => {
    // Fotoğraf Kabini bölümüne git
    const photoboothSection = page.locator('text=/Dijital Fotoğraf Kabini|AR Photobooth/i').locator('..');
    await photoboothSection.scrollIntoViewIfNeeded();

    // Görünmez (hidden) file input elementini bul
    const fileInput = photoboothSection.locator('input[type="file"]');
    
    // Playwright ile input'a sahte bir görsel dosyası (Buffer) yüklüyoruz
    await fileInput.setInputFiles({
      name: 'selfie.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64')
    });

    // Yükleme başladığında butonun "İşleniyor" durumuna geçtiğini doğrula
    const uploadBtn = photoboothSection.locator('button');
    await expect(uploadBtn).toHaveText(/İşleniyor|Processing/i);

    // Toast mesajının çıkmasını bekle (Başarı veya Onay Bekliyor bildirimi)
    const toastMessage = page.locator('text=/Harika!|Fotoğraf alındı/i').first();
    await expect(toastMessage).toBeVisible({ timeout: 15000 });

    // İşlem bittiğinde buton tekrar eski haline dönmeli
    await expect(uploadBtn).toHaveText(/Kamera \/ Galeri Aç|Open Camera/i);
  });
});