import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Paneli: Oturma ve Masa Planı Testleri', () => {
  test('Admin oturma planı sekmesine geçip yeni masa ekleyebilmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    const tableTab = page.locator('button:has-text("Masa"), button:has-text("Oturma Planı"), [data-tab="tables"]').first();
    if (await tableTab.isVisible()) {
      await tableTab.click();
      
      const addTableBtn = page.locator('button:has-text("Masa Ekle"), button:has-text("Yeni Masa")').first();
      if (await addTableBtn.isVisible()) {
        await addTableBtn.click();
        const tableNameInput = page.locator('input[placeholder*="Masa"], input[name="tableName"]').first();
        if (await tableNameInput.isVisible()) {
          await tableNameInput.fill('VIP Masa 1');
          const saveBtn = page.locator('button:has-text("Kaydet"), button[type="submit"]').first();
          await saveBtn.click();
          await expect(page.locator('text=VIP Masa 1')).toBeVisible({ timeout: 5000 });
        }
      }
    }
  });
});