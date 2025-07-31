import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8082');
  });

  test('should redirect unauthenticated users to sign-in page', async ({ page }) => {
    // Try to access a protected route
    await page.goto('http://localhost:8082/campaigns');
    
    // Should be redirected to sign-in page
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should show sign-in page with form elements', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Check for sign-in form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for OAuth buttons
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/GitHub/)).toBeVisible();
  });

  test('should show sign-up page with form elements', async ({ page }) => {
    await page.goto('http://localhost:8082/signup');
    
    // Check for sign-up form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check for OAuth buttons
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/GitHub/)).toBeVisible();
  });

  test('should navigate between auth pages', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Click on sign-up link
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/.*signup/);
    
    // Click on forgot password link
    await page.click('a[href="/forgot-password"]');
    await expect(page).toHaveURL(/.*forgot-password/);
  });

  test('should show loading state when checking authentication', async ({ page }) => {
    // Navigate to protected route
    await page.goto('http://localhost:8082/campaigns');
    
    // Should show loading spinner briefly
    await expect(page.locator('.animate-spin')).toBeVisible();
  });
}); 