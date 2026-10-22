import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('PWA Çevrimdışı (Offline) LCV Senkronizasyonu', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible({ timeout: 15000 });
    await expect(envelopeSeal).toBeEnabled({ timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('İnternet kesikken form IndexedDB ye kaydedilmeli ve beklemede (pending) kalmalı', async ({ page, context }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    const nameInput = rsvpSection.locator('input:not([name="honeypot"]):not([type="hidden"])').first();
    await nameInput.fill('Çevrimdışı Misafir');

    const radioOptions = rsvpSection.locator('button[role="radio"]');
    if (await radioOptions.count() > 0) {
        await radioOptions.first().click();
    }

    await context.setOffline(true);

    const submitButton = rsvpSection.locator('button[type="submit"]');
    await submitButton.click();

    await expect(nameInput).toHaveValue('');

    await context.setOffline(false);

    const submitRequest = await page.waitForRequest(
      request => request.url().includes('submit-form') && request.method() === 'POST',
      { timeout: 15000 }
    );
    
    const postData = JSON.parse(submitRequest.postData());
    expect(postData.turnstileToken).toBe('OFFLINE_SYNC');
    expect(postData.data.name).toBe('Çevrimdışı Misafir');
  });
});