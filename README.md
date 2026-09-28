[![CI](https://github.com/guggie11/appbase-frontend/actions/workflows/ci.yml/badge.svg)](https://github.com/guggie11/appbase-frontend/actions/workflows/ci.yml)

# Appbase Frontend

React 19 + TypeScript + Vite + Tailwind CSS v4 frontend skeleton using Feature-Sliced Design (FSD).

## Stack

| Tool | Version |
|------|---------|
| React | 19 |
| TypeScript | ~6 |
| Vite | ^8 |
| Tailwind CSS | v4 |
| React Router DOM | v7 |
| TanStack Query | v5 |
| Zustand | v5 |
| React Hook Form | v7 |
| Zod | v3 |
| Orval | v7 |
| Axios | v1 |
| Framer Motion | v12 |
| Recharts | v2 |
| Lucide React | latest |
| Sonner | latest |

## Architecture

Feature-Sliced Design (FSD):

```
src/
├── app/        # providers, router, global styles
├── pages/      # one component per route
├── widgets/    # composed UI blocks
├── features/   # user-facing features
├── entities/   # domain models/UI
└── shared/     # utilities, API client, shadcn/ui
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Generate API client

Place `openapi.json` from appbase-infrastructure and run:

```bash
pnpm orval
```

## Add shadcn/ui components

```bash
pnpm dlx shadcn@latest add button
```
