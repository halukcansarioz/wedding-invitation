import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Anı Defteri ve Admin Süreçleri', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page);
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', r => r.abort());
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir anı defterine mesaj bırakabilmeli ve form sıfırlanmalı', async ({ page }) => {
     const wishesSection = page.locator('.card', { hasText: /Anı Defteri|Guestbook/i });
     await wishesSection.scrollIntoViewIfNeeded();

     await page.locator('.wish-form input[name="name"]').fill('Test Misafiri');
     await page.locator('.wish-form textarea[name="message"]').fill('Bu bir test mesajıdır, mutluluklar!');

     const submitBtn = page.locator('.wish-form button[type="submit"]');
     await submitBtn.click({ force: true });

     await expect(page.locator('.wish-form input[name="name"]')).toHaveValue('');
     await expect(page.locator('.wish-form textarea[name="message"]')).toHaveValue('');
  });
});
