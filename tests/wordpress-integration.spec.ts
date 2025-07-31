import { test, expect } from '@playwright/test';

const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

const testWordPressSite = {
  url: 'https://example.com',
  username: 'testuser',
  password: 'testpass'
};

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

  test('should navigate to WordPress connect page', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress');
    
    // Click connect button
    await page.click('a[href="/wordpress/connect"], button:has-text("Connect")');
    
    await expect(page).toHaveURL('http://localhost:8082/wordpress/connect');
    await expect(page.getByText(/Connect WordPress/)).toBeVisible();
  });

  test('should navigate to WordPress generate page', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress');
    
    // Click generate button
    await page.click('a[href="/wordpress/generate"], button:has-text("Generate")');
    
    await expect(page).toHaveURL('http://localhost:8082/wordpress/generate');
    await expect(page.getByText(/Generate Content/)).toBeVisible();
  });

  test('should connect to WordPress site', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/connect');
    
    // Fill connection form
    await page.fill('input[name="siteUrl"]', testWordPressSite.url);
    await page.fill('input[name="username"]', testWordPressSite.username);
    await page.fill('input[name="password"]', testWordPressSite.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show success message or redirect
    await expect(page.getByText(/Connected/)).toBeVisible();
  });

  test('should validate WordPress connection form', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/connect');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.getByText(/required/)).toBeVisible();
  });

  test('should handle invalid WordPress credentials', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/connect');
    
    // Fill with invalid credentials
    await page.fill('input[name="siteUrl"]', 'https://invalid-site.com');
    await page.fill('input[name="username"]', 'invaliduser');
    await page.fill('input[name="password"]', 'invalidpass');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText(/Error/)).toBeVisible();
  });

  test('should generate WordPress content', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Fill generation form
    await page.fill('textarea[name="prompt"]', 'Write a blog post about AI and machine learning');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show generated content or loading state
    await expect(page.getByText(/Generating/)).toBeVisible();
  });

  test('should validate content generation form', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Try to submit without filling prompt
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.getByText(/required/)).toBeVisible();
  });

  test('should select content type for generation', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Check if content type selector exists
    const contentTypeSelect = page.locator('select[name="contentType"]');
    if (await contentTypeSelect.count() > 0) {
      // Select blog post type
      await contentTypeSelect.selectOption('blog-post');
      
      // Should update form accordingly
      await expect(page.getByText(/Blog Post/)).toBeVisible();
    }
  });

  test('should set content generation parameters', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Check if parameter inputs exist
    const wordCountInput = page.locator('input[name="wordCount"]');
    if (await wordCountInput.count() > 0) {
      await wordCountInput.fill('500');
    }
    
    const toneSelect = page.locator('select[name="tone"]');
    if (await toneSelect.count() > 0) {
      await toneSelect.selectOption('professional');
    }
    
    // Fill prompt and generate
    await page.fill('textarea[name="prompt"]', 'Write about technology trends');
    await page.click('button[type="submit"]');
    
    await expect(page.getByText(/Generating/)).toBeVisible();
  });

  test('should preview generated content', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Fill and generate content
    await page.fill('textarea[name="prompt"]', 'Write a short article about testing');
    await page.click('button[type="submit"]');
    
    // Wait for generation to complete
    await page.waitForSelector('div:has-text("Generated Content")', { timeout: 10000 });
    
    // Check preview elements
    await expect(page.getByText(/Generated Content/)).toBeVisible();
    await expect(page.getByText(/Preview/)).toBeVisible();
  });

  test('should edit generated content', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Generate content first
    await page.fill('textarea[name="prompt"]', 'Write about automation');
    await page.click('button[type="submit"]');
    
    // Wait for generation
    await page.waitForSelector('div:has-text("Generated Content")', { timeout: 10000 });
    
    // Click edit button
    const editButton = page.locator('button:has-text("Edit")');
    if (await editButton.count() > 0) {
      await editButton.click();
      
      // Should show editable content area
      await expect(page.locator('textarea[name="content"]')).toBeVisible();
    }
  });

  test('should publish content to WordPress', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Generate content
    await page.fill('textarea[name="prompt"]', 'Write about publishing');
    await page.click('button[type="submit"]');
    
    // Wait for generation
    await page.waitForSelector('div:has-text("Generated Content")', { timeout: 10000 });
    
    // Click publish button
    const publishButton = page.locator('button:has-text("Publish")');
    if (await publishButton.count() > 0) {
      await publishButton.click();
      
      // Should show success message
      await expect(page.getByText(/Published/)).toBeVisible();
    }
  });

  test('should save content as draft', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/generate');
    
    // Generate content
    await page.fill('textarea[name="prompt"]', 'Write about saving drafts');
    await page.click('button[type="submit"]');
    
    // Wait for generation
    await page.waitForSelector('div:has-text("Generated Content")', { timeout: 10000 });
    
    // Click save as draft button
    const draftButton = page.locator('button:has-text("Save as Draft")');
    if (await draftButton.count() > 0) {
      await draftButton.click();
      
      // Should show success message
      await expect(page.getByText(/Saved/)).toBeVisible();
    }
  });

  test('should manage WordPress connections', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress');
    
    // Check if connections list exists
    const connectionsList = page.locator('div:has-text("Connected Sites")');
    if (await connectionsList.count() > 0) {
      await expect(page.getByText(/Connected Sites/)).toBeVisible();
      
      // Test disconnect functionality
      const disconnectButton = page.locator('button:has-text("Disconnect")');
      if (await disconnectButton.count() > 0) {
        await disconnectButton.first().click();
        
        // Confirm disconnect
        const confirmButton = page.locator('button:has-text("Confirm")');
        if (await confirmButton.count() > 0) {
          await confirmButton.click();
        }
        
        // Should show success message
        await expect(page.getByText(/Disconnected/)).toBeVisible();
      }
    }
  });

  test('should view WordPress site statistics', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress');
    
    // Check if statistics section exists
    const statsSection = page.locator('div:has-text("Statistics")');
    if (await statsSection.count() > 0) {
      await expect(page.getByText(/Statistics/)).toBeVisible();
      await expect(page.getByText(/Posts/)).toBeVisible();
      await expect(page.getByText(/Views/)).toBeVisible();
    }
  });

  test('should sync WordPress content', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress');
    
    // Check if sync button exists
    const syncButton = page.locator('button:has-text("Sync")');
    if (await syncButton.count() > 0) {
      await syncButton.click();
      
      // Should show sync progress
      await expect(page.getByText(/Syncing/)).toBeVisible();
      
      // Wait for sync to complete
      await expect(page.getByText(/Sync Complete/)).toBeVisible();
    }
  });

  test('should handle WordPress API errors', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/connect');
    
    // Try to connect to invalid site
    await page.fill('input[name="siteUrl"]', 'https://invalid-wordpress-site.com');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpass');
    
    await page.click('button[type="submit"]');
    
    // Should show appropriate error message
    await expect(page.getByText(/Error/)).toBeVisible();
  });

  test('should test WordPress connection before saving', async ({ page }) => {
    await page.goto('http://localhost:8082/wordpress/connect');
    
    // Fill connection details
    await page.fill('input[name="siteUrl"]', testWordPressSite.url);
    await page.fill('input[name="username"]', testWordPressSite.username);
    await page.fill('input[name="password"]', testWordPressSite.password);
    
    // Click test connection button
    const testButton = page.locator('button:has-text("Test Connection")');
    if (await testButton.count() > 0) {
      await testButton.click();
      
      // Should show test result
      await expect(page.getByText(/Connection Test/)).toBeVisible();
    }
  });
}); 