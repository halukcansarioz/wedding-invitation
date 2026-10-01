import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

test.describe('Canlı Barkovizyon (Live Projector) Testleri', () => {
  test('Barkovizyon sayfası çökmeden açılmalı ve Dark Mode aktif olmalı', async ({ page }) => {
    await mockMedia(page);
    await page.goto('/live');
    
    const liveSubtitle = page.locator('text=/Canlı Anı Akışı|Live Memories/i');
    await expect(liveSubtitle).toBeVisible({ timeout: 15000 });
    
    const titleElement = page.locator('h1');
    await expect(titleElement).toBeVisible();
    
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark');
  });
});