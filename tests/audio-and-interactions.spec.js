import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Sesli Mesaj ve Etkileşim Testleri', () => {
  
  test.beforeEach(async ({ page }) => {
    // ÇÖZÜM: CI ortamında mikrofon donanımı olmasa bile getUserMedia ve MediaRecorder'ı garantili olarak simüle et
    await page.addInitScript(() => {
      // 1. Mikrofon akışını (getUserMedia) simüle et
      if (!navigator.mediaDevices) {
        navigator.mediaDevices = {};
      }
      navigator.mediaDevices.getUserMedia = async () => {
        return {
          getTracks: () => [{ stop: () => {} }]
        };
      };

      // 2. MediaRecorder API'sini simüle et
      window.MediaRecorder = class MockMediaRecorder {
        constructor(stream, options) {
          this.stream = stream;
          this.options = options;
          this.state = 'inactive';
          this.ondataavailable = null;
          this.onstop = null;
        }
        static isTypeSupported() {
          return true;
        }
        start() {
          this.state = 'recording';
          if (this.ondataavailable) {
            this.ondataavailable({ data: new Blob(['mock-audio'], { type: 'audio/webm' }) });
          }
        }
        stop() {
          this.state = 'inactive';
          if (this.onstop) {
            this.onstop();
          }
        }
      };
    });

    await setupE2EMocks(page);
    await page.goto('/');
    
    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).not.toContainText(/Yükleniyor/i, { timeout: 15000 });
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden({ timeout: 15000 });
  });

  test('Anı defterinde ses kaydetme (Record/Stop) butonları doğru çalışmalı', async ({ page }) => {
    // Anı defteri (Wishes) bölümüne kaydır
    const wishesSection = page.locator('.wishes-card, section').filter({ hasText: /Anı Defteri|Guestbook|Dilek/i }).first();
    await wishesSection.scrollIntoViewIfNeeded();

    // Kayıt başlatma butonunu bul ve tıkla
    const recordButton = page.locator('button', { hasText: /Sesli|Record|🎤|Kayıt/i }).first();
    await expect(recordButton).toBeVisible({ timeout: 10000 });
    await recordButton.click({ force: true });

    // Kaydın başlamasını bekle ve Durdur butonunu bul
    const stopButton = page.locator('button', { hasText: /Durdur|Stop|⏹/i }).first();
    await expect(stopButton).toBeVisible({ timeout: 10000 });
    
    // Kaydı durdur
    await stopButton.click({ force: true });
  });
});