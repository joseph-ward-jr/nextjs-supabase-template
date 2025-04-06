import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage successfully', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Verify that the page loaded successfully
    // Don't check for specific title text as it may differ between environments
    // Just verify that some title exists
    await expect(page).toHaveTitle(/.+/);
    
    // Check for some basic content that should be on the homepage
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Check that the page has loaded by verifying that basic HTML structure exists
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});
