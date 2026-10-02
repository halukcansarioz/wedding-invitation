import { test, expect, devices } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

// iPhone 13 Pro boyutlarını (Mobil cihaz) simüle et
test.use({ ...devices['iPhone 13 Pro'] });

test.describe('Mobil Cihazlarda Responsive Slayt (Slideshow) Davranışı', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Mobil ekranda scroll gizlenmeli ve slayt kontrolleri görünmeli', async ({ page }) => {
    // Mobil görünümde slideshow-container devrede olmalı
    const slideshowContainer = page.locator('.slideshow-container');
    await expect(slideshowContainer).toBeVisible();

    // Body üzerindeki scroll kilitlenmiş olmalı (overflow: hidden)
    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    expect(bodyOverflow).toBe('hidden');

    // Sağ yön tuşu (İleri) butonunun görünür olduğunu doğrula
    const nextButton = page.locator('.slide-controls button').nth(1);
    await expect(nextButton).toBeVisible();

    // İleri butonuna basıldığında yeni slayt yüklenmeli
    await nextButton.click();
    await page.waitForTimeout(800); // Animasyon süresini bekle

    // İlk başta silik (opacity: 0.3) olan Geri butonunun artık tıklanabilir (opacity: 1) olduğunu doğrula
    const prevButton = page.locator('.slide-controls button').nth(0);
    await expect(prevButton).not.toHaveCSS('opacity', '0.3');
  });
});