import { test, expect } from '@playwright/test';

const mockMedia = async (page) => {
  await page.route('**/*.{png,jpg,jpeg,webp,gif}', route => {
    route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') });
  });
  await page.route('**/*.{mp4,webm,ogg,mp3,wav}', route => {
    route.fulfill({ status: 200, contentType: 'application/octet-stream', body: '' });
  });
};

test.describe('İçerik ve Bölüm Görünürlük Testleri', () => {

  test.beforeEach(async ({ page }) => {
    await mockMedia(page); 
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click();
    
    await expect(page.locator('.intro-page')).not.toBeVisible({ timeout: 15000 });
  });

  test('Geri sayım aracı (Countdown) ekranda görünür olmalı', async ({ page }) => {
    const countdownSection = page.locator('.countdown-section');
    await countdownSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    
    const countBoxes = countdownSection.locator('.count-box');
    const finishedBox = countdownSection.locator('.countdown-finished-box');
    
    const isVisible = (await countBoxes.count() > 0) || (await finishedBox.count() > 0);
    expect(isVisible).toBeTruthy();
  });

  test('Bizim Hikayemiz bölümündeki zaman çizelgesi (Timeline) render edilmeli', async ({ page }) => {
    const storySection = page.locator('.story-card');
    await storySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    const storyTimeline = storySection.locator('.story-timeline-container');
    await expect(storyTimeline).toBeVisible({ timeout: 10000 });

    const storyNodes = storySection.locator('.story-node');
    expect(await storyNodes.count()).toBeGreaterThan(0);
  });

  test('Düğün Akışı (Schedule) ve Nikah (Ceremony) alanları yüklenmeli', async ({ page }) => {
    const ceremonySection = page.locator('.ceremony-card');
    await ceremonySection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await expect(ceremonySection).toBeVisible();

    const scheduleSection = page.locator('.schedule-card');
    await scheduleSection.scrollIntoViewIfNeeded();
    await expect(scheduleSection).toBeVisible();
  });
});