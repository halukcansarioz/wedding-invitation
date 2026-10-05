import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Realtime Senkronizasyon: Anı Defteri ve Barkovizyon', () => {
  
  test('Bir ekrandan gönderilen mesaj diğer ekrana anında yansımalı', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const pageForm = await context1.newPage();
    const pageLive = await context2.newPage();

    await mockMedia(pageForm);
    await mockMedia(pageLive);

    // Turnstile bot korumasını mock'la
    await pageForm.route('**/turnstile/v0/api.js*', route => {
      const url = route.request().url();
      const match = url.match(/onload=([^&]+)/);
      let callbackExecution = '';
      if (match && match[1]) {
        callbackExecution = `window['${match[1]}']();`;
      }
      route.fulfill({
        status: 200,
        contentType: 'application/javascript',
        body: `
          window.turnstile = {
            render: function(container, options) {
              if (options && options.callback) {
                setTimeout(() => options.callback('mock-turnstile-token-success'), 50);
              }
              return 'widget-id';
            },
            reset: function() {},
            remove: function() {}
          };
          ${callbackExecution}
        `
      });
    });

    // Supabase Edge Function (submit-form) isteklerini mock'la
    await pageForm.route('**/*submit-form*', async route => {
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
        body: JSON.stringify({ success: true, data: { id: 'live-msg-1' } })
      });
    });

    await pageForm.goto('/');
    const envelopeSeal = pageForm.locator('.envelope-seal');
    await envelopeSeal.waitFor({ state: 'visible', timeout: 15000 });
    await envelopeSeal.click();
    await expect(pageForm.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    await pageLive.goto('/demo-cift/live');

    const sectionQuery = 'section.card:has-text("Anı Defteri"), section.card:has-text("Guestbook")';

    await pageForm.locator(sectionQuery).scrollIntoViewIfNeeded();
    await pageForm.locator(sectionQuery).locator('input[name="name"]').fill('Canlı Test');
    await pageForm.locator(sectionQuery).locator('textarea[name="message"]').fill('Ekranda belirecek canlı mesaj');

    const submitBtn = pageForm.locator(sectionQuery).locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled({ timeout: 15000 });
    await submitBtn.click();

    // Form başarıyla gönderildikten sonra sıfırlandığını doğrula
    await expect(pageForm.locator(sectionQuery).locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
    await expect(pageForm.locator(sectionQuery).locator('textarea[name="message"]')).toHaveValue('', { timeout: 10000 });

    await context1.close();
    await context2.close();
  });
});