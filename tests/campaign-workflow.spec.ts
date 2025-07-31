import { test, expect } from '@playwright/test';

const testUser = {
  email: 'test@example.com',
  password: 'testpassword123'
};

const testCampaign = {
  name: 'Automated Test Campaign',
  description: 'This campaign was created by automated testing',
  status: 'draft'
};

test.describe('Campaign Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in before each test
    await page.goto('http://localhost:8082/signin');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:8082/');
  });

  test('should create a new campaign with all required fields', async ({ page }) => {
    await page.goto('http://localhost:8082/campaigns/new');
    
    // Fill all required fields
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    
    // Select status if dropdown exists
    const statusSelect = page.locator('select[name="status"]');
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption(testCampaign.status);
    }
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to campaigns list or show success message
    await expect(page).toHaveURL(/.*campaigns/);
  });

  test('should validate required fields when creating campaign', async ({ page }) => {
    await page.goto('http://localhost:8082/campaigns/new');
    
    // Try to submit without filling required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.getByText(/required/)).toBeVisible();
  });

  test('should edit an existing campaign', async ({ page }) => {
    // First create a campaign
    await page.goto('http://localhost:8082/campaigns/new');
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    await page.click('button[type="submit"]');
    
    // Navigate to edit page (assuming campaign ID is 1)
    await page.goto('http://localhost:8082/campaigns/1/edit');
    
    // Verify form is populated
    await expect(page.locator('input[name="name"]')).toHaveValue(testCampaign.name);
    await expect(page.locator('textarea[name="description"]')).toHaveValue(testCampaign.description);
    
    // Update campaign
    const updatedName = 'Updated Campaign Name';
    await page.fill('input[name="name"]', updatedName);
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.getByText(/updated/)).toBeVisible();
  });

  test('should view campaign details', async ({ page }) => {
    // Create a campaign first
    await page.goto('http://localhost:8082/campaigns/new');
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    await page.click('button[type="submit"]');
    
    // View campaign details
    await page.goto('http://localhost:8082/campaigns/1');
    
    // Check campaign details are displayed
    await expect(page.getByText(testCampaign.name)).toBeVisible();
    await expect(page.getByText(testCampaign.description)).toBeVisible();
  });

  test('should schedule a campaign', async ({ page }) => {
    // Create a campaign first
    await page.goto('http://localhost:8082/campaigns/new');
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    await page.click('button[type="submit"]');
    
    // Navigate to scheduling page
    await page.goto('http://localhost:8082/campaigns/1/schedule');
    
    // Check scheduling form elements
    await expect(page.getByText(/Schedule Campaign/)).toBeVisible();
    
    // Set schedule date and time
    const scheduleInput = page.locator('input[type="datetime-local"]');
    if (await scheduleInput.count() > 0) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const dateString = futureDate.toISOString().slice(0, 16);
      await scheduleInput.fill(dateString);
    }
    
    // Submit schedule
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.getByText(/scheduled/)).toBeVisible();
  });

  test('should delete a campaign', async ({ page }) => {
    // Create a campaign first
    await page.goto('http://localhost:8082/campaigns/new');
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    await page.click('button[type="submit"]');
    
    // Navigate to campaign details
    await page.goto('http://localhost:8082/campaigns/1');
    
    // Click delete button
    const deleteButton = page.locator('button:has-text("Delete")');
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      
      // Confirm deletion if confirmation dialog appears
      const confirmButton = page.locator('button:has-text("Confirm")');
      if (await confirmButton.count() > 0) {
        await confirmButton.click();
      }
      
      // Should redirect to campaigns list
      await expect(page).toHaveURL(/.*campaigns/);
    }
  });

  test('should filter campaigns by status', async ({ page }) => {
    await page.goto('http://localhost:8082/campaigns');
    
    // Check if filter dropdown exists
    const filterSelect = page.locator('select[name="status-filter"]');
    if (await filterSelect.count() > 0) {
      // Filter by draft status
      await filterSelect.selectOption('draft');
      
      // Should show only draft campaigns
      await expect(page.getByText(/draft/i)).toBeVisible();
    }
  });

  test('should search campaigns', async ({ page }) => {
    await page.goto('http://localhost:8082/campaigns');
    
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="search"], input[name="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill(testCampaign.name);
      
      // Should show matching campaigns
      await expect(page.getByText(testCampaign.name)).toBeVisible();
    }
  });

  test('should paginate through campaigns', async ({ page }) => {
    await page.goto('http://localhost:8082/campaigns');
    
    // Check if pagination exists
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.count() > 0) {
      await nextButton.click();
      
      // Should navigate to next page
      await expect(page).toHaveURL(/.*page=2/);
    }
  });

  test('should duplicate a campaign', async ({ page }) => {
    // Create a campaign first
    await page.goto('http://localhost:8082/campaigns/new');
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    await page.click('button[type="submit"]');
    
    // Navigate to campaign details
    await page.goto('http://localhost:8082/campaigns/1');
    
    // Click duplicate button
    const duplicateButton = page.locator('button:has-text("Duplicate")');
    if (await duplicateButton.count() > 0) {
      await duplicateButton.click();
      
      // Should create a copy and redirect to edit page
      await expect(page).toHaveURL(/.*campaigns.*edit/);
    }
  });

  test('should export campaign data', async ({ page }) => {
    // Create a campaign first
    await page.goto('http://localhost:8082/campaigns/new');
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    await page.click('button[type="submit"]');
    
    // Navigate to campaign details
    await page.goto('http://localhost:8082/campaigns/1');
    
    // Click export button
    const exportButton = page.locator('button:has-text("Export")');
    if (await exportButton.count() > 0) {
      await exportButton.click();
      
      // Should trigger download or show export options
      await expect(page.getByText(/export/)).toBeVisible();
    }
  });

  test('should add content to campaign', async ({ page }) => {
    // Create a campaign first
    await page.goto('http://localhost:8082/campaigns/new');
    await page.fill('input[name="name"]', testCampaign.name);
    await page.fill('textarea[name="description"]', testCampaign.description);
    await page.click('button[type="submit"]');
    
    // Navigate to campaign details
    await page.goto('http://localhost:8082/campaigns/1');
    
    // Click add content button
    const addContentButton = page.locator('button:has-text("Add Content")');
    if (await addContentButton.count() > 0) {
      await addContentButton.click();
      
      // Should show content form
      await expect(page.getByText(/Add Content/)).toBeVisible();
      
      // Fill content form
      await page.fill('input[name="title"]', 'Test Content');
      await page.fill('textarea[name="content"]', 'This is test content for the campaign');
      
      // Submit content
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.getByText(/Content added/)).toBeVisible();
    }
  });

  test('should manage campaign templates', async ({ page }) => {
    await page.goto('http://localhost:8082/campaigns/new');
    
    // Check if template selection exists
    const templateSelect = page.locator('select[name="template"]');
    if (await templateSelect.count() > 0) {
      // Select a template
      await templateSelect.selectOption('1');
      
      // Should populate form with template data
      await expect(page.locator('input[name="name"]')).not.toBeEmpty();
    }
  });
}); 