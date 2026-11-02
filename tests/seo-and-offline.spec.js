import { test, expect } from '@playwright/test';
import { setupE2EMocks } from './utils';

test.describe('SEO ve offline fallback', () => {
  test('Davet sayfası canonical ve etkinlik structured data metadata içermeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /.+/);
    const structuredData = page.locator('script[type="application/ld+json"]');
    await expect(structuredData).toHaveCount(1);

    const eventData = JSON.parse(await structuredData.textContent());
    expect(eventData['@context']).toBe('https://schema.org');
    expect(eventData['@type']).toBe('Event');
    expect(eventData.name).toBeTruthy();
  });

  test('Offline fallback sayfası tekrar dene kontrolü göstermeli', async ({ page }) => {
    await page.goto('/offline.html', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/Çevrimdışısınız/i);
    await expect(page.getByRole('heading', { name: /çevrimdışısınız/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tekrar dene/i })).toBeVisible();
  });

  test('Robots ve sitemap dosyaları yayınlanmalı', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBeTruthy();
    expect(await robots.text()).toContain('Sitemap:');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain('<urlset');
  });
});
