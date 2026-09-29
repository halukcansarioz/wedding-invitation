import { test, expect, devices } from '@playwright/test';

// Tüm test dosyasını iPhone 12 çözünürlüğünde (mobil) simüle et
test.use({ ...devices['iPhone 12'] });

test.describe('Mobil Aygıtlarda Slayt Yapısı (ResponsiveSlideShow)', () => {

  test('Mobil ekranda dikey kaydırma yerine Slayt Container görünmeli', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    // Masaüstünde çalışan '.invitation-page' yerine mobilde çalışan '.slideshow-container' DOM'da olmalı
    const slideshowContainer = page.locator('.slideshow-container');
    await expect(slideshowContainer).toBeVisible({ timeout: 10000 });

    // Alt kısımda İleri / Geri oklarını içeren slide kontrolleri görünür olmalı
    const slideControls = page.locator('.slide-controls');
    await expect(slideControls).toBeVisible();

    // İleri butonunun varlığını onayla
    const nextButton = slideControls.locator('button').nth(1); // 2. buton (ileri)
    await expect(nextButton).toBeVisible();
    
    // Üstte ilerleme çubuğunun (Progress bar) render edildiğini doğrula
    const progressBar = page.locator('.slide-progress-fill');
    await expect(progressBar).toBeVisible();
  });
});