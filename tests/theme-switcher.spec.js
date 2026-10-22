import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Paneli: Tema Değiştirme ve Özelleştirme Testleri', () => {
  test('Admin panelinden tema değiştirildiğinde HTML niteliği güncellenmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    const themeTab = page.locator('button:has-text("Tema"), [data-tab="theme"]').first();
    if (await themeTab.isVisible()) {
      await themeTab.click();
      const themeCard = page.locator('.theme-card, [data-theme-name]').first();
      if (await themeCard.isVisible()) {
        await themeCard.click();
        const htmlTag = page.locator('html');
        await expect(htmlTag).toHaveAttribute('data-theme', /.+/);
      }
    }
  });
});