import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupE2EMocks } from './utils';

test.describe('Erişilebilirlik Testleri', () => {
  test('Ana sayfa kritik erişilebilirlik ihlalleri içermemeli', async ({ page }) => {
    await setupE2EMocks(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .include('#root')
      .disableRules(['color-contrast'])
      .analyze();
      
    const criticalViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical'
    );
    
    expect(criticalViolations).toEqual([]);
  });
});