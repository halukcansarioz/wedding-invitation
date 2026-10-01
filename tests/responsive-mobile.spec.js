import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 12'] });

test.describe('Mobil Aygıtlarda Slayt Yapısı (ResponsiveSlideShow)', () => {

  test('Mobil ekranda dikey kaydırma yerine Slayt Container görünmeli', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
    
    const slideshowContainer = page.locator('.slideshow-container');
    await expect(slideshowContainer).toBeVisible({ timeout: 15000 });
    
    const slideControls = page.locator('.slide-controls');
    await expect(slideControls).toBeVisible();
  });

  test('Yatay telefonda mobil slayt düzeni korunmalı ve yatay taşma olmamalı', async ({ page }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });

    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('.slideshow-container')).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(844);
  });

  test('Dock üzerinde yalnızca işaretçinin bulunduğu düğme durmalı', async ({ page }) => {
    const desktopContext = await page.context().browser().newContext({ viewport: { width: 1280, height: 900 } });
    try {
      const desktopPage = await desktopContext.newPage();
      await desktopPage.goto('http://localhost:5173/');

      const dock = desktopPage.locator('#main-dock');
      const buttons = dock.locator('.dock-btn:not(.hidden-btn)');
      await expect(buttons.first()).toBeVisible();
      expect(await buttons.count()).toBeGreaterThan(1);
      await expect.poll(() => dock.evaluate((element) => getComputedStyle(element).animationName)).toBe('none');
      await expect.poll(() => buttons.first().evaluate((element) => getComputedStyle(element).animationName)).toBe('dockButtonBounce');

      await buttons.first().hover({ force: true });
      await expect.poll(() => buttons.first().evaluate((element) => getComputedStyle(element).animationPlayState)).toBe('paused');

      for (let index = 1; index < await buttons.count(); index++) {
        await expect.poll(() => buttons.nth(index).evaluate((element) => getComputedStyle(element).animationPlayState)).toBe('running');
      }
    } finally {
      await desktopContext.close();
    }
  });
});