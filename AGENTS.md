# AGENTS.md

Welcome to the AI Video Frontend codebase. This document outlines the project architecture, operational rules, coding standards, design system conventions, and development practices that all AI agents and contributors must follow.

---

## 1. Project Overview & Architecture

- **Project Type**: Base React front-end application built with Vite, TypeScript, Tailwind CSS, Redux Toolkit, and TanStack React Query.
- **Backend Service**: Connects to the backend server running locally on **`http://localhost:6001`** (configured via `src/services/index.ts` and `src/constants/constants.ts`).
- **Frontend Dev Server**: Runs on port **`http://localhost:6003`** (configured in `vite.config.ts`).
- **Backend Swagger API Spec**: **`http://localhost:6001/api/docs.json`** (OpenAPI 3.0.3 specification for debugging, payload contracts, and endpoint verification).
- **Core Purpose**: Provides a clean, modern dashboard interface for AI creator persona workflows, video creation pipelines, template management, and team-based actions.

---

## 2. Authentication & Authorization Principles

Always enforce and follow the authentication flow across all routes and API requests:

1. **Auth Flows**:
   - **Sign Up**: `src/pages/Signup.tsx` & `src/components/auth/SignupForm.tsx` (`/signup`) -> `POST /api/auth/signup` (`{ name, email, password, phoneNumber? }`)
   - **Login**: `src/pages/Login.tsx` & `src/components/auth/LoginForm.tsx` (`/login`) -> `POST /api/auth/login` (`{ email, password }` -> returns `{ message, token, user }`)
   - **Email Verification**: `src/pages/VerifyEmailPage.tsx` (`/auth/verifyEmail`) -> `POST /api/auth/verify` (`{ token }`) or `GET /api/auth/verify?token=...`
   - **Current User Profile**: Fetched on app mount via `getUserData(token)` in `src/App.tsx` -> `GET /api/auth/me` with `Authorization: Bearer <token>`
   - **Swagger JSON API Schema**: Keep `http://localhost:6001/api/docs.json` as the ground truth reference for all endpoint contracts.

2. **State & Cookies**:
   - Auth token and user profile are managed in Redux (`authSlice` in `src/store/auth/authSlice.ts`).
   - Tokens are persisted in cookies using `COOKIE_NAMES.TOKEN`.
   - `apiFetch` in `src/services/index.ts` automatically attaches the bearer token via Axios request interceptors.
   - Always clear both Redux auth state and cookies upon logout or 401 unauthenticated responses.

3. **Protected Routes**:
   - All internal pages must reside within `/dashboard` and be wrapped by `<ProtectedRoutes>` (`src/components/ProtectedRoutes.tsx`).
   - Unauthenticated users must be redirected to `/login` with the attempted location preserved in route state.
   - Landing on `/dashboard` directly presents the Persona management view.

---

## 3. Core Features & Persona CRUD Architecture

The application uses an OpenAPI-aligned **Persona Management** system with generic, highly reusable data-table, search/filtering, and pagination primitives:

- **Dashboard Landing & Listing**:
  - Route: `/dashboard` and `/dashboard/personas` (`src/pages/PersonaPage.tsx`)
  - Component: `PersonaDataTable` (`src/components/dashboard/persona/PersonaDataTable.tsx`)
  - Generic Foundation: `DataTable`, `DataTablePagination`, and `DataTableFilterBar` in `src/components/common/`
  - Query: `useGetPersonasQuery` (`src/queries/personaQueries.ts`) -> `GET /api/personas?page=X&limit=Y`
  - Left-Aligned Action: Every row has an edit pencil button on the far left that links to `/dashboard/persona-form?personaId=<id>`.
- **Create Persona**:
  - Route: `/dashboard/persona-form` (`src/pages/PersonaFormPage.tsx`)
  - Form: `PersonaForm` (`src/components/dashboard/personaForm/index.tsx`)
  - Mutation: `useCreatePersonaMutation` (`src/queries/personaActions.ts`) -> `POST /api/personas`
  - Fields: `name` (required), `topics` (required string array), and optional multimodal DNA paths (`characterSheetPath`, `headPicturePath`, `referenceAudioPath`, `writingDnaPath`, `visualDnaPath`, `scriptPromptPath`, `videoPromptPath`, `scriptJudgePath`). Empty strings are omitted so backend validation passes cleanly.
