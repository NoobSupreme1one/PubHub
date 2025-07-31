import { test, expect } from '@playwright/test';

test('simple test', async ({ page }) => {
  await page.goto('http://localhost:8082');
  await expect(page).toHaveTitle(/PubHub/);
}); 