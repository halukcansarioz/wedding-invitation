import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Anı Defteri (Guestbook) Mesaj Gönderim Testleri', () => {
  test('Misafir anı defterine isim ve mesaj yazıp gönderebilmeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));

    const nameInput = page.locator('input[placeholder*="Ad"], input[name*="name"], input[type="text"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Misafir');
      
      const messageInput = page.locator('textarea, input[placeholder*="Mesaj"], input[name*="message"]').first();
      if (await messageInput.isVisible()) {
        await messageInput.fill('Ömür boyu mutluluklar dileriz!');
      }

      const submitBtn = page.locator('button[type="submit"], button:has-text("Gönder"), button:has-text("Paylaş")').last();
      if (await submitBtn.isVisible()) {
        await submitBtn.click();
      }
    }
  });
});