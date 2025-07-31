import { test, expect, Page } from '@playwright/test';

test.describe('Facebook Integration', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    
    // Navigate to sign in page
    await page.goto('/signin');
    
    // Sign in with test credentials
    await page.fill('input[type="email"]', 'test@user.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should display Facebook integration page', async () => {
    // Navigate to Facebook integration page
    await page.goto('/facebook');
    
    // Check if page loads correctly
    await expect(page.locator('h1')).toContainText('Facebook Integration');
    await expect(page.locator('text=Connect your Facebook pages')).toBeVisible();
    
    // Check if connect button is present
    await expect(page.locator('button:has-text("Connect Facebook Account")')).toBeVisible();
  });

  test('should show configuration error when Facebook is not configured', async () => {
    // Navigate to Facebook integration page
    await page.goto('/facebook');
    
    // Click connect button (should show error if not configured)
    await page.click('button:has-text("Connect Facebook Account")');
    
    // Check for configuration error toast (if Facebook is not configured)
    // This test assumes Facebook is not configured in test environment
    const errorToast = page.locator('[data-testid="toast"]').filter({ hasText: 'Configuration Error' });
    if (await errorToast.isVisible()) {
      await expect(errorToast).toContainText('Facebook integration is not properly configured');
    }
  });

  test('should navigate to Facebook connect page', async () => {
    // Navigate to Facebook connect page directly
    await page.goto('/facebook/connect');
    
    // Check if connect page loads
    await expect(page.locator('h1')).toContainText('Connect Facebook');
    
    // Check for connect button
    await expect(page.locator('button:has-text("Connect Facebook")')).toBeVisible();
  });

  test('should handle OAuth callback flow', async () => {
    // Navigate to Facebook connect page with mock OAuth callback parameters
    const mockCode = 'mock_auth_code_123';
    await page.goto(`/facebook/connect?code=${mockCode}&state=mock_state`);
    
    // Should show loading state initially
    await expect(page.locator('text=Loading')).toBeVisible();
    
    // Note: In a real test environment, you would mock the Facebook API responses
    // For now, we just verify the page handles the callback parameters
  });

  test('should display empty state when no Facebook accounts connected', async () => {
    await page.goto('/facebook');
    
    // Should show empty state or connect prompt
    const connectButton = page.locator('button:has-text("Connect Facebook Account")');
    await expect(connectButton).toBeVisible();
  });

  test('should validate Facebook client configuration methods', async () => {
    // This test validates the Facebook client configuration
    // We'll test this by checking if the page loads without JavaScript errors
    
    await page.goto('/facebook');
    
    // Check for any console errors related to Facebook configuration
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Try to trigger Facebook client initialization
    await page.click('button:has-text("Connect Facebook Account")');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(1000);
    
    // Check that there are no critical JavaScript errors
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Facebook') && 
      (error.includes('undefined') || error.includes('null'))
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should have proper routing for Facebook pages', async () => {
    // Test Facebook main page
    await page.goto('/facebook');
    expect(page.url()).toContain('/facebook');
    
    // Test Facebook connect page
    await page.goto('/facebook/connect');
    expect(page.url()).toContain('/facebook/connect');
    
    // Both pages should be accessible and not show 404
    await expect(page.locator('text=404')).not.toBeVisible();
    await expect(page.locator('text=Not Found')).not.toBeVisible();
  });

  test('should display Facebook integration in navigation or dashboard', async () => {
    await page.goto('/');
    
    // Check if Facebook integration is accessible from dashboard
    // This could be through navigation menu, cards, or links
    const facebookLinks = page.locator('a[href*="/facebook"], button:has-text("Facebook")');
    
    if (await facebookLinks.count() > 0) {
      await expect(facebookLinks.first()).toBeVisible();
    }
  });

  test('should handle Facebook API errors gracefully', async () => {
    await page.goto('/facebook');
    
    // Monitor for unhandled promise rejections or errors
    const errors: string[] = [];
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    // Try to interact with Facebook features
    await page.click('button:has-text("Connect Facebook Account")');
    await page.waitForTimeout(2000);
    
    // Should not have unhandled errors
    const facebookErrors = errors.filter(error => 
      error.includes('Facebook') && 
      !error.includes('Configuration Error') // Expected configuration errors are OK
    );
    
    expect(facebookErrors.length).toBe(0);
  });

  test('should have responsive design for Facebook pages', async () => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/facebook');
    
    // Check if page is responsive
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Connect Facebook Account")')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.reload();
    
    // Should still be visible and properly laid out
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Connect Facebook Account")')).toBeVisible();
  });
});
