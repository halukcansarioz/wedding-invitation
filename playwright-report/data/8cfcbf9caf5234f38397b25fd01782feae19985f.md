# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: content-visibility.spec.js >> İçerik ve Bölüm Görünürlük Testleri >> Bizim Hikayemiz bölümündeki zaman çizelgesi (Timeline) render edilmeli
- Location: tests\content-visibility.spec.js:31:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: expect(locator).toBeHidden() failed

Locator:  locator('.intro-page')
Expected: hidden
Received: visible

Call log:
  - Expect "toBeHidden" with timeout 15000ms
  - waiting for locator('.intro-page')
    7 × locator resolved to <section class="intro-page opening">…</section>
      - unexpected value "visible"
  - Protocol error (Runtime.callFunctionOn): Internal server error, session closed.

```

```yaml
- paragraph: Wedding Invitation
- heading "Handenur & Haluk Can" [level=1]:
  - text: Handenur
  - emphasis: "&"
  - text: Haluk Can
- paragraph: You are invited to the most special day of our love story.
- button "Open Invitation"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('İçerik ve Bölüm Görünürlük Testleri', () => {
  4  | 
  5  |   test.beforeEach(async ({ page }) => {
  6  |     await page.route('**/*.{png,jpg,jpeg,webp,mp4}', route => route.abort());
  7  |     await page.goto('/');
  8  | 
  9  |     const envelopeSeal = page.locator('.envelope-seal');
  10 |     await expect(envelopeSeal).not.toContainText(/Yükleniyor|Loading/i, { timeout: 15000 });
  11 |     await envelopeSeal.click({ force: true });
  12 |     
> 13 |     await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
     |                                               ^ Error: expect(locator).toBeHidden() failed
  14 |     await expect(page.locator('.hero-section')).toBeAttached({ timeout: 15000 });
  15 |   });
  16 | 
  17 |   test('Geri sayım aracı (Countdown) ekranda görünür olmalı', async ({ page }) => {
  18 |     const countdownSection = page.locator('.countdown-section');
  19 |     await countdownSection.scrollIntoViewIfNeeded();
  20 |     
  21 |     // Geri sayım kutularının render edildiğini kontrol et (Gün, Saat, Dakika vb.)
  22 |     // Eğer süre dolmuşsa "Bugün En Mutlu Günümüz!" yazısı da çıkabilir, ikisinden birini bekliyoruz.
  23 |     const countBoxes = countdownSection.locator('.count-box');
  24 |     const finishedBox = countdownSection.locator('.countdown-finished-box');
  25 |     
  26 |     // Ya kutular vardır ya da bitiş ekranı gelmiştir (İkisi de geçerli senaryo)
  27 |     const isVisible = (await countBoxes.count() > 0) || (await finishedBox.count() > 0);
  28 |     expect(isVisible).toBeTruthy();
  29 |   });
  30 | 
  31 |   test('Bizim Hikayemiz bölümündeki zaman çizelgesi (Timeline) render edilmeli', async ({ page }) => {
  32 |     const storySection = page.locator('.story-card');
  33 |     await storySection.scrollIntoViewIfNeeded();
  34 | 
  35 |     // Zaman çizelgesinin ve içindeki düğümlerin (hikaye anıları) göründüğünü onayla
  36 |     const storyTimeline = storySection.locator('.story-timeline-container');
  37 |     await expect(storyTimeline).toBeVisible();
  38 | 
  39 |     const storyNodes = storySection.locator('.story-node');
  40 |     expect(await storyNodes.count()).toBeGreaterThan(0);
  41 |   });
  42 | 
  43 |   test('Düğün Akışı (Schedule) ve Nikah (Ceremony) alanları yüklenmeli', async ({ page }) => {
  44 |     const ceremonySection = page.locator('.ceremony-card');
  45 |     await ceremonySection.scrollIntoViewIfNeeded();
  46 |     await expect(ceremonySection).toBeVisible();
  47 |     await expect(ceremonySection.locator('.ceremony-item').first()).toBeVisible();
  48 | 
  49 |     const scheduleSection = page.locator('.schedule-card');
  50 |     await scheduleSection.scrollIntoViewIfNeeded();
  51 |     await expect(scheduleSection).toBeVisible();
  52 |     await expect(scheduleSection.locator('.schedule-item').first()).toBeVisible();
  53 |   });
  54 | });
```