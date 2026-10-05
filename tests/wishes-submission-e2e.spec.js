import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Anı Defteri (Wishes) Gönderim Akışı', () => {
  
  test.beforeEach(async ({ page }) => {
    await mockMedia(page);
    
    // Cloudflare Turnstile script ve callback mekanizmasını eksiksiz mock'luyoruz
    await page.route('**/turnstile/v0/api.js*', route => {
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

    // Supabase Edge Function (submit-form) mocklaması
    await page.route('**/*submit-form*', async route => {
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
        body: JSON.stringify({ success: true, data: { id: 'mock-wish-1' } })
      });
    });

    await page.goto('/');
    const envelopeSeal = page.locator('.envelope-seal');
    await envelopeSeal.waitFor({ state: 'visible', timeout: 15000 });
    await envelopeSeal.click();
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atılmalı ve form sıfırlanmalı', async ({ page }) => {
    const wishesSection = page.locator('section').filter({ hasText: /Anı Defteri|Guestbook/i }).first();
    await wishesSection.scrollIntoViewIfNeeded();

    await wishesSection.locator('input[name="name"]').fill('E2E Test Kullanıcısı');
    await wishesSection.locator('textarea[name="message"]').fill('Playwright üzerinden gönderilen otomatik test mesajı.');

    const submitBtn = wishesSection.locator('button[type="submit"]');
    
    // Turnstile token otomatik üretileceği için buton anında aktifleşecektir
    await expect(submitBtn).toBeEnabled({ timeout: 15000 });

    const requestPromise = page.waitForRequest(req => req.url().includes('submit-form') && req.method() === 'POST', { timeout: 15000 });
    await submitBtn.click();
    const request = await requestPromise;

    const postData = JSON.parse(request.postData());
    expect(postData.type).toBe('wish');
    expect(postData.data.name).toBe('E2E Test Kullanıcısı');
    expect(postData.data.message).toBe('Playwright üzerinden gönderilen otomatik test mesajı.');

    await expect(wishesSection.locator('input[name="name"]')).toHaveValue('', { timeout: 10000 });
    await expect(wishesSection.locator('textarea[name="message"]')).toHaveValue('', { timeout: 10000 });
  });
});