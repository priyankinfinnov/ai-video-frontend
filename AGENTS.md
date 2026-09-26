# AGENTS.md

Welcome to the AI Video Frontend codebase. This document outlines the project architecture, operational rules, coding standards, design system conventions, and development practices that all AI agents and contributors must follow.

---

## 1. Project Overview & Architecture

- **Project Type**: Base React front-end application built with Vite, TypeScript, Tailwind CSS, Redux Toolkit, and TanStack React Query.
- **Backend Service**: Connects to the backend server running locally on **`http://localhost:6001`** with the API base prefix `/dashapi/v1` (configured via `src/services/index.ts` and `src/constants/constants.ts`).
- **Core Purpose**: Provides a clean, modern dashboard interface for video creation workflows, template management, and team-based actions.

---

## 2. Authentication & Authorization Principles

Always enforce and follow the authentication flow across all routes and API requests:

1. **Auth Flows**:
   - **Sign Up**: `src/pages/Signup.tsx` & `src/components/auth/SignupForm.tsx` (`/signup`)
   - **Login**: `src/pages/Login.tsx` & `src/components/auth/LoginForm.tsx` (`/login`)
   - **Email Verification**: `src/pages/VerifyEmailPage.tsx` (`/auth/verifyEmail`)
   - **Current User Profile**: Fetched on app mount via `getUserData(token)` in `src/App.tsx` (`/dashapi/v1/users/me`)

2. **State & Cookies**:
   - Auth token and user profile are managed in Redux (`authSlice` in `src/store/auth/authSlice.ts`).
   - Tokens are persisted in cookies using `COOKIE_NAMES.TOKEN`.
   - Always clear both Redux auth state and cookies upon logout or 401 unauthenticated responses.

3. **Protected Routes**:
   - All internal pages must reside within `/dashboard` and be wrapped by `<ProtectedRoutes>` (`src/components/ProtectedRoutes.tsx`).
   - Unauthenticated users must be redirected to `/login` with the attempted location preserved in route state.
   - Every API request requiring authorization must include the header:
     ```ts
     headers: {
       Authorization: `Bearer ${token}`,
     }
     ```

---

## 3. Core Features & Call Template CRUD

The application includes a standard template management system demonstrating full front-end CRUD operations:

- **List / Read**:
  - Route: `/dashboard/call-template` (`src/pages/CallTemplatePage.tsx`)
  - Component: `CallTemplateDataTable` using `@tanstack/react-table`
  - Query: `useGetAllCallTemplateQuery` (`src/queries/callTemplateQueries.ts`)
- **Create**:
  - Route: `/dashboard/call-template-form` (`src/pages/CallTemplateFormPage.tsx`)
  - Form: `CallTemplateForm` (`src/components/dashboard/callTemplateForm/index.tsx`)
  - Mutation: `useCreateCallTemplateMutation` (`src/queries/callTemplateActions.ts`)
- **Update / Edit**:
  - Route: `/dashboard/call-template-form?callTemplateId=<ID>`
  - Single Item Query: `useGetCallTemplateQuery`
  - Mutation: `useUpdateCallTemplateMutation` (`src/queries/callTemplateActions.ts`)
- **Mutation & Cache Invalidation**:
  - Always invalidate or refetch relevant queries via `queryClient.refetchQueries([...])` after mutations (create, update, delete).
  - Provide immediate user feedback using `react-hot-toast`.

When creating new features, follow this exact pattern for consistent CRUD operations and data synchronisation.

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
  - Reuse hooks from `src/hooks/` (`useResponsive`, `useAuthForms`, etc.).
  - Reuse utility functions from `src/utils/utils.ts` (date formatting, cookie helpers, error parsers).
  - Reuse API services from `src/services/` and TanStack Query definitions from `src/queries/`.
- **Separation of Concerns**:
  - **Redux Toolkit (`src/store/`)**: Exclusively for global client state (e.g., authentication, user session).
  - **TanStack React Query (`src/queries/`)**: For all server state, caching, data fetching, and mutations.
  - **Components (`src/components/`)**: Keep presentation logic decoupled from business/data-fetching logic where practical.
- **Type Safety**:
  - Store TypeScript interfaces and types in `src/types/` (e.g., `src/types/auth/`, `src/types/callTemplate/`).
  - Do not use `any` unless strictly necessary.

---

## 6. CodeGraph Guidelines: Mandatory Usage & Maintenance

This project uses **CodeGraph** (`.codegraph/`) to maintain an indexed knowledge graph of symbols, dependencies, and call hierarchies. AI agents and contributors must follow a **CodeGraph-First** approach:

1. **Mandatory Planning & Code Discovery (Always Use CodeGraph First)**:
   - **When Planning Any Task or Feature**: Before creating an implementation plan, formulating changes, or answering architectural questions, use CodeGraph to explore the relevant areas, find established conventions, and trace execution flows.
   - **When Looking for Functions, Components, or Types**: Do **NOT** perform blind grep or traverse files manually. Use CodeGraph as your primary discovery tool to locate existing functions, hooks, interfaces, queries, and components.
   - **MCP Tool**: Call `codegraph_explore` with a natural language query or symbol names (e.g. `"useAuthForms"`, `"call template form submission"`, `"protected route redirect"`). It returns verbatim source code and call paths in a single efficient call.
   - **CLI Commands**:
     - Explore a symbol or area:
       ```bash
       codegraph explore <symbol_or_query>
       ```
     - Search indexed symbols:
       ```bash
       codegraph search <query>
       ```

2. **Impact & Dependency Analysis Before Edits**:
   - Before modifying, renaming, or deleting any function, component, or type, use CodeGraph to inspect all callers and dependent modules to prevent breaking changes or regressions:
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

## 7. Directory Structure Reference

```
AI-vid-frontend/
├── .codegraph/               # CodeGraph SQLite index and metadata
├── src/
│   ├── assets/               # Static assets, SVGs, and images
│   ├── components/
│   │   ├── auth/             # Login, Signup, and Auth form components
│   │   ├── dashboard/        # Feature modules (CallTemplate, CallTemplateForm, etc.)
│   │   ├── layout/           # Dashboard layout, Navbar, Sidebar
│   │   ├── ui/               # Reusable UI primitives (Button, Input, Select, Table...)
│   │   └── ProtectedRoutes.tsx # Route guard for authenticated views
│   ├── constants/            # Regex patterns, cookie keys, and API paths
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Library helpers (e.g., clsx/tailwind-merge utils)
│   ├── pages/                # Top-level page views and route elements
│   ├── queries/              # TanStack Query hooks and mutation actions
│   ├── services/             # Axios instances and API request functions
│   ├── store/                # Redux store and slices (authSlice)
│   ├── styles/               # global.css and Tailwind design tokens
│   ├── types/                # TypeScript models and interfaces
│   ├── utils/                # Helper utilities and cookie handling
│   ├── App.tsx               # Root routing and query provider setup
│   └── main.tsx              # Application entry point
├── components.json           # Shadcn UI configuration
├── tailwind.config.js        # Tailwind CSS configuration with design system tokens
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite build configuration
```

---

## 8. Common Commands

- **Development Server**: `npm run dev` (runs Vite dev server)
- **Type Check & Build**: `npm run build`
- **Linting**: `npm run lint`
- **CodeGraph Synchronization**: `codegraph sync`
