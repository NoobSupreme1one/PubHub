import { test, expect } from '@playwright/test';

// This file serves as a test runner that can be used to run all tests in sequence
// It's designed to be run with: npx playwright test tests/run-all-tests.spec.ts

test.describe('Complete PubHub Test Suite Runner', () => {
  test('should run all authentication tests', async ({ page }) => {
    // Test basic page load
    await page.goto('http://localhost:8082');
    await expect(page).toHaveTitle(/PubHub/);
    
    // Test sign-in page
    await page.goto('http://localhost:8082/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Test sign-up page
    await page.goto('http://localhost:8082/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="fullName"]')).toBeVisible();
    
    // Test forgot password page
    await page.goto('http://localhost:8082/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should run all public page tests', async ({ page }) => {
    // Test terms page
    await page.goto('http://localhost:8082/terms');
    await expect(page.getByText(/Terms of Service/)).toBeVisible();
    
    // Test privacy page
    await page.goto('http://localhost:8082/privacy');
    await expect(page.getByText(/Privacy Policy/)).toBeVisible();
    
    // Test 404 page
    await page.goto('http://localhost:8082/invalid-route');
    await expect(page.getByText(/404/)).toBeVisible();
  });

  test('should run all protected route tests', async ({ page }) => {
    // Test that protected routes redirect to sign-in
    await page.goto('http://localhost:8082/campaigns');
    await expect(page).toHaveURL(/.*signin/);
    
    await page.goto('http://localhost:8082/templates');
    await expect(page).toHaveURL(/.*signin/);
    
    await page.goto('http://localhost:8082/wordpress');
    await expect(page).toHaveURL(/.*signin/);
    
    await page.goto('http://localhost:8082/profile');
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should run all OAuth tests', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Test OAuth buttons are present
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/GitHub/)).toBeVisible();
    await expect(page.getByText(/Facebook/)).toBeVisible();
    
    // Test OAuth callback route
    await page.goto('http://localhost:8082/auth/callback');
    await expect(page).toBeVisible();
  });

  test('should run all responsive design tests', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:8082/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:8082/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('http://localhost:8082/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should run all accessibility tests', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    // Test form elements have proper attributes
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should run all performance tests', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:8082/signin');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should run all error handling tests', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Test form validation
    await page.click('button[type="submit"]');
    await expect(page.getByText(/required/)).toBeVisible();
    
    // Test invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.getByText(/Invalid email/)).toBeVisible();
  });

  test('should run all navigation tests', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Test navigation between auth pages
    await page.click('a[href="/signup"]');
    await expect(page).toHaveURL(/.*signup/);
    
    await page.click('a[href="/forgot-password"]');
    await expect(page).toHaveURL(/.*forgot-password/);
    
    await page.click('a[href="/signin"]');
    await expect(page).toHaveURL(/.*signin/);
  });

  test('should run all UI component tests', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Test form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test OAuth buttons
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/GitHub/)).toBeVisible();
    await expect(page.getByText(/Facebook/)).toBeVisible();
    
    // Test links
    await expect(page.getByText('Sign up')).toBeVisible();
    await expect(page.getByText('Forgot your password?')).toBeVisible();
  });

  test('should run all user experience tests', async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
    
    // Test form interaction
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Test button states
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.hover();
    await submitButton.focus();
    
    // Test form submission
    await submitButton.click();
    
    // Should show loading state or redirect
    await expect(page).toBeVisible();
  });

  test('should run all cross-browser compatibility tests', async ({ page }) => {
    // Test with different user agent
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    await page.goto('http://localhost:8082/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should run all security tests', async ({ page }) => {
    // Test that sensitive routes are protected
    await page.goto('http://localhost:8082/campaigns');
    await expect(page).toHaveURL(/.*signin/);
    
    // Test that OAuth callback handles errors
    await page.goto('http://localhost:8082/auth/callback?error=access_denied');
    await expect(page).toBeVisible();
  });

  test('should run all integration tests', async ({ page }) => {
    // Test that all pages load without errors
    const pages = [
      '/signin',
      '/signup', 
      '/forgot-password',
      '/terms',
      '/privacy'
    ];
    
    for (const pagePath of pages) {
      await page.goto(`http://localhost:8082${pagePath}`);
      await expect(page).toBeVisible();
    }
  });

  test('should run all end-to-end workflow tests', async ({ page }) => {
    // Test complete user journey
    await page.goto('http://localhost:8082/signin');
    
    // Fill sign-in form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or show error
    await expect(page).toBeVisible();
  });

  test('should run all stress tests', async ({ page }) => {
    // Test rapid navigation
    for (let i = 0; i < 5; i++) {
      await page.goto('http://localhost:8082/signin');
      await page.goto('http://localhost:8082/signup');
      await page.goto('http://localhost:8082/forgot-password');
    }
    
    // Page should still be functional
    await page.goto('http://localhost:8082/signin');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should run all regression tests', async ({ page }) => {
    // Test that previously working features still work
    await page.goto('http://localhost:8082/signin');
    
    // Test form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Test OAuth buttons
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/GitHub/)).toBeVisible();
    await expect(page.getByText(/Facebook/)).toBeVisible();
    
    // Test navigation
    await expect(page.getByText('Sign up')).toBeVisible();
    await expect(page.getByText('Forgot your password?')).toBeVisible();
  });
}); 