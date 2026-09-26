# Playwright End-to-End (E2E) Testing Strategy

This document outlines the end-to-end testing strategy, environment setup, isolated test credentials, and test specifications for the AI Video Frontend application.

---

## 1. Objectives & Scope

The purpose of the Playwright E2E suite is to guarantee complete end-user workflow fidelity across authentication, dashboard navigation, and core Persona management:
- **Authentication**: Logging in, token persistence in cookies and Redux, session restoration on refresh.
- **Dashboard Landing**: Verifying that navigating to `/dashboard` immediately lands the user on the Personas management view.
- **Persona Data Table**: Verifying tabular rendering, columns, topic badges, configured asset summaries, and left-aligned row actions.
- **Persona Creation**: End-to-end form fill, dynamic topic addition, submission (`POST /api/personas`), toast feedback, and immediate reflection in the table.
- **Filtering & Search**: Real-time debounced client-side and server-side search by persona name and topic tags.
- **Pagination**: Verifying rows-per-page selection, previous/next controls, page indicator, and empty state rendering.
- **Persona Editing**: Verifying that the pencil action on the left navigates to `/dashboard/persona-form?personaId=<id>`, loads existing persona data, allows modification, and triggers update handling.
- **Persona Cleanup / Deletion**: Deleting test personas so each test run leaves the environment clean.

---

## 2. Environment & Service Ports

| Service | URL / Port | Role |
| :--- | :--- | :--- |
| **Frontend Application** | `http://localhost:6003` | Vite development server (`yarn dev` / `npm run dev`) |
| **Backend REST API** | `http://localhost:6001` | Express REST API server (`npm run dev:api`) |
| **Swagger OpenAPI Spec** | `http://localhost:6001/api/docs.json` | Ground truth contract for API payloads and parameters |

---

## 3. Isolated Test User Credential

To prevent pollution or corruption of existing user records or project data, all E2E tests strictly use the dedicated sample test user:

- **Email**: `e2e-tester@example.com`
- **Password**: `Password123!`
- **Role**: Standard verified tenant user with auto-provisioned Team.
- **Verification**: Verified via the backend's email verification flow (`GET /api/auth/verify?token=...`).

---

## 4. Test Suite Architecture

```
AI-vid-frontend/
├── playwright.config.ts        # Playwright test runner configuration
├── e2e/
│   ├── auth.setup.ts           # Shared authentication helpers / login helper
│   └── persona.spec.ts         # Persona CRUD, table, filtering & pagination specs
└── PLAYWRIGHT_E2E_STRATEGY.md  # Strategy and guidelines document
```

### Key Architectural Guidelines
1. **Deterministic State**: Tests create their own test data (e.g. `E2E Persona Alpha`) with timestamps, assert on them, and clean them up.
2. **Resilience & Selectors**:
   - Use semantic roles (`getByRole`), labels (`getByLabel`), text (`getByText`), and explicit `data-testid` attributes (`data-testid="add-persona-button"`, `data-testid="edit-persona-<id>"`).
   - Avoid brittle CSS selectors or absolute coordinates.
3. **No Flakiness on Network Delays**:
   - Rely on Playwright auto-waiting (`waitForResponse`, `toBeVisible()`) rather than arbitrary `sleep` timeouts.

---

## 5. Test Scenarios Matrix

| Scenario ID | Test Case | Assertions |
| :--- | :--- | :--- |
| **E2E-01** | Login & Dashboard Landing | Navigates to `/login`, fills credentials, redirects to `/dashboard`, verifies `Personas` heading and table are visible. |
| **E2E-02** | Add Persona Workflow | Clicks "Add Persona", fills name (`E2E Test Creator`) and topics (`AI`, `Automation`), submits form, verifies success toast, verifies redirect to `/dashboard`, verifies new row appears. |
| **E2E-03** | Left Action & Edit Flow | Locates the pencil icon on the far left column of a persona row, clicks it, verifies navigation to `/dashboard/persona-form?personaId=X`, verifies form fields are pre-filled. |
| **E2E-04** | Search & Filter | Types query in the search bar, verifies matching personas remain visible while non-matching personas are excluded. Clears search and verifies list restores. |
| **E2E-05** | Pagination Controls | Creates multiple records (or inspects existing), switches rows per page, toggles next/prev pages, verifies entry counts (`Showing X to Y of Z`). |
| **E2E-06** | Cleanup / Deletion | Clicks delete icon on created test personas, handles browser confirmation dialog, verifies row is removed from table. |

---

## 6. Running Playwright Tests

```bash
# Run the entire E2E suite in headless mode
npx playwright test

# Run specifically the persona spec
npx playwright test e2e/persona.spec.ts

# Run with interactive UI mode
npx playwright test --ui

# View HTML test execution report
npx playwright show-report
```
