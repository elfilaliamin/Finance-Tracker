import { test, expect } from '@playwright/test';

test.describe('Responsive Design & Zero Overflow Suite', () => {
  const routes = ['/', '/login', '/register'];

  for (const route of routes) {
    test(`Route "${route}" should have zero horizontal overflow across viewport`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(isOverflowing).toBe(false);
    });
  }

  test('Buttons and touch targets meet minimum 44px height', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();

    const box = await submitBtn.boundingBox();
    expect(box).not.toBeNull();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('Hero buttons on landing page wrap responsively on mobile', async ({ page, viewport }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const getStartedBtn = page.getByRole('link', { name: 'Create Free Account' });
    await expect(getStartedBtn).toBeVisible();

    if (viewport && viewport.width < 640) {
      const box = await getStartedBtn.boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        // On mobile (<640px), button expands to full width container
        expect(box.width).toBeGreaterThan(260);
      }
    }
  });
});

