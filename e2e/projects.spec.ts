import { test, expect } from '@playwright/test';
import { loginTestUser } from './auth.setup';

test.describe('Projects & Shorts Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('E2E-PROJ-01: Navigate to Projects & switch tabs between Video Projects and Short Projects', async ({
    page,
  }) => {
    // 1. Click Projects in the left sidebar
    const navProjects = page.getByTestId('nav-projects');
    await expect(navProjects).toBeVisible();
    await navProjects.click();

    // Verify URL and Headers
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);
    await expect(page.locator('h1')).toHaveText('Video Projects');

    // Verify Tab pills
    const tabsContainer = page.getByTestId('project-view-tabs');
    await expect(tabsContainer).toBeVisible();
    const tabVideo = page.getByTestId('tab-video-projects');
    const tabShorts = page.getByTestId('tab-short-projects');
    await expect(tabVideo).toBeVisible();
    await expect(tabShorts).toBeVisible();

    // Verify Video Projects table headers
    const headers = page.locator('th');
    await expect(headers.nth(0)).toContainText('Actions');
    await expect(headers.nth(1)).toContainText('ID');
    await expect(headers.nth(2)).toContainText('Prompt / Concept');

    // 2. Switch to Short Projects tab via tab button
    await tabShorts.click();
    await expect(page).toHaveURL(/.*tab=shorts/);
    await expect(page.locator('h1')).toHaveText('Short Projects');
    await expect(page.getByTestId('add-shorts-button')).toBeVisible();

    // Verify Shorts table headers
    await expect(headers.nth(0)).toContainText('Actions');
    await expect(headers.nth(1)).toContainText('ID');
    await expect(headers.nth(2)).toContainText('Source Project');

    // 3. Switch back to Video Projects via Sidebar navigation
    await navProjects.click();
    await expect(page.locator('h1')).toHaveText('Video Projects');
    await expect(page.getByTestId('add-project-button')).toBeVisible();
  });

  test('E2E-PROJ-02: Create video project and verify rendering in table', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const uniquePrompt = `Autonomous AI Agents and Swarm Intelligence ${timestamp}`;

    // Navigate to projects
    await page.getByTestId('nav-projects').click();
    await expect(page.locator('h1')).toHaveText('Video Projects');

    // Click Add Project
    await page.getByTestId('add-project-button').click();
    await expect(page).toHaveURL(/.*project-form/);
    await expect(page.locator('h1')).toHaveText('Create New Video Project');

    // Fill Prompt
    await page.locator('textarea#project-prompt').fill(uniquePrompt);

    // Duration
    await page.locator('input#project-length').fill('4.5');

    // Select format / type
    const typeTrigger = page.getByTestId('select-type-trigger');
    await typeTrigger.click();
    await page.getByRole('option', { name: 'Full AI Generated Video' }).click();

    // Select language
    const langTrigger = page.getByTestId('select-language-trigger');
    await langTrigger.click();
    await page.getByRole('option', { name: 'English' }).click();

    // Mark as published with link
    await page.locator('button#project-is-published').click();
    const linkInput = page.getByTestId('project-published-link-input');
    await expect(linkInput).toBeVisible();
    await linkInput.fill('https://youtube.com/watch?v=sample-video-link');

    // Submit form
    await page.getByTestId('submit-project-button').click();

    // Wait for redirect to /dashboard/projects
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);
    await expect(page.locator('h1')).toHaveText('Video Projects');

    // Assert row appears in table with expected content
    const projectRow = page.locator('tr', { hasText: uniquePrompt });
    await expect(projectRow).toBeVisible();
    await expect(projectRow.getByText('Full AI Video')).toBeVisible();
    await expect(projectRow.getByText('ENGLISH • 4.5m')).toBeVisible();
    await expect(projectRow.getByText('Published')).toBeVisible();
  });

  test('E2E-PROJ-03: Edit video project and update publishing details', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const uniquePrompt = `Robotics in 2040 ${timestamp}`;

    // Create project first
    await page.getByTestId('nav-projects').click();
    await page.getByTestId('add-project-button').click();
    await page.locator('textarea#project-prompt').fill(uniquePrompt);
    await page.locator('input#project-length').fill('3.0');
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // Locate row and click edit pencil icon
    const row = page.locator('tr', { hasText: uniquePrompt });
    await expect(row).toBeVisible();
    const editBtn = row.locator('a[title="Edit Project"]');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Verify edit form loaded
    await expect(page).toHaveURL(/.*projectId=/);
    await expect(page.locator('h1')).toHaveText('Edit Video Project');

    // Update published status and link
    const publishedCheckbox = page.locator('button#project-is-published');
    await publishedCheckbox.click();
    const linkInput = page.getByTestId('project-published-link-input');
    await expect(linkInput).toBeVisible();
    await linkInput.fill('https://youtube.com/watch?v=robotics-updated');

    // Submit update
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // Verify updated status in table
    const updatedRow = page.locator('tr', { hasText: uniquePrompt });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.getByText('Published')).toBeVisible();
  });

  test('E2E-PROJ-04: Clone video project pre-fills form without saving until submit', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const sourcePrompt = `Quantum Encryption ${timestamp}`;

    // Create source project
    await page.getByTestId('nav-projects').click();
    await page.getByTestId('add-project-button').click();
    await page.locator('textarea#project-prompt').fill(sourcePrompt);
    await page.locator('input#project-length').fill('2.5');
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // Click clone button on row
    const row = page.locator('tr', { hasText: sourcePrompt });
    await expect(row).toBeVisible();
    const cloneBtn = row.locator('a[title="Clone Project"]');
    await expect(cloneBtn).toBeVisible();
    await cloneBtn.click();

    // Verify form pre-filled with (Copy)
    await expect(page).toHaveURL(/.*cloneId=/);
    await expect(page.locator('h1')).toHaveText('Clone Video Project');
    const promptInput = page.locator('textarea#project-prompt');
    await expect(promptInput).toHaveValue(`${sourcePrompt} (Copy)`);

    // Submit clone
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // Verify both original and copy are rendered
    await expect(page.locator('tr', { hasText: sourcePrompt }).first()).toBeVisible();
    await expect(page.locator('tr', { hasText: `${sourcePrompt} (Copy)` })).toBeVisible();
  });

  test('E2E-PROJ-05: Filter projects by search query', async ({ page }) => {
    const timestamp = Date.now();
    const targetPrompt = `SearchTargetAlpha ${timestamp}`;
    const otherPrompt = `SearchTargetBeta ${timestamp}`;

    // Create target project
    await page.getByTestId('nav-projects').click();
    await page.getByTestId('add-project-button').click();
    await page.locator('textarea#project-prompt').fill(targetPrompt);
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // Create other project
    await page.getByTestId('add-project-button').click();
    await page.locator('textarea#project-prompt').fill(otherPrompt);
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // Search for Alpha
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill(`SearchTargetAlpha ${timestamp}`);

    // Wait for debounced search filter
    await expect(page.locator('tr', { hasText: targetPrompt })).toBeVisible();
    await expect(page.locator('tr', { hasText: otherPrompt })).not.toBeVisible();

    // Clear search
    await page.locator('button[aria-label="Clear search"]').click();
    await expect(page.locator('tr', { hasText: targetPrompt })).toBeVisible();
    await expect(page.locator('tr', { hasText: otherPrompt })).toBeVisible();
  });

  test('E2E-PROJ-06: Create Shorts Project from Video Project row and verify in Shorts table', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const sourcePrompt = `Viral Tech News ${timestamp}`;

    // 1. Create a video project
    await page.getByTestId('nav-projects').click();
    await page.getByTestId('add-project-button').click();
    await page.locator('textarea#project-prompt').fill(sourcePrompt);
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // 2. Click the scissors action button on the project row
    const projectRow = page.locator('tr', { hasText: sourcePrompt });
    await expect(projectRow).toBeVisible();
    const createShortsBtn = projectRow.locator('a[title="Create Shorts from Project"]');
    await expect(createShortsBtn).toBeVisible();
    await createShortsBtn.click();

    // 3. Verify Shorts generation form
    await expect(page).toHaveURL(/.*shorts-form\?videoProjectId=/);
    await expect(page.locator('h1')).toHaveText('Generate Shorts Project');

    // 4. Submit shorts generation
    await page.getByTestId('submit-shorts-button').click();

    // 5. Verify redirection to Short Projects tab
    await expect(page).toHaveURL(/.*tab=shorts/);
    await expect(page.locator('h1')).toHaveText('Short Projects');

    // 6. Verify row in Short Projects table
    const shortsRow = page.locator('tr', { hasText: sourcePrompt });
    await expect(shortsRow).toBeVisible();
    await expect(shortsRow.getByText('Pending')).toBeVisible();
  });

  test('E2E-PROJ-07: Delete video project with confirmation cleanup', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const promptToDelete = `Ephemeral Project ${timestamp}`;

    // Create project
    await page.getByTestId('nav-projects').click();
    await page.getByTestId('add-project-button').click();
    await page.locator('textarea#project-prompt').fill(promptToDelete);
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    const row = page.locator('tr', { hasText: promptToDelete });
    await expect(row).toBeVisible();

    // Accept dialog
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Are you sure you want to delete this video project?');
      await dialog.accept();
    });

    // Click delete trash icon
    const deleteBtn = row.locator('button[title="Delete Project"]');
    await deleteBtn.click();

    // Assert row removed
    await expect(page.locator('tr', { hasText: promptToDelete })).not.toBeVisible();
  });

  test('E2E-PROJ-08: Click project row to open Video Project Details page and verify all tabs & 480p video', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const promptDetails = `Deep Dive Quantum Computing ${timestamp}`;

    // 1. Create project
    await page.getByTestId('nav-projects').click();
    await page.getByTestId('add-project-button').click();
    await page.locator('textarea#project-prompt').fill(promptDetails);
    await page.getByTestId('submit-project-button').click();
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);

    // 2. Locate project row and click on the prompt cell
    const row = page.locator('tr', { hasText: promptDetails });
    await expect(row).toBeVisible();
    await row.getByText(promptDetails).click();

    // 3. Verify URL navigates to /dashboard/projects/:id
    await expect(page).toHaveURL(/.*\/dashboard\/projects\/\d+/);

    // 4. Verify Project Details page header
    await expect(page.locator('h1').getByText(promptDetails)).toBeVisible();
    await expect(page.getByText(/Project #\d+/).first()).toBeVisible();

    // 5. Verify all 7 tabs are present
    const tabDetails = page.getByTestId('tab-details');
    const tabParts = page.getByTestId('tab-parts');
    const tabAssets = page.getByTestId('tab-assets');
    const tabScriptLogs = page.getByTestId('tab-script-logs');
    const tabShortsProjects = page.getByTestId('tab-shorts-projects');
    const tabShortsClips = page.getByTestId('tab-shorts-clips');
    const tabVideo480p = page.getByTestId('tab-video-480p');

    await expect(tabDetails).toBeVisible();
    await expect(tabParts).toBeVisible();
    await expect(tabAssets).toBeVisible();
    await expect(tabScriptLogs).toBeVisible();
    await expect(tabShortsProjects).toBeVisible();
    await expect(tabShortsClips).toBeVisible();
    await expect(tabVideo480p).toBeVisible();

    // 6. Test Overview Tab content
    await expect(page.getByText('Pipeline Generation Timings')).toBeVisible();
    await expect(page.getByText('Concept & Raw Input Prompt')).toBeVisible();

    // 7. Click Video Parts tab
    await tabParts.click();
    await expect(page).toHaveURL(/.*tab=parts/);
    await expect(page.getByText('Video Parts Pipeline')).toBeVisible();

    // 8. Click Part Assets tab
    await tabAssets.click();
    await expect(page).toHaveURL(/.*tab=assets/);
    await expect(page.getByText('Visual & Multimodal Assets')).toBeVisible();

    // 9. Click Script Iterations tab
    await tabScriptLogs.click();
    await expect(page).toHaveURL(/.*tab=script-logs/);
    await expect(page.getByText('Script Judge & Iteration Logs')).toBeVisible();

    // 10. Click Shorts Projects tab
    await tabShortsProjects.click();
    await expect(page).toHaveURL(/.*tab=shorts-projects/);
    await expect(page.getByText('Shorts Pipelines for Project')).toBeVisible();

    // 11. Click Short Clips tab
    await tabShortsClips.click();
    await expect(page).toHaveURL(/.*tab=shorts-clips/);
    await expect(page.getByText('Shorts Viral Clips')).toBeVisible();

    // 12. Click 480p Video Player tab
    await tabVideo480p.click();
    await expect(page).toHaveURL(/.*tab=video-480p/);
    await expect(page.getByText('Generated 480p Video Player')).toBeVisible();
    await expect(page.getByText('480p SD Base')).toBeVisible();
    await expect(page.getByText('480p Stitched Video Technical Information')).toBeVisible();
  });

  test('E2E-PROJ-08: Create video project with pre-written generatedScript and save publishedLink', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const scriptHeader = `Custom Script Mariana Trench ${timestamp}`;
    const fullScript = `${scriptHeader}\nIn the darkest depths of the ocean, biological bioluminescence lights up the abyss.`;
    const targetLink = `https://youtube.com/watch?v=ocean-${timestamp}`;

    // 1. Navigate to Projects and click Add Project
    await page.getByTestId('nav-projects').click();
    await page.getByTestId('add-project-button').click();
    await expect(page).toHaveURL(/.*project-form/);

    // 2. Select 'Provide Custom Script' mode
    const scriptModeBtn = page.getByTestId('input-mode-script-btn');
    await expect(scriptModeBtn).toBeVisible();
    await scriptModeBtn.click();

    // 3. Fill in the generatedScript textarea
    const scriptInput = page.getByTestId('project-script-input');
    await expect(scriptInput).toBeVisible();
    await scriptInput.fill(fullScript);

    // 4. Fill in Published Link
    const linkInput = page.getByTestId('project-published-link-input');
    await expect(linkInput).toBeVisible();
    await linkInput.fill(targetLink);

    // Verify checkbox auto-checks or is checked
    const publishedCheckbox = page.locator('button#project-is-published');
    await expect(publishedCheckbox).toHaveAttribute('data-state', 'checked');

    // 5. Submit form
    await page.getByTestId('submit-project-button').click();

    // 6. Assert redirection and row in table
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);
    const row = page.locator('tr', { hasText: scriptHeader });
    await expect(row).toBeVisible();
    await expect(row.getByText('Published')).toBeVisible();
  });
});
