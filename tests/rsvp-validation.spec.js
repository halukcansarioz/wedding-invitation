import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('LCV Formu Validasyon ve Hata Yönetimi Testleri', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/');
    
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Zorunlu isim alanı boş bırakıldığında form gönderilmemeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    const submitButton = page.locator('.rsvp-card button[type="submit"]');
    
    await submitButton.click({ force: true });

    await expect(rsvpSection).toBeVisible();
  });
});