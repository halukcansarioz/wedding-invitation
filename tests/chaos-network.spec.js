import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Ağ Gecikmesi ve Kaos Senaryoları', () => {
  test('Yavaş bağlantıda form gönderimi ve hata toleransı', async ({ page, context }) => {
    test.setTimeout(60000);
    
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    const nameInput = rsvpSection.locator('input:not([name="honeypot"]):not([type="hidden"])').first();
    await nameInput.fill('Kaos Test Misafiri');

    const radioOptions = rsvpSection.locator('button[role="radio"]');
    if (await radioOptions.count() > 0) {
        await radioOptions.first().click();
    }

    const client = await context.newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024 / 8,
      uploadThroughput: 20 * 1024 / 8,
      latency: 500
    });

    const submitButton = rsvpSection.locator('button[type="submit"]');
    await submitButton.click();
  });
});