import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'e2e-tester@example.com',
  password: 'Password123!',
};

export async function loginTestUser(page: Page) {
  await page.goto('/login');
  await expect(page.locator('input#email')).toBeVisible();

  await page.locator('input#email').fill(TEST_USER.email);
  await page.locator('input#password').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard\/?$/);
  await expect(page.locator('h1')).toHaveText('Personas');
}
