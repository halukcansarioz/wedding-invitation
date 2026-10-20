import { test, expect } from '@playwright/test';
// import { setupE2EMocks } from './utils'; // Projenizde varsa yorum satırını kaldırabilirsiniz

test.describe('Anı Defteri (Wishes) Gönderim Akışı', () => {

  test('Misafir sadece yazılı mesaj gönderdiğinde arka plana istek atmalı ve form sıfırlanmalı', async ({ page }) => {
    
    await page.route('**/functions/v1/submit-form', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          success: true, 
          data: { 
            id: 'mock-id', 
            name: 'Ahmet Yılmaz', 
            message: 'Tebrikler, çok mutlu olun!' 
          } 
        })
      });
    });

    await page.goto('/');

    const envelopeSeal = page.locator('.envelope-seal');
    await expect(envelopeSeal).toBeVisible();
    await envelopeSeal.click();

    const wishForm = page.locator('.wish-form');
    await wishForm.scrollIntoViewIfNeeded();

    const nameInput = wishForm.locator('input[name="name"]');
    const messageInput = wishForm.locator('textarea[name="message"]');
    const submitButton = wishForm.locator('button[type="submit"]');

    await expect(nameInput).toBeVisible();
    await nameInput.fill('Ahmet Yılmaz');
    await messageInput.fill('Tebrikler, çok mutlu olun!');

    await submitButton.click();

    await expect(nameInput).toHaveValue('', { timeout: 15000 });
    await expect(messageInput).toHaveValue('', { timeout: 15000 });
  });

});