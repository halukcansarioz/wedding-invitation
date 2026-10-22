import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('Anı Defteri (Wishes) Gönderim Akışı', () => {
  test.beforeEach(async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const envelopeSeal = page.locator('.envelope-seal');
    await envelopeSeal.click({ force: true });
    await expect(page.locator('.intro-page')).toBeHidden();
  });

  test('Kullanıcı başarılı bir şekilde anı mesajı gönderebilmeli', async ({ page }) => {
    const wishesForm = page.locator('form').filter({ has: page.locator('textarea[name="message"]') }).first();
    await wishesForm.scrollIntoViewIfNeeded();

    const nameInput = wishesForm.locator('input[name="name"]').first();
    await nameInput.fill('Playwright Test Kullanıcısı');

    const messageInput = wishesForm.locator('textarea[name="message"]').first();
    await messageInput.fill('Ömür boyu mutluluklar dilerim!');

    const submitRequestPromise = page.waitForRequest(req => req.url().includes('submit-form') && req.method() === 'POST');
    
    const submitButton = wishesForm.locator('button[type="submit"]');
    await submitButton.click();

    const request = await submitRequestPromise;
    const postData = JSON.parse(request.postData());

    expect(postData.data.name).toBe('Playwright Test Kullanıcısı');
    expect(postData.data.message || postData.data.text || postData.data.content).toBe('Ömür boyu mutluluklar dilerim!');

    await expect(messageInput).toHaveValue('');
  });
});