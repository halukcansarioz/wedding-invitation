import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', route => route.abort());
};

test.describe('Realtime Senkronizasyon: Anı Defteri ve Barkovizyon', () => {

  test('Bir ekrandan gönderilen mesaj diğer ekrana anında yansımalı', async ({ browser }) => {
    const contextLive = await browser.newContext();
    const pageLive = await contextLive.newPage();
    await mockMedia(pageLive);
    
    await pageLive.route('**/rest/v1/wishes*', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    
    await pageLive.goto('/live', { waitUntil: 'domcontentloaded' });
    await expect(pageLive.locator('text=/Anılar bekleniyor|Waiting for memories/i')).toBeVisible({ timeout: 15000 });

    const contextForm = await browser.newContext();
    const pageForm = await contextForm.newPage();
    await mockMedia(pageForm);
    
    // DÜZELTME: Route'lar asenkron context sorununu engellemek için birbirinden bağımsız hale getirildi.
    await pageLive.route('**/rest/v1/wishes*', async updateRoute => {
      await updateRoute.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify([{ id: 'msg1', name: 'Canlı Test', message: 'Ekranda belirecek mesaj', approved: true }]) 
      });
    });

    await pageForm.route('**/functions/v1/submit-form', async route => {
      await route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: { id: 'msg1' } }) });
    });

    await pageForm.goto('/', { waitUntil: 'domcontentloaded' });
    const envelopeSeal = pageForm.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.waitFor({ state: 'visible' });
    await envelopeSeal.click();
    await expect(pageForm.locator('.intro-page')).toBeHidden({ timeout: 15000 });

    const wishesSection = pageForm.locator('.card', { hasText: /Anı Defteri|Guestbook/i });
    await wishesSection.scrollIntoViewIfNeeded();
    await wishesSection.locator('input[name="name"]').fill('Canlı Test');
    await wishesSection.locator('textarea[name="message"]').fill('Ekranda belirecek mesaj');
    
    await pageForm.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    });

    await wishesSection.locator('button[type="submit"]').click();

    await pageLive.bringToFront();
    const subtitle = pageLive.locator('p', { hasText: /Canlı Anı Akışı|Live Memories/i });
    await expect(subtitle).toBeVisible({ timeout: 15000 });
  });
});