- **Clone Persona**:
  - Route: `/dashboard/persona-form?cloneId=<ID>` (`src/pages/PersonaFormPage.tsx`)
  - Behavior: Clicking the clone copy icon on the row opens the Persona form pre-filled with the source persona's details (name suffixed with `(Copy)`, topics, asset paths) without making any mutations to the database. The persona is only saved when the user clicks "Create Persona" (`POST /api/personas`).
- **Update / Edit Persona**:
  - Route: `/dashboard/persona-form?personaId=<ID>` (`src/pages/PersonaFormPage.tsx`)
  - Single Item Query: `useGetPersonaQuery` (`src/queries/personaQueries.ts`) -> `GET /api/personas/:id`
  - Mutation: `useUpdatePersonaMutation` (`src/queries/personaActions.ts`) -> `PATCH /api/personas/:id`
- **Delete Persona**:
  - Mutation: `useDeletePersonaMutation` (`src/queries/personaActions.ts`) -> `DELETE /api/personas/:id`
- **Cache Invalidation & Feedback**:
  - Mutations automatically invalidate `['personas']` in TanStack Query and display instant toast notifications via `react-hot-toast`.

When creating new entity features (Projects, Shorts, Teams), reuse the `DataTable`, `DataTablePagination`, `DataTableFilterBar`, and `useDataTableFilters` hooks from `src/components/common/` and `src/hooks/useDataTableFilters.ts`.

---

## 4. Design System & Dashboard Guidelines

All UI development must strictly adhere to the project's design system:

1. **Dashboard Simplicity**:
   - Keep the design **simple, functional, minimal, and clean** as a dashboard.
   - Avoid visual clutter, distracting decorations, or overly complex layouts.
   - Ensure clear visual hierarchy, consistent padding/spacing, and scannable data tables.

2. **Component Primitives**:
   - Reuse existing UI components from `src/components/ui/` (`Button`, `Input`, `Label`, `Checkbox`, `Select`, `Table`, `Badge`, `Textarea`).
   - Do **NOT** reinvent or create duplicate primitives if an existing component can be used or extended.
   - Follow the Radix UI + Shadcn UI conventions configured in `components.json`.

3. **Styling & Color Tokens**:
   - Use Tailwind CSS utility classes mapped to CSS variables in `src/styles/global.css`.
   - **Primary Palette**: Purple shades (`--primary-50` through `--primary-900`, main `--primary-600: #7f56d9`).
   - **Neutrals**: Tailwind gray scale (`--gray-25` through `--gray-900`).
   - **Status Colors**: Error (`--error-500: #f04438`), Warning (`--warning-500`), Success (`--success-500`).
   - Do **not** use arbitrary hex codes or disconnected color palettes in inline styles or ad-hoc classes.

---

## 5. Code Reusability & Minimalist Principles

