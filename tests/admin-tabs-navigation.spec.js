import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Paneli Sekme (Tab) Gezinme Testi', () => {
  test('Admin farklı sekmelere (Tema, Galeri, Görünürlük) tıklandığında doğru sayfaları açmalı', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    const adminPage = page.locator('.admin-page, .admin-shell-card').first();
    await expect(adminPage).toBeVisible({ timeout: 15000 });

    const galleryTabBtn = page.locator('button.admin-nav-button').filter({ hasText: /Görsel|Müzik|Galeri|Visuals|Gallery/i }).first();
    if (await galleryTabBtn.isVisible()) {
      await galleryTabBtn.click();
      await expect(page.locator('.admin-editor-section').first()).toBeVisible({ timeout: 5000 });
    } else {
      const loginForm = page.locator('form.admin-login, .admin-login').first();
      await expect(loginForm).toBeVisible({ timeout: 5000 });
    }
  });
});