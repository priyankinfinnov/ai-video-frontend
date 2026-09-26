import { Page, expect } from '@playwright/test';

export const TEST_USER = {
  email: 'e2e-tester@example.com',
  password: 'Password123!',
};

export async function ensureTestUserExists() {
  try {
    const signupRes = await fetch('http://localhost:6001/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Playwright Tester',
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    });
    const signupData = await signupRes.json();
    if (signupData?.verificationToken) {
      await fetch(
        `http://localhost:6001/api/auth/verify?token=${signupData.verificationToken}`
      );
    }
  } catch {
    // If user already exists or signup fails, proceed to login
  }
}

export async function loginTestUser(page: Page) {
  await ensureTestUserExists();
  await page.goto('/login');
  await expect(page.locator('input#email')).toBeVisible();

  await page.locator('input#email').fill(TEST_USER.email);
  await page.locator('input#password').fill(TEST_USER.password);
  await page.locator('button[type="submit"]').click();

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard\/?$/);
  await expect(page.locator('h1')).toHaveText('Personas');
}

