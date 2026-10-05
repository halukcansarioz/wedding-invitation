import { test, expect } from '@playwright/test';

test.describe('Canlı Barkovizyon (Live Projector) Testleri', () => {
  test('Barkovizyon sayfası çökmeden açılmalı ve arkaplan siyah olmalı', async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,gif,mp4,webm,ogg,mp3,wav}', r => r.fulfill({ status: 200, body: '' }));
    
    await page.goto('/live', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    const liveSubtitle = page.locator('text=/Canlı Anı Akışı|Live Memories/i');
    await expect(liveSubtitle).toBeVisible({ timeout: 15000 });
    
    const titleElement = page.locator('h1');
    await expect(titleElement).toBeVisible();
    
    // ÇÖZÜM: dataset.theme kaldırıldı, kapsayıcı div "p" etiketi üzerinden bulunarak arka planı test edildi
    const mainContainer = page.locator('p', { hasText: /Canlı Anı Akışı|Live Memories/i }).locator('..');
    await expect(mainContainer).toHaveCSS('background-color', 'rgb(10, 10, 10)');
  });
});