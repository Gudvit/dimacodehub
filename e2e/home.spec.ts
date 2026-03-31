import { expect, test } from '@playwright/test';

test('portfolio landing content is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Dima' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'View projects' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Selected work' })).toBeVisible();
});
