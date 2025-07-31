import { test, expect } from '@playwright/test';

test.describe('LinkedIn Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the LinkedIn page
    await page.goto('/linkedin');
  });

  test('should display LinkedIn integration page', async ({ page }) => {
    // Check if the page loads correctly
    await expect(page.getByRole('heading', { name: 'LinkedIn Integration' })).toBeVisible();
    await expect(page.getByText('Connect your LinkedIn accounts and manage your professional content')).toBeVisible();
  });

  test('should show connect button when no accounts are connected', async ({ page }) => {
    // Check for the connect button
    await expect(page.getByRole('button', { name: /Connect LinkedIn Account/i })).toBeVisible();
    await expect(page.getByText('No LinkedIn accounts connected')).toBeVisible();
  });

  test('should navigate to connect page when connect button is clicked', async ({ page }) => {
    // Click the connect button
    await page.getByRole('button', { name: /Connect LinkedIn Account/i }).click();
    
    // Should navigate to connect page
    await expect(page).toHaveURL(/\/linkedin\/connect/);
  });

  test('should display LinkedIn connect page', async ({ page }) => {
    // Navigate to connect page
    await page.goto('/linkedin/connect');
    
    // Check if the connect page loads
    await expect(page.getByRole('heading', { name: /Connect LinkedIn/i })).toBeVisible();
    await expect(page.getByText('Connect your LinkedIn profile and company pages')).toBeVisible();
  });

  test('should show LinkedIn benefits on connect page', async ({ page }) => {
    // Navigate to connect page
    await page.goto('/linkedin/connect');
    
    // Check for benefits list
    await expect(page.getByText('Publish to personal profile')).toBeVisible();
    await expect(page.getByText('Publish to company pages')).toBeVisible();
    await expect(page.getByText('View analytics and insights')).toBeVisible();
    await expect(page.getByText('Optimize content for LinkedIn')).toBeVisible();
  });

  test('should navigate to publish page', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // Check if the publish page loads
    await expect(page.getByRole('heading', { name: 'Publish to LinkedIn' })).toBeVisible();
    await expect(page.getByText('Create and publish professional content')).toBeVisible();
  });

  test('should show content creation form on publish page', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // Check for form elements
    await expect(page.getByText('Create Your Post')).toBeVisible();
    await expect(page.getByPlaceholder('Share your thoughts, insights, or updates...')).toBeVisible();
    await expect(page.getByText('Post Visibility')).toBeVisible();
  });

  test('should show optimization features', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // Check for optimization button
    await expect(page.getByRole('button', { name: /Optimize/i })).toBeVisible();
    
    // Check for best practices section
    await expect(page.getByText('LinkedIn Best Practices')).toBeVisible();
    await expect(page.getByText('Optimal Length')).toBeVisible();
    await expect(page.getByText('Best Posting Times')).toBeVisible();
  });

  test('should handle content input and character count', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // Type some content
    const textarea = page.getByPlaceholder('Share your thoughts, insights, or updates...');
    await textarea.fill('This is a test LinkedIn post for automated testing.');
    
    // Check character count
    await expect(page.getByText(/characters/)).toBeVisible();
  });

  test('should show media upload section', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // Check for media upload
    await expect(page.getByText('Media (Optional)')).toBeVisible();
    await expect(page.getByText('Supported: Images, PDFs, Documents')).toBeVisible();
  });

  test('should show visibility options', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // Check for visibility dropdown
    await expect(page.getByText('Post Visibility')).toBeVisible();
    
    // Click to open dropdown
    await page.getByRole('combobox').click();
    
    // Check for visibility options
    await expect(page.getByText('Public')).toBeVisible();
    await expect(page.getByText('Connections')).toBeVisible();
    await expect(page.getByText('Logged-in users')).toBeVisible();
  });

  test('should show publish button', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // Check for publish button
    await expect(page.getByRole('button', { name: /Publish to LinkedIn/i })).toBeVisible();
  });

  test('should handle navigation between LinkedIn pages', async ({ page }) => {
    // Start at main LinkedIn page
    await page.goto('/linkedin');
    
    // Navigate to connect page
    await page.getByRole('button', { name: /Connect LinkedIn Account/i }).click();
    await expect(page).toHaveURL(/\/linkedin\/connect/);
    
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    await expect(page).toHaveURL(/\/linkedin\/publish/);
    
    // Navigate back to main page
    await page.goto('/linkedin');
    await expect(page).toHaveURL(/\/linkedin/);
  });

  test('should show loading states', async ({ page }) => {
    // Navigate to publish page
    await page.goto('/linkedin/publish');
    
    // The page should show loading state initially
    // This test verifies the loading states are implemented
    await expect(page.getByText(/Loading LinkedIn channels/)).toBeVisible();
  });

  test('should display error states appropriately', async ({ page }) => {
    // Navigate to publish page without authentication
    // This should show appropriate error or redirect
    await page.goto('/linkedin/publish');
    
    // Should either show loading or error state
    await expect(page.getByText(/Loading LinkedIn channels|No LinkedIn accounts connected/)).toBeVisible();
  });
}); 