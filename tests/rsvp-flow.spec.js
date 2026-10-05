import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('LCV (RSVP) Formu Uçtan Uca Etkileşimi', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    
    // RSVP formunun butonunu aktif etmek için Turnstile mock'u
    await page.addInitScript(() => {
      window.turnstile = {
        render: (container, options) => {
          if (options && options.callback) options.callback('mock-turnstile-token');
          return 'mock-id';
        },
        reset: () => {}
      };
    });
    await page.route('**/turnstile/v0/api.js*', route => route.fulfill({ status: 200, body: '' }));
    
    await page.route('**/functions/v1/submit-form', async route => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': '*'
          }
        });
        return;
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, data: { id: 'mock-id' } })
      });
    });

    await page.goto('/');
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await page.waitForTimeout(1000);
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir katılım formunu eksiksiz doldurup gönderebilmeli', async ({ page }) => {
    const rsvpSection = page.locator('.rsvp-card');
    await rsvpSection.scrollIntoViewIfNeeded();

    await page.locator('.rsvp-card input[name="name"]').fill('Playwright Test Misafiri');
    
    const phoneInput = page.locator('.rsvp-card input[name="phone"]');
    if (await phoneInput.count() > 0) {
        await phoneInput.fill('0555 555 5555');
    }

    const optionGroups = page.locator('.rsvp-card .option-group');
    if (await optionGroups.count() >= 3) {
        await optionGroups.nth(0).locator('button').nth(1).click();
        await optionGroups.nth(1).locator('button').nth(0).click();
        await optionGroups.nth(2).locator('button').nth(1).click();
    }

    const songInput = page.locator('.rsvp-card input[name="songRequest"]');
    if (songInput && await songInput.count() > 0) {
        await songInput.fill("Ankara'nın Bağları");
    }

    const noteInput = page.locator('.rsvp-card textarea[name="note"]');
    if (noteInput && await noteInput.count() > 0) {
        await noteInput.fill('Heyecanla bekliyoruz!');
    }

    const submitButton = page.locator('.rsvp-card button[type="submit"]');
    await submitButton.scrollIntoViewIfNeeded();
    
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    await submitButton.click();

    await page.waitForTimeout(2000);
  });
});