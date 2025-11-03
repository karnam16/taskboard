import { test, expect } from '@playwright/test';

test.describe('Board functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Login to Taskboard');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('text=Create an account');
    await expect(page).toHaveURL('/register');
    await expect(page.locator('h2')).toContainText('Create Account');
  });
});
