import { test, expect } from '@playwright/test';

test.describe('OAuth Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8082/signin');
  });

  test('should show OAuth buttons on sign-in page', async ({ page }) => {
    // Check all OAuth buttons are present
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/GitHub/)).toBeVisible();
    await expect(page.getByText(/Facebook/)).toBeVisible();
  });

  test('should show OAuth buttons on sign-up page', async ({ page }) => {
    await page.goto('http://localhost:8082/signup');
    
    // Check all OAuth buttons are present
    await expect(page.getByText(/Google/)).toBeVisible();
    await expect(page.getByText(/GitHub/)).toBeVisible();
    await expect(page.getByText(/Facebook/)).toBeVisible();
  });

  test('should handle Google OAuth button click', async ({ page }) => {
    // Click Google OAuth button
    await page.click('button:has-text("Google")');
    
    // Should redirect to OAuth provider or show loading state
    // Note: In a real test environment, you'd mock the OAuth flow
    await expect(page).toHaveURL(/.*auth.*/);
  });

  test('should handle GitHub OAuth button click', async ({ page }) => {
    // Click GitHub OAuth button
    await page.click('button:has-text("GitHub")');
    
    // Should redirect to OAuth provider or show loading state
    await expect(page).toHaveURL(/.*auth.*/);
  });

  test('should handle Facebook OAuth button click', async ({ page }) => {
    // Click Facebook OAuth button
    await page.click('button:has-text("Facebook")');
    
    // Should redirect to OAuth provider or show loading state
    await expect(page).toHaveURL(/.*auth.*/);
  });

  test('should show loading state during OAuth process', async ({ page }) => {
    // Click any OAuth button
    await page.click('button:has-text("Google")');
    
    // Should show loading spinner
    await expect(page.locator('.animate-spin')).toBeVisible();
  });

  test('should handle OAuth callback successfully', async ({ page }) => {
    // Simulate OAuth callback
    await page.goto('http://localhost:8082/auth/callback?code=test-code&state=test-state');
    
    // Should show success message or redirect to dashboard
    await expect(page.getByText(/Success/)).toBeVisible();
  });

  test('should handle OAuth callback with error', async ({ page }) => {
    // Simulate OAuth callback with error
    await page.goto('http://localhost:8082/auth/callback?error=access_denied');
    
    // Should show error message
    await expect(page.getByText(/Error/)).toBeVisible();
  });

  test('should handle OAuth callback with invalid parameters', async ({ page }) => {
    // Simulate OAuth callback with invalid parameters
    await page.goto('http://localhost:8082/auth/callback?invalid=param');
    
    // Should show error message
    await expect(page.getByText(/Error/)).toBeVisible();
  });

  test('should redirect to intended page after OAuth sign-in', async ({ page }) => {
    // Try to access protected page first
    await page.goto('http://localhost:8082/campaigns');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/.*signin/);
    
    // Complete OAuth sign-in (simulated)
    await page.goto('http://localhost:8082/auth/callback?code=test-code');
    
    // Should redirect back to campaigns page
    await expect(page).toHaveURL(/.*campaigns/);
  });
}); 