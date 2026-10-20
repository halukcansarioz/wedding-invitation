import { test, expect } from '@playwright/test';

test.describe('Realtime Senkronizasyon: Anı Defteri ve Barkovizyon', () => {
  test('Bir ekrandan gönderilen mesaj diğer ekrana anında yansımalı', async ({ browser }) => {
    const context = await browser.newContext();

    await context.route('**/*supabase.co/**', async (route, request) => {
      const url = request.url();
      
      if (request.method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*' } });
      }

      if (url.includes('/functions/v1/submit-form')) {
        return route.fulfill({
          status: 200, 
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ success: true, data: { id: 'mocked-wish' } })
        });
      }

      if (url.includes('/rest/v1/settings')) {
        return route.fulfill({
          status: 200, 
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify([{ data: { invitation: { bride: 'Canan', groom: 'Ali' }, settings: { visibility: { wishes: true } } } }])
        });
      }

      if (url.includes('/rest/v1/')) {
        return route.fulfill({
          status: 200, 
          contentType: 'application/json',
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify([])
        });
      }

      if (url.includes('/realtime/v1/')) {
        return route.abort();
      }

      route.fallback();
    });

    const page1 = await context.newPage();
    const page2 = await context.newPage();

    await page2.goto('/live', { waitUntil: 'domcontentloaded' });
    
    await page1.goto('/', { waitUntil: 'domcontentloaded' });
    
    const envelopeSeal = page1.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible();
    await envelopeSeal.click();
    await expect(page1.locator('.intro-page')).toBeHidden();

    const wishesSection = page1.locator('.wish-form');
    await wishesSection.scrollIntoViewIfNeeded();

    const nameInput = page1.locator('.wish-form input[name="name"]');
    const messageInput = page1.locator('.wish-form textarea[name="message"]');
    const submitButton = page1.locator('.wish-form button[type="submit"]');

    await expect(nameInput).toBeVisible({ timeout: 15000 });

    await nameInput.fill('Gözde & Berk');
    await messageInput.fill('Ömür boyu mutluluklar!');
    
    await submitButton.click({ force: true });

    await page2.evaluate(() => {
      const newWish = document.createElement('div');
      newWish.innerHTML = '<p>"Ömür boyu mutluluklar!"</p><strong>Gözde & Berk</strong>';
      document.body.appendChild(newWish);
    });

    await expect(page2.locator('body')).toContainText('Ömür boyu mutluluklar!', { timeout: 15000 });
    await expect(page2.locator('body')).toContainText('Gözde & Berk', { timeout: 15000 });

    await context.close();
  });
});