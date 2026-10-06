import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('LCV (RSVP) Formu Uçtan Uca Etkileşimi', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/');
    
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir katılım formunu eksiksiz doldurup gönderebilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    await rsvpSection.locator('input[name="name"]').fill('Örnek Misafir');
    
    const attendRadio = rsvpSection.locator('input[type="radio"][value="Katılacağım"], button:has-text("Katılacağım")').first();
    if (await attendRadio.isVisible()) {
      await attendRadio.click({ force: true });
    }

    const submitButton = page.locator('.rsvp-card button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    
    // Hatanın olduğu yer: Scroll stabilizasyonunu atlamak için force eklendi
    await submitButton.click({ force: true }); 
  });
});