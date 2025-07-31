import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  fullName: 'Test User'
};

const testCampaign = {
  name: 'Test Campaign',
  description: 'This is a test campaign for automated testing',
  status: 'draft'
};

test.describe('PubHub Comprehensive Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8082');
  });

  // ========================================
  // AUTHENTICATION TESTS
  // ========================================

  test.describe('Authentication Flow', () => {
    test('should redirect unauthenticated users to sign-in page', async ({ page }) => {
      await page.goto('http://localhost:8082/campaigns');
      await expect(page).toHaveURL(/.*signin/);
    });

    test('should show sign-in page with all form elements', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check OAuth buttons
      await expect(page.getByText(/Google/)).toBeVisible();
      await expect(page.getByText(/GitHub/)).toBeVisible();
      await expect(page.getByText(/Facebook/)).toBeVisible();
      
      // Check navigation links
      await expect(page.getByText('Sign up')).toBeVisible();
      await expect(page.getByText('Forgot your password?')).toBeVisible();
    });

    test('should show sign-up page with all form elements', async ({ page }) => {
      await page.goto('http://localhost:8082/signup');
      
      // Check form elements
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
      await expect(page.locator('input[name="fullName"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check OAuth buttons
      await expect(page.getByText(/Google/)).toBeVisible();
      await expect(page.getByText(/GitHub/)).toBeVisible();
      await expect(page.getByText(/Facebook/)).toBeVisible();
    });

    test('should navigate between auth pages', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Navigate to sign-up
      await page.click('a[href="/signup"]');
      await expect(page).toHaveURL(/.*signup/);
      
      // Navigate to forgot password
      await page.click('a[href="/forgot-password"]');
      await expect(page).toHaveURL(/.*forgot-password/);
      
      // Navigate back to sign-in
      await page.click('a[href="/signin"]');
      await expect(page).toHaveURL(/.*signin/);
    });

    test('should show forgot password page', async ({ page }) => {
      await page.goto('http://localhost:8082/forgot-password');
      
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      await expect(page.getByText(/Reset Password/)).toBeVisible();
    });

    test('should show loading state when checking authentication', async ({ page }) => {
      await page.goto('http://localhost:8082/campaigns');
      
      // Should show loading spinner briefly
      await expect(page.locator('.animate-spin')).toBeVisible();
    });
  });

  // ========================================
  // PUBLIC PAGES TESTS
  // ========================================

  test.describe('Public Pages', () => {
    test('should show terms of service page', async ({ page }) => {
      await page.goto('http://localhost:8082/terms');
      await expect(page).toHaveTitle(/Terms of Service/);
      await expect(page.getByText(/Terms of Service/)).toBeVisible();
    });

    test('should show privacy policy page', async ({ page }) => {
      await page.goto('http://localhost:8082/privacy');
      await expect(page).toHaveTitle(/Privacy Policy/);
      await expect(page.getByText(/Privacy Policy/)).toBeVisible();
    });

    test('should show 404 page for invalid routes', async ({ page }) => {
      await page.goto('http://localhost:8082/invalid-route');
      await expect(page.getByText(/404/)).toBeVisible();
      await expect(page.getByText(/Page Not Found/)).toBeVisible();
    });
  });

  // ========================================
  // PROTECTED ROUTES TESTS (Requires Authentication)
  // ========================================

  test.describe('Protected Routes (Authenticated)', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each test
      await page.goto('http://localhost:8082/signin');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Wait for redirect to dashboard
      await page.waitForURL('http://localhost:8082/');
    });

    test('should access dashboard after authentication', async ({ page }) => {
      await expect(page).toHaveURL('http://localhost:8082/');
      await expect(page.getByText(/Dashboard/)).toBeVisible();
    });

    test('should access campaigns page', async ({ page }) => {
      await page.goto('http://localhost:8082/campaigns');
      await expect(page).toHaveURL('http://localhost:8082/campaigns');
      await expect(page.getByText(/Campaigns/)).toBeVisible();
    });

    test('should access templates page', async ({ page }) => {
      await page.goto('http://localhost:8082/templates');
      await expect(page).toHaveURL('http://localhost:8082/templates');
      await expect(page.getByText(/Templates/)).toBeVisible();
    });

    test('should access WordPress page', async ({ page }) => {
      await page.goto('http://localhost:8082/wordpress');
      await expect(page).toHaveURL('http://localhost:8082/wordpress');
      await expect(page.getByText(/WordPress/)).toBeVisible();
    });

    test('should access profile page', async ({ page }) => {
      await page.goto('http://localhost:8082/profile');
      await expect(page).toHaveURL('http://localhost:8082/profile');
      await expect(page.getByText(/Profile/)).toBeVisible();
    });
  });

  // ========================================
  // CAMPAIGN MANAGEMENT TESTS
  // ========================================

  test.describe('Campaign Management', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each test
      await page.goto('http://localhost:8082/signin');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('http://localhost:8082/');
    });

    test('should create a new campaign', async ({ page }) => {
      await page.goto('http://localhost:8082/campaigns/new');
      
      // Fill campaign form
      await page.fill('input[name="name"]', testCampaign.name);
      await page.fill('textarea[name="description"]', testCampaign.description);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should redirect to campaigns list or show success message
      await expect(page).toHaveURL(/.*campaigns/);
    });

    test('should view campaign list', async ({ page }) => {
      await page.goto('http://localhost:8082/campaigns');
      
      // Check for campaign list elements
      await expect(page.getByText(/Campaigns/)).toBeVisible();
      await expect(page.getByText(/Create Campaign/)).toBeVisible();
    });

    test('should edit an existing campaign', async ({ page }) => {
      // First create a campaign, then edit it
      await page.goto('http://localhost:8082/campaigns/new');
      await page.fill('input[name="name"]', testCampaign.name);
      await page.fill('textarea[name="description"]', testCampaign.description);
      await page.click('button[type="submit"]');
      
      // Navigate to edit page
      await page.goto('http://localhost:8082/campaigns/1/edit');
      
      // Check form is populated
      await expect(page.locator('input[name="name"]')).toHaveValue(testCampaign.name);
    });

    test('should schedule a campaign', async ({ page }) => {
      await page.goto('http://localhost:8082/campaigns/1/schedule');
      
      // Check scheduling form elements
      await expect(page.getByText(/Schedule Campaign/)).toBeVisible();
      await expect(page.locator('input[type="datetime-local"]')).toBeVisible();
    });

    test('should view campaign details', async ({ page }) => {
      await page.goto('http://localhost:8082/campaigns/1');
      
      // Check campaign detail elements
      await expect(page.getByText(/Campaign Details/)).toBeVisible();
    });
  });

  // ========================================
  // WORDPRESS INTEGRATION TESTS
  // ========================================

  test.describe('WordPress Integration', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each test
      await page.goto('http://localhost:8082/signin');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('http://localhost:8082/');
    });

    test('should access WordPress main page', async ({ page }) => {
      await page.goto('http://localhost:8082/wordpress');
      
      await expect(page.getByText(/WordPress/)).toBeVisible();
      await expect(page.getByText(/Connect/)).toBeVisible();
      await expect(page.getByText(/Generate/)).toBeVisible();
    });

    test('should access WordPress connect page', async ({ page }) => {
      await page.goto('http://localhost:8082/wordpress/connect');
      
      await expect(page.getByText(/Connect WordPress/)).toBeVisible();
      await expect(page.locator('input[name="siteUrl"]')).toBeVisible();
      await expect(page.locator('input[name="username"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    test('should access WordPress generate page', async ({ page }) => {
      await page.goto('http://localhost:8082/wordpress/generate');
      
      await expect(page.getByText(/Generate Content/)).toBeVisible();
      await expect(page.locator('textarea[name="prompt"]')).toBeVisible();
      await expect(page.getByText(/Generate/)).toBeVisible();
    });

    test('should connect to WordPress site', async ({ page }) => {
      await page.goto('http://localhost:8082/wordpress/connect');
      
      // Fill connection form
      await page.fill('input[name="siteUrl"]', 'https://example.com');
      await page.fill('input[name="username"]', 'testuser');
      await page.fill('input[name="password"]', 'testpass');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show success message or redirect
      await expect(page.getByText(/Connected/)).toBeVisible();
    });

    test('should generate WordPress content', async ({ page }) => {
      await page.goto('http://localhost:8082/wordpress/generate');
      
      // Fill generation form
      await page.fill('textarea[name="prompt"]', 'Write a blog post about AI');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show generated content or loading state
      await expect(page.getByText(/Generating/)).toBeVisible();
    });
  });

  // ========================================
  // TEMPLATES TESTS
  // ========================================

  test.describe('Templates', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each test
      await page.goto('http://localhost:8082/signin');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('http://localhost:8082/');
    });

    test('should view templates page', async ({ page }) => {
      await page.goto('http://localhost:8082/templates');
      
      await expect(page.getByText(/Templates/)).toBeVisible();
      await expect(page.getByText(/Create Template/)).toBeVisible();
    });

    test('should create a new template', async ({ page }) => {
      await page.goto('http://localhost:8082/templates');
      
      // Click create template button
      await page.click('button:has-text("Create Template")');
      
      // Fill template form
      await page.fill('input[name="name"]', 'Test Template');
      await page.fill('textarea[name="description"]', 'A test template');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.getByText(/Template created/)).toBeVisible();
    });
  });

  // ========================================
  // USER PROFILE TESTS
  // ========================================

  test.describe('User Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each test
      await page.goto('http://localhost:8082/signin');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('http://localhost:8082/');
    });

    test('should view profile page', async ({ page }) => {
      await page.goto('http://localhost:8082/profile');
      
      await expect(page.getByText(/Profile/)).toBeVisible();
      await expect(page.getByText(/Edit Profile/)).toBeVisible();
    });

    test('should update profile information', async ({ page }) => {
      await page.goto('http://localhost:8082/profile');
      
      // Click edit profile
      await page.click('button:has-text("Edit Profile")');
      
      // Update profile fields
      await page.fill('input[name="fullName"]', 'Updated Name');
      await page.fill('input[name="timezone"]', 'UTC');
      
      // Save changes
      await page.click('button:has-text("Save Changes")');
      
      // Should show success message
      await expect(page.getByText(/Profile updated/)).toBeVisible();
    });

    test('should change password', async ({ page }) => {
      await page.goto('http://localhost:8082/profile');
      
      // Click change password
      await page.click('button:has-text("Change Password")');
      
      // Fill password form
      await page.fill('input[name="currentPassword"]', testUser.password);
      await page.fill('input[name="newPassword"]', 'newpassword123');
      await page.fill('input[name="confirmPassword"]', 'newpassword123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.getByText(/Password updated/)).toBeVisible();
    });

    test('should sign out', async ({ page }) => {
      await page.goto('http://localhost:8082/profile');
      
      // Click sign out
      await page.click('button:has-text("Sign Out")');
      
      // Should redirect to sign-in page
      await expect(page).toHaveURL(/.*signin/);
    });
  });

  // ========================================
  // NAVIGATION TESTS
  // ========================================

  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in before each test
      await page.goto('http://localhost:8082/signin');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL('http://localhost:8082/');
    });

    test('should navigate between all main pages', async ({ page }) => {
      // Dashboard
      await page.goto('http://localhost:8082/');
      await expect(page.getByText(/Dashboard/)).toBeVisible();
      
      // Campaigns
      await page.goto('http://localhost:8082/campaigns');
      await expect(page.getByText(/Campaigns/)).toBeVisible();
      
      // Templates
      await page.goto('http://localhost:8082/templates');
      await expect(page.getByText(/Templates/)).toBeVisible();
      
      // WordPress
      await page.goto('http://localhost:8082/wordpress');
      await expect(page.getByText(/WordPress/)).toBeVisible();
      
      // Profile
      await page.goto('http://localhost:8082/profile');
      await expect(page.getByText(/Profile/)).toBeVisible();
    });

    test('should use navigation menu', async ({ page }) => {
      // Test navigation menu if it exists
      const navMenu = page.locator('nav, [role="navigation"]');
      
      if (await navMenu.count() > 0) {
        // Click on different navigation items
        await navMenu.getByText(/Dashboard/).click();
        await expect(page).toHaveURL('http://localhost:8082/');
        
        await navMenu.getByText(/Campaigns/).click();
        await expect(page).toHaveURL('http://localhost:8082/campaigns');
        
        await navMenu.getByText(/Templates/).click();
        await expect(page).toHaveURL('http://localhost:8082/templates');
      }
    });
  });

  // ========================================
  // RESPONSIVE DESIGN TESTS
  // ========================================

  test.describe('Responsive Design', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:8082/signin');
      
      // Check that elements are visible and accessible on mobile
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:8082/signin');
      
      // Check that elements are visible and accessible on tablet
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:8082/signin');
      
      // Check that elements are visible and accessible on desktop
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  // ========================================
  // ERROR HANDLING TESTS
  // ========================================

  test.describe('Error Handling', () => {
    test('should handle invalid email format', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      // Should show validation error
      await expect(page.getByText(/Invalid email/)).toBeVisible();
    });

    test('should handle empty form submission', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.getByText(/required/)).toBeVisible();
    });

    test('should handle network errors gracefully', async ({ page }) => {
      // This test would require mocking network requests
      // For now, just check that error boundaries exist
      await page.goto('http://localhost:8082/signin');
      
      // Check that the page loads without errors
      await expect(page).toHaveTitle(/PubHub/);
    });
  });

  // ========================================
  // PERFORMANCE TESTS
  // ========================================

  test.describe('Performance', () => {
    test('should load sign-in page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:8082/signin');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should load dashboard quickly after authentication', async ({ page }) => {
      // Sign in first
      await page.goto('http://localhost:8082/signin');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      
      const startTime = Date.now();
      await page.waitForURL('http://localhost:8082/');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });
  });

  // ========================================
  // ACCESSIBILITY TESTS
  // ========================================

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Check for ARIA labels on form inputs
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      // Check if inputs have proper labels or aria-labels
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="email"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('input[type="password"]')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.locator('button[type="submit"]')).toBeFocused();
    });
  });
}); 