import { test, expect } from '@playwright/test';

test.describe('Navigation Responsive Hierarchy', () => {
  test('Landing page brand header displays cleanly across viewports', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const brand = page.locator('text=Finance-Tracker').first();
    await expect(brand).toBeVisible();

    const loginLink = page.getByRole('link', { name: 'Log In' });
    await expect(loginLink).toBeVisible();
  });

  test('Auth forms display centered with no clipping', async ({ page, viewport }) => {
    await page.goto('/register');
    await page.waitForLoadState('networkidle');

    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Verify all primary form fields are visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();

    // Verify zero document overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});

