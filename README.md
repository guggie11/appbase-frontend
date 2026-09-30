# appbase-frontend

[![CI Frontend](https://github.com/guggie11/appbase-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/guggie11/appbase-frontend/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6.svg)](https://typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../LICENSE)

The React frontend for [Appbase](https://github.com/guggie11/appbase-infrastructure) — a production-ready boilerplate for internal admin applications.

Built with React 19, TypeScript 6, and Feature-Sliced Design (FSD). Fully typed API client generated from OpenAPI. Ships with unit tests (Vitest) and E2E tests (Playwright).

---

## Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool & dev server |
| TailwindCSS | 4 | Utility-first styling |
| TanStack Query | 5 | Server state, caching, mutations |
| TanStack Table | 8 | Headless data tables |
| Zustand | 5 | Client-side state (auth, UI) |
| React Router | 7 | File-based + nested routing |
| React Hook Form | 7 | Form state management |
| Orval | 7 | OpenAPI → typed React Query hooks |
| Lucide React | — | Icon library |
| Vitest | 3 | Unit & component testing |
| Testing Library | 16 | Component test utilities |
| Playwright | 1.46 | End-to-end browser testing |
| MSW | 2 | API mocking in tests |
| pnpm | 9 | Package manager |

---

## Quick Start (frontend only)

**Prerequisites:** Node.js 20+, pnpm 9+

```bash
git clone https://github.com/guggie11/appbase-frontend.git
cd appbase-frontend

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Set VITE_API_URL to point at your backend

# Start development server
pnpm dev
```

App runs at **http://localhost:5173**

> The backend must be running (or mocked) for API calls to work. See [appbase-infrastructure](https://github.com/guggie11/appbase-infrastructure) for the full local stack.

---

## Features

### Architecture — Feature-Sliced Design (FSD)
The codebase follows [Feature-Sliced Design](https://feature-sliced.design/), a scalable architecture methodology for frontend applications. Layers have strict one-directional dependency rules: upper layers may import from lower ones, never the reverse.

### Typed API Client — Orval
API hooks are auto-generated from the backend's OpenAPI spec (`openapi.json`) using Orval. This ensures the frontend always stays in sync with the backend contract.

```bash
# Regenerate API hooks from openapi.json
pnpm gen:api
```

### Server State — TanStack Query
All server interactions use TanStack Query v5 for caching, background refetching, optimistic updates, and invalidation patterns.

### Client State — Zustand
Lightweight Zustand stores manage auth state (current user, tokens) and ephemeral UI state (sidebar, notifications).

### Tables — TanStack Table
All data-heavy views (users, roles, audit logs) use TanStack Table for sorting, filtering, and pagination — headless, fully accessible.

### Forms — React Hook Form
Forms use React Hook Form with Zod schemas for client-side validation. Follows controlled-component patterns throughout.

---

## Project Structure (FSD)

```
src/
├── app/
│   ├── router.tsx           # Route definitions (React Router v7)
│   ├── providers.tsx        # Query client, auth, theme providers
│   └── index.css            # Global styles, Tailwind base
│
├── pages/                   # Route-level page components
│   ├── login/
│   ├── dashboard/
│   ├── users/
│   ├── roles/
│   ├── menus/
│   ├── audit-logs/
│   ├── notifications/
│   ├── profile/
│   ├── settings/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── verify-email/
│   ├── accept-invitation/
│   ├── forbidden/
│   └── not-found.tsx
│
├── features/                # Self-contained feature slices
│   ├── auth/                # Login form, refresh logic, guards
│   ├── users/               # User list, create, edit, invite
│   ├── roles/               # Role management, permission matrix
│   ├── menus/               # Menu tree, drag-and-drop order
│   ├── dashboard/           # Stats widgets, activity feed
│   ├── audit-logs/          # Log table, filters, export
│   ├── notifications/       # Notification list, mark-read
│   ├── profile/             # Profile edit, password change
│   └── settings/            # App settings form
│
├── entities/                # Domain models & base API slices
│
├── widgets/                 # Composite UI blocks (Sidebar, Header, DataTable)
│
└── shared/
    ├── api/                 # Orval-generated hooks (src/shared/api/generated/)
    ├── ui/                  # Design system primitives (Button, Input, Modal…)
    ├── lib/                 # Utilities (date, string, cn helper)
    └── config/              # App-wide constants, route paths
```

---

## Design System — Archie

Appbase ships with **Archie**, a minimal design system built on TailwindCSS 4.

| Token | Value | Usage |
|-------|-------|-------|
| Primary color | `#D94F3D` (red) | Buttons, links, highlights |
| Font | Inter (variable) | All text |
| Radius | `0.5rem` | Cards, inputs, modals |
| Base spacing | `4px` grid | Margins, padding |

Design tokens are defined in `tailwind.config.ts` and applied via utility classes. Component primitives live in `src/shared/ui/`.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_APP_NAME` | `Appbase` | App title in browser tab |

Create `.env.local` for local overrides (not committed to git):

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=My Project
```

---

## Testing

### Unit & Component Tests (Vitest)

```bash
# Run all unit tests
pnpm test

# Watch mode
pnpm vitest

# With UI
pnpm test:ui

# With coverage
pnpm vitest run --coverage
```

Tests live alongside the code they test (e.g. `src/features/auth/__tests__/`). API calls are mocked with MSW.

### End-to-End Tests (Playwright)

```bash
# Install browsers (first time)
pnpx playwright install

# Run E2E tests (headless)
pnpm test:e2e

# Run with Playwright UI
pnpm test:e2e:ui
```

E2E tests live in `e2e/` and run against a real backend (configure `PLAYWRIGHT_BASE_URL` in `.env.test`).

---

## API Client Codegen

The typed API client is generated by Orval from the backend's OpenAPI spec:

```bash
# Fetch latest openapi.json from backend and regenerate hooks
pnpm gen:api
```

Configuration: `orval.config.ts`  
Output: `src/shared/api/generated/`

Commit the generated files. Do not edit them manually — re-run `gen:api` after backend changes.

---

## Code Quality

```bash
# Lint
pnpm lint

# Type check
pnpx tsc --noEmit
```

ESLint config: `eslint.config.js` (flat config, TypeScript + React Hooks rules)

---

## Build

```bash
# Production build
pnpm build

# Preview production build locally
pnpm preview
```

Output: `dist/` — served by Nginx in production Docker via [appbase-infrastructure](https://github.com/guggie11/appbase-infrastructure).

---

## License

MIT © 2024 [guggie11](https://github.com/guggie11)
