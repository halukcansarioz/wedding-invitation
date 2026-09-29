import { test, expect } from '@playwright/test';

test.describe('Sesli Mesaj ve Etkileşim Testleri', () => {

  test.beforeEach(async ({ page, context }) => {
    // Mikrofon erişim iznini test ortamında otomatik olarak veriyoruz
    await context.grantPermissions(['microphone']);
    
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı', async ({ page }) => {
    const wishesSection = page.locator('.wish-form');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await wishesSection.scrollIntoViewIfNeeded();

    // "Kaydet" veya "Record" butonunu bul
    const recordButton = wishesSection.locator('button', { hasText: /Kaydet|Record/i }).first();
    await expect(recordButton).toBeVisible({ timeout: 10000 });

    // Kaydı başlat
    await recordButton.click({ force: true });

    // Butonun kaydı durdurma "Durdur" veya "Stop" formuna dönüştüğünü doğrula
    const stopButton = wishesSection.locator('button', { hasText: /Durdur|Stop/i });
    await expect(stopButton).toBeVisible({ timeout: 5000 });

    // Kaydı durdur
    await stopButton.click({ force: true });

    // Kayıt bittikten sonra silme butonunun (Çöp Kutusu Emojisi 🗑️) geldiğini doğrula
    const deleteAudioButton = wishesSection.locator('button', { hasText: '🗑️' });
    await expect(deleteAudioButton).toBeVisible();

    // Sesi silip başa döndüğünü doğrula
    await deleteAudioButton.click({ force: true });
    await expect(recordButton).toBeVisible();
  });
});