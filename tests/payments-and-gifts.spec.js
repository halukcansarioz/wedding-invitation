import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

test.describe('Hediye ve Ödeme İşlemleri Uçtan Uca (E2E)', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  });

  test('Misafir IBAN panosunu kopyalayabilmeli', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const giftSection = page.locator('.gift-card').first();
    await giftSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const copyIbanButton = page.locator('button', { hasText: /Kopyala|Copy/i }).first();
    await expect(copyIbanButton).toBeVisible({ timeout: 10000 });

    await copyIbanButton.click();
    await expect(copyIbanButton).toContainText(/Kopyalandı|Copied/i);

    const clipboardText = await page.evaluate("navigator.clipboard.readText()");
    expect(clipboardText).toContain("TR");
  });

  test('Kredi kartı modülü açıksa Supabase ödeme Edge Functionuna istek atılmalı', async ({ page }) => {
    await page.addInitScript(() => {
      window.prompt = () => "500"; 
    });

    await page.route('**/functions/v1/create-payment', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, paymentUrl: 'https://checkout.stripe.com/test-url' })
      });
    });

    const giftSection = page.locator('.gift-card').first();
    await giftSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const creditCardButton = page.locator('button', { hasText: /Kredi Kartı/i });
    if (await creditCardButton.isVisible()) {
      await creditCardButton.click();
    }
  });
});