import { test, expect } from '@playwright/test';
import { loginTestUser } from './auth.setup';

test.describe('Social Integrations & Publishing Automations E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('E2E-AUTO-01: Automations sidebar navigation and page view', async ({
    page,
  }) => {
    // Check sidebar navigation item exists
    const navAutomations = page.getByTestId('nav-automations');
    await expect(navAutomations).toBeVisible();

    // Click on Automations
    await navAutomations.click();
    await expect(page).toHaveURL(/.*\/dashboard\/automations/);

    // Verify Title & Controls
    await expect(page.locator('h1')).toHaveText('Publishing Automations');
    await expect(page.getByTestId('create-automation-btn')).toBeVisible();

    // Verify filter dropdowns exist
    await expect(page.getByText('Persona:')).toBeVisible();
    await expect(page.getByText('Platform:')).toBeVisible();
    await expect(page.getByText('Target:')).toBeVisible();
    await expect(page.getByText('Mode:')).toBeVisible();
  });

  test('E2E-AUTO-02: Create Automation modal controls and form validation', async ({
    page,
  }) => {
    await page.goto('/dashboard/automations');

    // Click Create Automation
    await page.getByTestId('create-automation-btn').click();

    // Modal should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Create Publishing Automation' })
    ).toBeVisible();

    // Verify Automation Name & Posts Per Period inputs
    await expect(page.getByTestId('automation-name-input')).toBeVisible();
    await expect(page.getByTestId('posts-per-period-input')).toBeVisible();

    // Verify Platform buttons
    await expect(page.getByRole('button', { name: 'YouTube' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Instagram' })).toBeVisible();

    // Verify Target Content buttons
    await expect(page.getByRole('button', { name: 'Master Video' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Shorts Clip' })).toBeVisible();

    // Verify Upload Mode & Cadence selects
    await expect(page.getByText('Upload Mode')).toBeVisible();
    await expect(page.getByText('Cadence / Frequency')).toBeVisible();

    // Verify Time Window & Cooldown inputs
    await expect(page.getByText('Randomized Posting Window (24h format)')).toBeVisible();
    await expect(page.getByText('Cooldown Period (Hours)')).toBeVisible();
    await expect(page.getByText('Active Status')).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('E2E-AUTO-03: Persona Details tabs include Integrations and Automations', async ({
    page,
  }) => {
    // Go to personas list
    await page.goto('/dashboard/personas');

    // Wait for personas table to load
    await page.waitForSelector('table');
    const firstRowViewBtn = page.locator('tbody tr').first().locator('a').first();

    if (await firstRowViewBtn.isVisible()) {
      await firstRowViewBtn.click();
      await expect(page).toHaveURL(/.*\/dashboard\/personas\/.*/);

      // Verify Integrations & Socials tab
      const integrationsTab = page.getByTestId('tab-integrations');
      await expect(integrationsTab).toBeVisible();

      // Verify Automations tab
      const automationsTab = page.getByTestId('tab-automations');
      await expect(automationsTab).toBeVisible();

      // Click Integrations tab
      await integrationsTab.click();
      await expect(page).toHaveURL(/.*tab=integrations/);
      await expect(page.getByText('Social Media & Publishing Connections')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'YouTube Channel' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Instagram Account' })).toBeVisible();

      // Click Automations tab
      await automationsTab.click();
      await expect(page).toHaveURL(/.*tab=automations/);
      await expect(page.getByRole('button', { name: 'Create Automation' })).toBeVisible();
    }
  });

  test('E2E-AUTO-04: Projects table includes YouTube Publishing traceability column', async ({
    page,
  }) => {
    await page.goto('/dashboard/projects?tab=projects');
    await page.waitForSelector('table');

    // Assert headers include YouTube Publishing
    const headers = page.locator('th');
    await expect(headers.getByText('YouTube Publishing')).toBeVisible();
  });

  test('E2E-AUTO-05: OAuth redirect to /personas/:id with connected=youtube renders successfully without ErrorPage', async ({
    page,
  }) => {
    // Go to personas page first to find an active persona ID
    await page.goto('/dashboard/personas');
    await page.waitForSelector('table');
    const firstRowLink = page.locator('tbody tr').first().locator('a').first();

    let targetUrl = '/dashboard/personas/1?tab=automations&connected=youtube&channel=James%20-%20The%20Modern%20Stoic';
    if (await firstRowLink.isVisible()) {
      const href = await firstRowLink.getAttribute('href');
      if (href) {
        targetUrl = `${href}?tab=automations&connected=youtube&channel=James%20-%20The%20Modern%20Stoic`;
      }
    }

    // Navigate to OAuth callback redirect target
    await page.goto(targetUrl);

    // Should not hit ErrorPage
    await expect(page.getByText('404')).not.toBeVisible();
    await expect(page.getByText('Page Not Found')).not.toBeVisible();

    // Verify successful toast message
    await expect(page.getByText(/Successfully connected YouTube channel/).first()).toBeVisible();

    // Switch to Integrations tab
    const integrationsTab = page.getByTestId('tab-integrations');
    await expect(integrationsTab).toBeVisible();
    await integrationsTab.click();

    // Verify YouTube card renders without crashing
    await expect(page.getByRole('heading', { name: 'YouTube Channel' })).toBeVisible();
  });

  test('E2E-AUTO-06: Clone automation button opens pre-filled creation modal', async ({
    page,
  }) => {
    await page.goto('/dashboard/automations');
    await page.waitForSelector('table');

    // Find clone button if table has automation rows
    const cloneBtn = page.locator('[data-testid^="clone-automation-"]').first();

    if (await cloneBtn.isVisible()) {
      await cloneBtn.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Clone Publishing Automation' })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Create Automation' })
      ).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });
});

