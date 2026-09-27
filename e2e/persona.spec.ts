import { test, expect } from '@playwright/test';
import { loginTestUser } from './auth.setup';

test.describe('Persona Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await loginTestUser(page);
  });

  test('E2E-01: Landing on dashboard directly displays Persona table and controls', async ({
    page,
  }) => {
    // Assert URL is /dashboard
    await expect(page).toHaveURL(/\/dashboard\/?$/);

    // Assert Title and Subtitle
    await expect(page.locator('h1')).toHaveText('Personas');
    await expect(
      page.getByText('Manage AI creator personas, writing DNA, voice models, and video styles.')
    ).toBeVisible();

    // Assert Add Persona button
    const addButton = page.getByTestId('add-persona-button');
    await expect(addButton).toBeVisible();

    // Assert Table Headers
    const headers = page.locator('th');
    await expect(headers.nth(0)).toContainText('Actions');
    await expect(headers.nth(1)).toContainText('ID');
    await expect(headers.nth(2)).toContainText('Persona Name');
    await expect(headers.nth(3)).toContainText('Topics');
  });

  test('E2E-02: Create persona with topics and verify in table', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const uniquePersonaName = `Tech Sage ${timestamp}`;

    // Click Add Persona
    await page.getByTestId('add-persona-button').click();
    await expect(page).toHaveURL(/.*persona-form/);
    await expect(page.locator('h1')).toHaveText('Create New Persona');

    // Fill Name
    await page.locator('input#persona-name').fill(uniquePersonaName);

    // Add Topics
    const topicInput = page.locator('input#persona-topics');
    await topicInput.fill('Deep Learning');
    await page.getByRole('button', { name: 'Add Topic' }).click();

    await topicInput.fill('Robotics');
    await page.getByRole('button', { name: 'Add Topic' }).click();

    // Verify topic badges added in form preview
    await expect(page.getByText('Deep Learning')).toBeVisible();
    await expect(page.getByText('Robotics')).toBeVisible();

    // Fill optional asset paths
    await page.locator('input#characterSheetPath').fill('/assets/personas/sage_sheet.png');
    await page.locator('input#referenceAudioPath').fill('/assets/audio/sage_voice.wav');

    // Submit form
    await page.getByRole('button', { name: 'Create Persona' }).click();

    // Wait for redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');

    // Assert that the newly created persona is rendered in the table
    const personaRow = page.locator('tr', { hasText: uniquePersonaName });
    await expect(personaRow).toBeVisible();
    await expect(personaRow.getByText('Deep Learning')).toBeVisible();
    await expect(personaRow.getByText('Robotics')).toBeVisible();
  });

  test('E2E-03: Left action pencil navigates to Edit Persona form with pre-filled data', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const personaToEdit = `Edit Target ${timestamp}`;

    // Create a persona first
    await page.getByTestId('add-persona-button').click();
    await page.locator('input#persona-name').fill(personaToEdit);
    await page.locator('input#persona-topics').fill('Neural Networks');
    await page.getByRole('button', { name: 'Add Topic' }).click();
    await page.getByRole('button', { name: 'Create Persona' }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');

    // Find the row containing this persona
    const row = page.locator('tr', { hasText: personaToEdit });
    await expect(row).toBeVisible();

    // In this row, click the edit button (pencil icon in the left actions column)
    const editBtn = row.locator('a[title="Edit Persona"]');
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    // Assert navigation to persona-form with query parameter
    await expect(page).toHaveURL(/.*persona-form\?personaId=\d+/);
    await expect(page.locator('h1')).toHaveText('Edit Persona');

    // Assert pre-filled form fields
    const nameInput = page.locator('input#persona-name');
    await expect(nameInput).toHaveValue(personaToEdit);
    await expect(page.getByText('Neural Networks')).toBeVisible();

    // Click back to personas
    await page.getByText('Back to Personas').click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');
  });

  test('E2E-04: Filter personas by search query', async ({ page }) => {
    const timestamp = Date.now();
    const targetName = `UniqueSearchTerm ${timestamp}`;

    // Create a uniquely identifiable persona
    await page.getByTestId('add-persona-button').click();
    await page.locator('input#persona-name').fill(targetName);
    await page.locator('input#persona-topics').fill('SearchTopic');
    await page.getByRole('button', { name: 'Add Topic' }).click();
    await page.getByRole('button', { name: 'Create Persona' }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');

    const searchInput = page.getByPlaceholder('Search personas by name or topic...');
    await expect(searchInput).toBeVisible();

    // Type the unique search query
    await searchInput.fill(targetName);

    // Verify row is present
    await expect(page.getByText(targetName)).toBeVisible();

    // Type a query that matches nothing
    await searchInput.fill('NonExistentTermZ99XYZ');
    await expect(page.getByText('No personas found')).toBeVisible();

    // Clear search
    await page.locator('button[aria-label="Clear search"]').click();
    await expect(page.getByText(targetName)).toBeVisible();
  });

  test('E2E-05: Pagination controls and rows per page', async ({ page }) => {
    // Assert pagination elements
    await expect(page.getByText(/Showing \d+ to \d+ of \d+ results/)).toBeVisible();
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();

    // Check Previous/Next button presence
    const prevBtn = page.getByRole('button', { name: 'Previous Page' });
    const nextBtn = page.getByRole('button', { name: 'Next Page' });
    await expect(prevBtn).toBeVisible();
    await expect(nextBtn).toBeVisible();
  });

  test('E2E-06: Delete persona cleanup flow', async ({ page }) => {
    const timestamp = Date.now();
    const personaToDelete = `DeleteMe ${timestamp}`;

    // Create persona
    await page.getByTestId('add-persona-button').click();
    await page.locator('input#persona-name').fill(personaToDelete);
    await page.locator('input#persona-topics').fill('Ephemeral');
    await page.getByRole('button', { name: 'Add Topic' }).click();
    await page.getByRole('button', { name: 'Create Persona' }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');

    const row = page.locator('tr', { hasText: personaToDelete });
    await expect(row).toBeVisible();

    // Setup dialog handler for window.confirm
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('Are you sure you want to delete this persona?');
      await dialog.accept();
    });

    // Click delete button
    const deleteBtn = row.locator('button[title="Delete Persona"]');
    await deleteBtn.click();

    // Verify persona is removed
    await expect(page.getByText(personaToDelete)).not.toBeVisible();
  });

  test('E2E-07: Clone action pre-fills form and only creates on submit', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const sourcePersonaName = `Source For Clone ${timestamp}`;
    const clonedPersonaName = `Cloned Custom ${timestamp}`;

    // 1. Create a source persona
    await page.getByTestId('add-persona-button').click();
    await page.locator('input#persona-name').fill(sourcePersonaName);
    await page.locator('input#persona-topics').fill('Generative AI');
    await page.getByRole('button', { name: 'Add Topic' }).click();
    await page.locator('input#characterSheetPath').fill('/assets/personas/source_sheet.png');
    await page.getByRole('button', { name: 'Create Persona' }).click();

    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');

    // 2. Locate source row and click the Clone button
    const sourceRow = page.locator('tr', { hasText: sourcePersonaName });
    await expect(sourceRow).toBeVisible();

    const cloneBtn = sourceRow.locator('a[title="Clone Persona"]');
    await expect(cloneBtn).toBeVisible();
    await cloneBtn.click();

    // 3. Assert navigation to persona-form with ?cloneId= parameter
    await expect(page).toHaveURL(/.*persona-form\?cloneId=\d+/);
    await expect(page.locator('h1')).toHaveText('Clone Persona');

    // 4. Assert form is pre-filled with source persona details
    const nameInput = page.locator('input#persona-name');
    await expect(nameInput).toHaveValue(`${sourcePersonaName} (Copy)`);
    await expect(page.getByText('Generative AI')).toBeVisible();
    await expect(page.locator('input#characterSheetPath')).toHaveValue(
      '/assets/personas/source_sheet.png'
    );

    // 5. Customize the name before creating
    await nameInput.fill(clonedPersonaName);

    // 6. Submit the form to create the clone
    await page.getByRole('button', { name: 'Create Persona' }).click();

    // 7. Verify redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');

    // 8. Verify BOTH original and cloned personas exist in the table
    const originalRowAfter = page.locator('tr', { hasText: sourcePersonaName });
    const clonedRowAfter = page.locator('tr', { hasText: clonedPersonaName });
    await expect(originalRowAfter).toBeVisible();
    await expect(clonedRowAfter).toBeVisible();

    // 9. Clean up both created personas
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const originalDeleteBtn = originalRowAfter.locator('button[title="Delete Persona"]');
    await originalDeleteBtn.click();
    await expect(page.getByText(sourcePersonaName)).not.toBeVisible();

    const clonedDeleteBtn = clonedRowAfter.locator('button[title="Delete Persona"]');
    await clonedDeleteBtn.click();
    await expect(page.getByText(clonedPersonaName)).not.toBeVisible();
  });

  test('E2E-08: Clicking persona row opens Persona Details page with 5 tabs', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const detailsPersonaName = `Details Persona ${timestamp}`;

    // 1. Create a persona with full asset paths
    await page.getByTestId('add-persona-button').click();
    await page.locator('input#persona-name').fill(detailsPersonaName);
    await page.locator('input#persona-topics').fill('Quantum AI');
    await page.getByRole('button', { name: 'Add Topic' }).click();

    await page.locator('input#characterSheetPath').fill('/assets/personas/quantum_sheet.png');
    await page.locator('input#referenceAudioPath').fill('/assets/audio/quantum_voice.mp3');
    await page.locator('input#writingDnaPath').fill('/assets/prompts/quantum_writing_dna.txt');
    await page.locator('input#visualDnaPath').fill('/assets/prompts/quantum_visual_dna.txt');
    await page.locator('input#scriptPromptPath').fill('/assets/prompts/quantum_script_prompt.txt');
    await page.locator('input#videoPromptPath').fill('/assets/prompts/quantum_video_prompt.txt');
    await page.locator('input#scriptJudgePath').fill('/assets/prompts/quantum_judge.prompt');

    await page.getByRole('button', { name: 'Create Persona' }).click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.locator('h1')).toHaveText('Personas');

    // 2. Locate the row and click on it (testing row click navigation)
    const row = page.locator('tr', { hasText: detailsPersonaName });
    await expect(row).toBeVisible();
    await row.click();

    // 3. Verify navigation to /dashboard/personas/:id
    await expect(page).toHaveURL(/\/dashboard\/personas\/\d+/);

    // 4. Assert Persona Details page elements
    await expect(page.locator('h1')).toHaveText(detailsPersonaName);
    await expect(page.getByText('#Quantum AI')).toBeVisible();

    // 5. Verify all 5 tab buttons exist
    const tabDetails = page.getByTestId('tab-details');
    const tabScript = page.getByTestId('tab-script-files');
    const tabVisual = page.getByTestId('tab-visual-files');
    const tabSheet = page.getByTestId('tab-character-sheet');
    const tabJudge = page.getByTestId('tab-script-judge');

    await expect(tabDetails).toBeVisible();
    await expect(tabScript).toBeVisible();
    await expect(tabVisual).toBeVisible();
    await expect(tabSheet).toBeVisible();
    await expect(tabJudge).toBeVisible();

    // 6. Test Script Files tab
    await tabScript.click();
    await expect(page).toHaveURL(/.*tab=script-files/);
    await expect(page.getByText('Script Related Files')).toBeVisible();
    await expect(page.getByText('/assets/prompts/quantum_writing_dna.txt')).toBeVisible();
    await expect(page.getByText('/assets/prompts/quantum_script_prompt.txt')).toBeVisible();

    // 7. Test Visual Files tab
    await tabVisual.click();
    await expect(page).toHaveURL(/.*tab=visual-files/);
    await expect(page.getByText('Visual Related Files & Assets')).toBeVisible();
    await expect(page.getByText('/assets/prompts/quantum_visual_dna.txt')).toBeVisible();
    await expect(page.getByText('/assets/prompts/quantum_video_prompt.txt')).toBeVisible();

    // 8. Test Character Sheet tab
    await tabSheet.click();
    await expect(page).toHaveURL(/.*tab=character-sheet/);
    await expect(page.getByText('Character Sheet Image')).toBeVisible();
    await expect(page.getByText('/assets/personas/quantum_sheet.png')).toBeVisible();

    // 9. Test Script Judge tab
    await tabJudge.click();
    await expect(page).toHaveURL(/.*tab=script-judge/);
    await expect(page.getByText('Script Judge File')).toBeVisible();
    await expect(page.getByText('/assets/prompts/quantum_judge.prompt')).toBeVisible();

    // 10. Test Back to Personas breadcrumb
    await page.getByText('Personas', { exact: true }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/personas\/?$/);

    // 11. Cleanup test persona
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    const cleanupRow = page.locator('tr', { hasText: detailsPersonaName });
    await cleanupRow.locator('button[title="Delete Persona"]').click();
    await expect(page.getByText(detailsPersonaName)).not.toBeVisible();
  });
});
