import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'e2e-tester@example.com',
  password: 'Password123!',
};

export const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6011';

// Default fallback token for verified test user (User ID 27 / Team ID 27)
export const AUTH_TOKEN_VALID =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjI3LCJlbWFpbCI6ImUyZS10ZXN0ZXJAZXhhbXBsZS5jb20iLCJ0ZWFtSWQiOjI3LCJ0eXBlIjoiYXV0aCIsImlhdCI6MTc5MDUzMTYyMywiZXhwIjoxNzkzMTIzNjIzfQ.sampleToken';

export async function getTestUserAuthToken(): Promise<string> {
  const apiBase = getApiBaseUrl();
  try {
    const loginRes = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    });
    const data = await loginRes.json();
    if (data?.token) {
      return data.token;
    }
  } catch (err) {
    console.warn('[auth.setup] Login fetch failed, attempting signup first:', err);
  }

  // Ensure test user is registered & verified on test backend
  await ensureTestUserExists();

  try {
    const loginRes = await fetch(`${apiBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_USER.email,
        password: TEST_USER.password,
      }),
    });
    const data = await loginRes.json();
    if (data?.token) {
      return data.token;
    }
  } catch (err) {
    console.warn('[auth.setup] Fallback to default test token:', err);
  }

  return AUTH_TOKEN_VALID;
}

export async function loginWithToken(page: Page, token?: string) {
  const authToken = token || (await getTestUserAuthToken());
  await page.context().addCookies([
    {
      name: 'token',
      value: authToken,
      domain: 'localhost',
      path: '/',
    },
  ]);
}

export async function ensureTestUserExists() {
  const apiBase = getApiBaseUrl();
  try {
    const signupRes = await fetch(`${apiBase}/api/auth/signup`, {
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
        `${apiBase}/api/auth/verify?token=${signupData.verificationToken}`
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

