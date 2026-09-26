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
});
