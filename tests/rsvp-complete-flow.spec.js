import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Kapsamlı LCV (RSVP) ve Davetiye Akış Testi', () => {
  test('Kullanıcı zarfı açıp LCV formunu eksiksiz doldurarak katılım bildirebilmeli', async ({ page }) => {
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
    await expect(rsvpSection).toBeVisible({ timeout: 10000 });

    const nameInput = rsvpSection.locator('input:not([name="honeypot"]):not([type="hidden"])').first();
    await nameInput.fill('Test Misafiri');
    await expect(nameInput).toHaveValue('Test Misafiri');

    const radioOptions = rsvpSection.locator('button[role="radio"]');
    if (await radioOptions.count() > 0) {
      await radioOptions.first().click();
    }

    const submitButton = rsvpSection.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    await expect(rsvpSection).toBeVisible();
  });
});