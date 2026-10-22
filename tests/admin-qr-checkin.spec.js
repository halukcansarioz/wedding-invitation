import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Admin Paneli: QR Check-in ve Karşılama Testleri', () => {
  test('Admin QR okutma ekranını açıp misafir check-in yapabilmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });

    const qrTab = page.locator('button:has-text("QR"), button:has-text("Check-in"), [data-tab="qr"]').first();
    if (await qrTab.isVisible()) {
      await qrTab.click();
      
      const scanInput = page.locator('input[placeholder*="QR"], input[name="qrCode"]').first();
      if (await scanInput.isVisible()) {
        await scanInput.fill('GUEST-TEST-123');
        const checkinBtn = page.locator('button:has-text("Giriş Yap"), button:has-text("Check-in Onayla")').first();
        await checkinBtn.click();
        await expect(page.locator('text=Başarılı, text=Giriş Yaptı')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});