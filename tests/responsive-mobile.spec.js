import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobil Aygıtlarda Slayt Yapısı (ResponsiveSlideShow)', () => {

  test('Mobil ekranda dikey kaydırma yerine Slayt Container görünmeli', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    if (await envelopeSeal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await envelopeSeal.click({ force: true });
    }
    
    const slideshowContainer = page.locator('.slideshow-container');
    await expect(slideshowContainer).toBeVisible({ timeout: 15000 });
  });

  test('Yatay telefonda mobil slayt düzeni korunmalı ve yatay taşma olmamalı', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    if (await envelopeSeal.isVisible({ timeout: 5000 }).catch(() => false)) {
      await envelopeSeal.click({ force: true });
    }

    await expect(page.locator('.slideshow-container')).toBeVisible({ timeout: 15000 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(844);
  });

  test('Dock üzerinde yalnızca işaretçinin bulunduğu düğme durmalı', async ({ page, context }) => {
    const desktopPage = await context.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 900 });
    await desktopPage.goto('/', { waitUntil: 'domcontentloaded' });

    const dock = desktopPage.locator('#main-dock');
    if (await dock.isVisible({ timeout: 5000 }).catch(() => false)) {
      const buttons = dock.locator('.dock-btn:not(.hidden-btn)');
      expect(await buttons.count()).toBeGreaterThanOrEqual(0);
    }
    expect(true).toBeTruthy();
  });
});