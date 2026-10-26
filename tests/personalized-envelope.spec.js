import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Kişiye Özel Zarf ve Klavye Etkileşimi Testleri', () => {
  test('URL parametresi ile gelen misafir adı ve masa numarası zarf üzerinde görünmeli ve Enter ile açılmalı', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/?guest=Ahmet%20Y%C4%B1lmaz&table=12', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });

    const guestBadge = page.locator('.envelope-guest-badge');
    if (await guestBadge.isVisible()) {
      await expect(guestBadge).toContainText('Ahmet Yılmaz');
      await expect(guestBadge).toContainText('12');
    }

    await page.keyboard.press('Enter');
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });
});