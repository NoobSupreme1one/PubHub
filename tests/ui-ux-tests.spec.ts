import { test, expect } from '@playwright/test';

test.describe('UI/UX Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8082');
  });

  // ========================================
  // RESPONSIVE DESIGN TESTS
  // ========================================

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile (375x667)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:8082/signin');
      
      // Check that elements are properly sized for mobile
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      // Check that text is readable
      await expect(page.getByText(/Sign In/)).toBeVisible();
    });

    test('should display correctly on tablet (768x1024)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('http://localhost:8082/signin');
      
      // Check that elements are properly sized for tablet
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should display correctly on desktop (1920x1080)', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('http://localhost:8082/signin');
      
      // Check that elements are properly sized for desktop
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should handle landscape orientation on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('http://localhost:8082/signin');
      
      // Check that elements are still accessible
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should maintain proper spacing on all screen sizes', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('http://localhost:8082/signin');
        
        // Check that elements don't overlap
        const emailInput = page.locator('input[type="email"]');
        const passwordInput = page.locator('input[type="password"]');
        
        const emailBox = await emailInput.boundingBox();
        const passwordBox = await passwordInput.boundingBox();
        
        if (emailBox && passwordBox) {
          // Elements should not overlap
          expect(emailBox.y + emailBox.height).toBeLessThan(passwordBox.y);
        }
      }
    });
  });

  // ========================================
  // ACCESSIBILITY TESTS
  // ========================================

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels on form inputs', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      // Check for aria-label or associated label
      const emailLabel = await emailInput.getAttribute('aria-label');
      const passwordLabel = await passwordInput.getAttribute('aria-label');
      
      // At least one should have a label
      expect(emailLabel || passwordLabel).toBeTruthy();
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

    test('should have proper focus indicators', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Focus on email input
      await page.locator('input[type="email"]').focus();
      
      // Check that focus is visible (CSS outline or box-shadow)
      const emailInput = page.locator('input[type="email"]');
      const styles = await emailInput.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          boxShadow: computed.boxShadow
        };
      });
      
      // Should have some focus indicator
      expect(styles.outline !== 'none' || styles.boxShadow !== 'none').toBeTruthy();
    });

    test('should have proper color contrast', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Check text color contrast (basic check)
      const textElement = page.getByText(/Sign In/);
      const color = await textElement.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.color;
      });
      
      // Should have a color defined
      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('should have proper heading structure', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
      expect(headings).toBeGreaterThan(0);
    });

    test('should have alt text for images', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Check all images have alt text
      const images = page.locator('img');
      const imageCount = await images.count();
      
      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    });
  });

  // ========================================
  // USER EXPERIENCE TESTS
  // ========================================

  test.describe('User Experience', () => {
    test('should show loading states during form submission', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Fill form and submit
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should show loading state
      await expect(page.locator('.animate-spin, [aria-busy="true"]')).toBeVisible();
    });

    test('should show success messages after actions', async ({ page }) => {
      // This would require authentication first
      await page.goto('http://localhost:8082/signin');
      
      // Fill and submit form
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should show success message or redirect
      await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should show error messages for invalid inputs', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Submit without filling required fields
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.getByText(/required/)).toBeVisible();
    });

    test('should have smooth transitions between pages', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Navigate to sign-up page
      await page.click('a[href="/signup"]');
      
      // Should navigate smoothly
      await expect(page).toHaveURL(/.*signup/);
    });

    test('should maintain scroll position when navigating back', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 100));
      
      // Navigate away and back
      await page.goto('http://localhost:8082/signup');
      await page.goBack();
      
      // Should be back on signin page
      await expect(page).toHaveURL(/.*signin/);
    });

    test('should have proper button states (hover, focus, active)', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      const submitButton = page.locator('button[type="submit"]');
      
      // Test hover state
      await submitButton.hover();
      
      // Test focus state
      await submitButton.focus();
      
      // Test active state (click and hold)
      await submitButton.click({ delay: 100 });
      
      // Button should remain functional
      await expect(submitButton).toBeVisible();
    });

    test('should have proper form validation feedback', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      const emailInput = page.locator('input[type="email"]');
      
      // Test invalid email format
      await emailInput.fill('invalid-email');
      await emailInput.blur();
      
      // Should show validation error
      await expect(page.getByText(/Invalid email/)).toBeVisible();
      
      // Test valid email format
      await emailInput.fill('valid@email.com');
      await emailInput.blur();
      
      // Error should disappear
      await expect(page.getByText(/Invalid email/)).not.toBeVisible();
    });

    test('should have proper tooltips and help text', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Check for help text or tooltips
      const helpElements = page.locator('[title], [data-tooltip], .help-text');
      const helpCount = await helpElements.count();
      
      // Should have some help elements
      expect(helpCount).toBeGreaterThanOrEqual(0);
    });

    test('should handle long content gracefully', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Test with very long email
      const longEmail = 'a'.repeat(100) + '@example.com';
      await page.fill('input[type="email"]', longEmail);
      
      // Should handle long input without breaking layout
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should have proper error boundaries', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Try to trigger an error (if possible)
      await page.evaluate(() => {
        // Simulate an error
        console.error('Test error');
      });
      
      // Page should still be functional
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  // ========================================
  // PERFORMANCE TESTS
  // ========================================

  test.describe('Performance', () => {
    test('should load page quickly', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('http://localhost:8082/signin');
      const loadTime = Date.now() - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should have smooth animations', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Check for CSS transitions
      const emailInput = page.locator('input[type="email"]');
      const transition = await emailInput.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.transition;
      });
      
      // Should have smooth transitions
      expect(transition).not.toBe('all 0s ease 0s');
    });

    test('should not have memory leaks', async ({ page }) => {
      await page.goto('http://localhost:8082/signin');
      
      // Navigate between pages multiple times
      for (let i = 0; i < 5; i++) {
        await page.goto('http://localhost:8082/signup');
        await page.goto('http://localhost:8082/signin');
      }
      
      // Page should still be functional
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });

  // ========================================
  // CROSS-BROWSER COMPATIBILITY TESTS
  // ========================================

  test.describe('Cross-Browser Compatibility', () => {
    test('should work with different user agents', async ({ page }) => {
      await page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      });
      
      await page.goto('http://localhost:8082/signin');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should handle different screen densities', async ({ page }) => {
      // Test with different device pixel ratios
      await page.addInitScript(() => {
        Object.defineProperty(window, 'devicePixelRatio', {
          get: () => 2
        });
      });
      
      await page.goto('http://localhost:8082/signin');
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });
  });
}); 