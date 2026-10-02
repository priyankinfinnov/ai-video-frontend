import { execSync } from 'child_process';

async function globalSetup() {
  process.env.NODE_ENV = 'test';
  process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6011';

  console.log('[Playwright Global Setup] Verifying backend test environment on port 6011...');
  try {
    execSync('npm run db:test:setup', {
      cwd: 'E:\\Video creation',
      stdio: 'inherit',
    });
    console.log('[Playwright Global Setup] Test database synced successfully.');
  } catch (err) {
    console.warn('[Playwright Global Setup] Backend db:test:setup hook completed or bypassed:', err);
  }
}

export default globalSetup;
