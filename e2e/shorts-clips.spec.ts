import { test, expect } from '@playwright/test';
import { loginTestUser } from './auth.setup';

test.describe('Shorts Viral Clips Grid & Playback E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('E2E-CLIPS-01: Navigating to project shorts-clips tab displays visual clips grid by default', async ({
    page,
  }) => {
    // Navigate directly to project 83 (or 100) shorts-clips tab
    await page.goto('/dashboard/projects/83?tab=shorts-clips');

    // Header assertions
    await expect(page.getByRole('heading', { name: 'Shorts Viral Clips' })).toBeVisible();
    await expect(
      page.getByText('Carved vertical 9:16 clips with subtitled voiceover and hook rationale.')
    ).toBeVisible();

    // Assert View Toggle buttons are visible
    const gridBtn = page.getByTestId('clips-view-grid');
    const tableBtn = page.getByTestId('clips-view-table');
    await expect(gridBtn).toBeVisible();
    await expect(tableBtn).toBeVisible();

    // Verify clips grid is active by default
    await expect(gridBtn).toHaveClass(/bg-white/);

    // Verify clip cards exist or empty state is handled cleanly
    const clipCards = page.locator('[data-testid^="short-clip-card-"]');
    const count = await clipCards.count();
    if (count > 0) {
      // First card should have a 9:16 video container
      const firstCard = clipCards.first();
      await expect(firstCard).toBeVisible();
      // Should show hook title
      await expect(firstCard.locator('h4[title]')).toBeVisible();
      // Should show clip ID badge
      await expect(firstCard.getByText(/^#\d+/).first()).toBeVisible();
    }
  });

  test('E2E-CLIPS-02: Switching between visual Clips Grid and Table view', async ({
    page,
  }) => {
    await page.goto('/dashboard/projects/83?tab=shorts-clips');

    const gridBtn = page.getByTestId('clips-view-grid');
    const tableBtn = page.getByTestId('clips-view-table');

    // Click Table View
    await tableBtn.click();
    await expect(tableBtn).toHaveClass(/bg-white/);

    // Verify table headers are visible
    await expect(page.getByRole('columnheader', { name: 'Clip ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Hook Title' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Clip Preview' })).toBeVisible();

    // Click back to Clips Grid
    await gridBtn.click();
    await expect(gridBtn).toHaveClass(/bg-white/);
  });

  test('E2E-CLIPS-03: Hovering on clip card reveals detailed info and inspector modal opens', async ({
    page,
  }) => {
    await page.goto('/dashboard/projects/83?tab=shorts-clips');

    const firstCard = page.locator('[data-testid^="short-clip-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });

    // Screenshot before hover
    await page.screenshot({ path: 'test-results/screenshots/shorts_clips_grid.png' });

    // Hover over the card
    await firstCard.hover();
    await page.waitForTimeout(500); // Allow hover transition
    await page.screenshot({ path: 'test-results/screenshots/shorts_clips_hover.png' });

    // Inspect button should be clickable
    const inspectBtn = firstCard.locator('button[title="Inspect Details"]');
    await expect(inspectBtn).toBeVisible();
    await inspectBtn.click();

    // Verify inspector modal opens
    await expect(page.getByText('Virality Angle & Hook Rationale')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close preview' })).toBeVisible();

    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/screenshots/shorts_clips_modal.png' });

    // Close modal
    await page.getByRole('button', { name: 'Close preview' }).click();
    await expect(page.getByText('Virality Angle & Hook Rationale')).not.toBeVisible();
  });
});
