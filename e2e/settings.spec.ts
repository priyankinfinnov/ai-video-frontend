import { test, expect } from '@playwright/test';
import { loginTestUser } from './auth.setup';

test.describe('Settings Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('E2E-Settings: Navigate to Settings page and verify User and Team tabs', async ({
    page,
  }) => {
    // Navigate via Sidebar settings button
    const settingsNav = page.getByTestId('nav-settings');
    await expect(settingsNav).toBeVisible();
    await settingsNav.click();

    // Verify URL is /dashboard/settings
    await expect(page).toHaveURL(/\/dashboard\/settings/);

    // Verify header title & subtitle
    await expect(page.locator('h1')).toHaveText('Settings');
    await expect(
      page.getByText('Manage your personal profile details and workspace team configurations.')
    ).toBeVisible();

    // Verify User Profile tab is active by default
    const userTab = page.getByTestId('tab-user-settings');
    const teamTab = page.getByTestId('tab-team-settings');
    await expect(userTab).toBeVisible();
    await expect(teamTab).toBeVisible();

    await expect(page.getByText('Personal Details')).toBeVisible();
    await expect(page.getByText('Workspace & Security')).toBeVisible();

    // Switch to Team tab
    await teamTab.click();
    await expect(page).toHaveURL(/\/dashboard\/settings\?tab=team/);

    // Verify Team tab elements
    await expect(page.getByText('Add Team Member')).toBeVisible();
    await expect(page.getByText('Team Roster')).toBeVisible();
  });
});
