import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'e2e-tester@example.com',
  password: 'Password123!',
};

export const AUTH_TOKEN_VALID =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoicHNzLmNyZWF0ZXMuMjAyMkBnbWFpbC5jb20iLCJ0ZWFtSWQiOjEsInR5cGUiOiJhdXRoIiwiaWF0IjoxNzkwNTMxNjIzLCJleHAiOjE3OTMxMjM2MjN9.AlRNWJMtEJul18hEv4IHyV6g7ZJSICe1JWrB0nXS0JE';

export async function loginWithToken(page: Page, token = AUTH_TOKEN_VALID) {
  await page.context().addCookies([
    {
      name: 'token',
      value: token,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

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
  // Use direct cookie injection to bypass login rate limiter and isolate tests
  await loginWithToken(page);
  await page.goto('/dashboard');
  await page.waitForLoadState('domcontentloaded');
}
