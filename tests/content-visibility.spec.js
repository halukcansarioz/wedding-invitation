import { test, expect } from '@playwright/test';

test.describe('İçerik ve Bölüm Görünürlük Testleri', () => {

  test.beforeEach(async ({ page }) => {
    await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
    await expect(page.locator('.hero-section')).toBeAttached({ timeout: 15000 });
  });

  test('Geri sayım aracı (Countdown) ekranda görünür olmalı', async ({ page }) => {
    const countdownSection = page.locator('.countdown-section');
    await countdownSection.scrollIntoViewIfNeeded();
    
    // Geri sayım kutularının render edildiğini kontrol et (Gün, Saat, Dakika vb.)
    // Eğer süre dolmuşsa "Bugün En Mutlu Günümüz!" yazısı da çıkabilir, ikisinden birini bekliyoruz.
    const countBoxes = countdownSection.locator('.count-box');
    const finishedBox = countdownSection.locator('.countdown-finished-box');
    
    // Ya kutular vardır ya da bitiş ekranı gelmiştir (İkisi de geçerli senaryo)
    const isVisible = (await countBoxes.count() > 0) || (await finishedBox.count() > 0);
    expect(isVisible).toBeTruthy();
  });

  test('Bizim Hikayemiz bölümündeki zaman çizelgesi (Timeline) render edilmeli', async ({ page }) => {
    const storySection = page.locator('.story-card');
    await storySection.scrollIntoViewIfNeeded();

    // Zaman çizelgesinin ve içindeki düğümlerin (hikaye anıları) göründüğünü onayla
    const storyTimeline = storySection.locator('.story-timeline-container');
    await expect(storyTimeline).toBeVisible();

    const storyNodes = storySection.locator('.story-node');
    expect(await storyNodes.count()).toBeGreaterThan(0);
  });

  test('Düğün Akışı (Schedule) ve Nikah (Ceremony) alanları yüklenmeli', async ({ page }) => {
    const ceremonySection = page.locator('.ceremony-card');
    await ceremonySection.scrollIntoViewIfNeeded();
    await expect(ceremonySection).toBeVisible();
    await expect(ceremonySection.locator('.ceremony-item').first()).toBeVisible();

    const scheduleSection = page.locator('.schedule-card');
    await scheduleSection.scrollIntoViewIfNeeded();
    await expect(scheduleSection).toBeVisible();
    await expect(scheduleSection.locator('.schedule-item').first()).toBeVisible();
  });
});