- **DRY (Don't Repeat Yourself)**:
  - Check CodeGraph first before writing any new code to verify if existing utilities, hooks, or components already exist.
  - Reuse table and filtering components from `src/components/common/`.
  - Reuse hooks from `src/hooks/` (`useDataTableFilters`, `useResponsive`, `useAuthForms`).
  - Reuse utility functions from `src/utils/utils.ts` (date formatting, cookie helpers, error parsers).
  - Reuse API services from `src/services/` and TanStack Query definitions from `src/queries/`.
- **Separation of Concerns**:
  - **Redux Toolkit (`src/store/`)**: Exclusively for global client state (e.g., authentication, user session).
  - **TanStack React Query (`src/queries/`)**: For all server state, caching, data fetching, and mutations.
  - **Components (`src/components/`)**: Keep presentation logic decoupled from business/data-fetching logic where practical.
- **Type Safety**:
  - Store TypeScript interfaces and types in `src/types/` (`src/types/persona.ts`, `src/types/common.ts`, `src/types/auth/`).
  - Do not use `any` unless strictly necessary.

---

## 6. End-to-End Testing (Playwright)

The project includes an automated end-to-end test suite powered by Playwright to verify full user journeys:

1. **Testing Strategy Document**:
   - Detailed in [`PLAYWRIGHT_E2E_STRATEGY.md`](./PLAYWRIGHT_E2E_STRATEGY.md).
2. **Dedicated Test User Policy & Critical Data Isolation**:
   - **CRITICAL / NEVER USE USER 1 OR TEAM 1**: Never use User 1 or Team 1 for testing or development experiments under any circumstances. User 1 and Team 1 contain critical data of an actual user. All testing must strictly isolate test data from real user workspaces.
   - **Email**: `e2e-tester@example.com`
   - **Password**: `Password123!`
   - Always use this verified user (User ID 27 / Team ID 27) in all tests and verification steps.
3. **Test Specs Location**:
   - Tests reside in `e2e/` (e.g. `e2e/persona.spec.ts`, `e2e/auth.setup.ts`).
4. **Running Tests**:
   - `npm run test:e2e` or `npx playwright test`

---

## 7. CodeGraph Guidelines: Mandatory Usage & Maintenance

This project uses **CodeGraph** (`.codegraph/`) to maintain an indexed knowledge graph of symbols, dependencies, and call hierarchies. AI agents and contributors must follow a **CodeGraph-First** approach:

1. **Mandatory Planning & Code Discovery (Always Use CodeGraph First)**:
   - **When Planning Any Task or Feature**: Before creating an implementation plan, formulating changes, or answering architectural questions, use CodeGraph to explore the relevant areas, find established conventions, and trace execution flows.
   - **When Looking for Functions, Components, or Types**: Do **NOT** perform blind grep or traverse files manually. Use CodeGraph as your primary discovery tool to locate existing functions, hooks, interfaces, queries, and components.
   - **MCP Tool**: Call `codegraph_explore` with a natural language query or symbol names.
   - **CLI Commands**:
     - Explore a symbol or area: `codegraph explore <symbol_or_query>`
     - Search indexed symbols: `codegraph search <query>`

2. **Impact & Dependency Analysis Before Edits**:
   - Before modifying, renaming, or deleting any function, component, or type, use CodeGraph to inspect all callers and dependent modules:
     ```bash
     codegraph callers <symbol>
     codegraph callees <symbol>
     ```

3. **Keeping CodeGraph Up to Date (Syncing Changes)**:
   - Whenever you create, modify, rename, or delete files, components, functions, or types, **immediately sync CodeGraph**:
     ```bash
     codegraph sync
     ```
   - For extensive structural changes, dependency updates, or branch changes, re-index:
     ```bash
     codegraph index
     ```
   - Check index freshness and node statistics:
     ```bash
     codegraph status
     ```

---

## 8. Directory Structure Reference

```
AI-vid-frontend/
├── .codegraph/               # CodeGraph SQLite index and metadata
├── e2e/                      # Playwright E2E test specs and setup
│   ├── auth.setup.ts         # Test authentication helper
│   └── persona.spec.ts       # Persona CRUD & table interaction tests
├── src/
│   ├── assets/               # Static assets, SVGs, and images
│   ├── components/
│   │   ├── auth/             # Login, Signup, and Auth form components
│   │   ├── common/           # Generic DataTable, Pagination, FilterBar
│   │   ├── dashboard/        # Dashboard modules (persona, personaForm)
│   │   ├── layout/           # Dashboard layout, Navbar, Sidebar
│   │   ├── ui/               # Reusable UI primitives (Button, Input, Select, Table...)
│   │   └── ProtectedRoutes.tsx # Route guard for authenticated views
│   ├── constants/            # Regex patterns, cookie keys, and API paths
│   ├── hooks/                # Custom React hooks (useDataTableFilters, etc.)
│   ├── lib/                  # Library helpers (clsx, tailwind-merge)
│   ├── pages/                # Top-level page views (PersonaPage, PersonaFormPage, etc.)
│   ├── queries/              # TanStack Query hooks and mutation actions
│   ├── services/             # Axios instances and API request functions
│   ├── store/                # Redux store and slices (authSlice)
│   ├── styles/               # global.css and Tailwind design tokens
│   ├── types/                # TypeScript models (persona.ts, common.ts, userType.ts)
│   ├── utils/                # Helper utilities and cookie handling
│   ├── App.tsx               # Root routing and query provider setup
│   └── main.tsx              # Application entry point
├── PLAYWRIGHT_E2E_STRATEGY.md# Playwright E2E testing strategy & scenario matrix
├── playwright.config.ts      # Playwright test runner configuration
├── components.json           # Shadcn UI configuration
├── tailwind.config.js        # Tailwind CSS configuration with design system tokens
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite build configuration (Port 6003)
```

---

## 9. Common Commands

- **Development Server**: `npm run dev` / `yarn dev` (runs Vite dev server on port 6003)
- **Type Check & Build**: `npm run build`
- **Linting**: `npm run lint`
- **E2E Testing**: `npm run test:e2e` (runs Playwright tests)
- **CodeGraph Synchronization**: `codegraph sync`
