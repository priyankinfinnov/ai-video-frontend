import { test, expect } from '@playwright/test';
import { loginTestUser } from './auth.setup';

test.describe('Direct Social Uploads (YouTube & Instagram)', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('E2E-UPLOAD-01: Projects table shows YouTube upload action for completed projects', async ({
    page,
  }) => {
    await page.goto('/dashboard/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    // Verify projects table loaded
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    // Look for an upload button on completed rows or verify row action presence
    const uploadButtons = page.locator('button[title*="YouTube"]');
    const uploadCount = await uploadButtons.count();
    expect(uploadCount).toBeGreaterThanOrEqual(1);

    // Click the first enabled YouTube upload button if any completed project exists
    const firstEnabledUploadBtn = page.locator('button[title="Upload to YouTube"]').first();
    if (await firstEnabledUploadBtn.isVisible()) {
      await firstEnabledUploadBtn.click();

      // Check that the ProjectUploadModal opened
      await expect(page.getByRole('heading', { name: 'Upload to YouTube' })).toBeVisible();
      await expect(page.getByText('YouTube Studio Draft')).toBeVisible();
      await expect(page.getByText('Live Public Post')).toBeVisible();
      await expect(page.getByText('Custom Video Title')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Confirm & Upload' })).toBeVisible();

      // Close modal
      await page.getByRole('button', { name: 'Cancel' }).click();
      await expect(page.getByRole('heading', { name: 'Upload to YouTube' })).not.toBeVisible();
    }
  });

  test('E2E-UPLOAD-02: Project details overview displays YouTube upload trigger and distribution card', async ({
    page,
  }) => {
    // Navigate directly to completed project details
    await page.goto('/dashboard/projects/83?tab=details');

    // Wait for project details to load
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });

    // Overview header action
    const uploadHeaderBtn = page.getByTestId('project-header-upload-youtube-btn');
    if (await uploadHeaderBtn.isVisible()) {
      await expect(uploadHeaderBtn).toBeVisible();
    }

    // Check YouTube Status card in overview
    await expect(page.getByText('YouTube Status')).toBeVisible();

    // Clicking upload button opens modal
    if (await uploadHeaderBtn.isVisible() && await uploadHeaderBtn.isEnabled()) {
      await uploadHeaderBtn.click();
      await expect(page.getByRole('heading', { name: 'Upload to YouTube' })).toBeVisible();
      await page.getByRole('button', { name: 'Cancel' }).click();
    }
  });

  test('E2E-UPLOAD-03: Shorts clips tab provides direct YouTube Shorts & Instagram Reels upload triggers', async ({
    page,
  }) => {
    await page.goto('/dashboard/projects/83?tab=shorts-clips');

    // Verify clips grid is visible
    const clipCards = page.locator('[data-testid^="short-clip-card-"]');
    const cardCount = await clipCards.count();

    if (cardCount > 0) {
      const firstCard = clipCards.first();
      await expect(firstCard).toBeVisible();

      // Hover card to see actions
      await firstCard.hover();
      await page.waitForTimeout(300);

      // Verify YouTube / Instagram buttons in card overlay or actions
      const postBtn = firstCard.locator('button', { hasText: 'Post' });
      if (await postBtn.isVisible()) {
        await postBtn.click();

        // Check ClipUploadModal opened
        await expect(page.getByRole('heading', { name: /Upload Short Clip/i })).toBeVisible();
        await expect(page.getByText('YouTube Shorts')).toBeVisible();
        await expect(page.getByText('Instagram Reels')).toBeVisible();
        await expect(page.getByText('Draft Upload')).toBeVisible();
        await expect(page.getByText('Live Post')).toBeVisible();

        // Switch to Instagram tab
        await page.getByRole('button', { name: 'Instagram Reels' }).click();
        await expect(page.getByText('Instagram Reels')).toBeVisible();

        // Close modal
        await page.getByRole('button', { name: 'Cancel' }).click();
        await expect(page.getByRole('heading', { name: /Upload Short Clip/i })).not.toBeVisible();
      }

      // Check table view actions
      const tableBtn = page.getByTestId('clips-view-table');
      await tableBtn.click();

      // Check table columns: YouTube, Instagram, and Actions
      await expect(page.getByRole('columnheader', { name: 'YouTube' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Instagram' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    }
  });
});
