import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

test.describe('Düğün Davetiyesi LCV (RSVP) Süreçleri', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  });

  test('Misafir LCV formunu başarıyla doldurabilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    await page.fill('.rsvp-card input[name="name"]', 'Playwright Test Misafiri');
    
    const noteField = rsvpSection.locator('textarea');
    if (await noteField.count() > 0) {
      await noteField.first().fill('Test otomasyonu ile gönderilen not.');
    }

    const submitButton = rsvpSection.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    await submitButton.click();
  });

  test('LCV formu boş gönderilmek istendiğinde doğrulama hataları (Zod) gösterilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const submitButton = rsvpSection.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    await submitButton.click();

    const errorMessage = rsvpSection.locator('text=/ad soyad|name/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 10000 });
  });
});