# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

LifeManager is a personal life management tool: the goal is to help users manage different areas of their life — starting with personal finances (transactions, categories, monthly summaries) and eventually habits and other areas — from one place. This repo (`LifeManagerFront`) is the frontend SPA; it consumes the sibling backend project `LifeManager` (`../LifeManager`, a .NET API), whose domains so far are Auth, Users, Categories, Transactions, and MonthlySummaries.

## Project state

This is a freshly scaffolded Vite + React + TypeScript app (`lifemanagerfront`). The Vite starter demo content has been stripped out of `src/App.tsx`, which is now just a `BrowserRouter` + empty `Routes` shell (react-router-dom is installed) waiting for feature pages to be wired in. There is no state management, backend integration, or test setup yet. Treat architectural decisions as open until real features are added.

## Commands

- `npm run dev` — start the Vite dev server with HMR
- `npm run build` — type-check via `tsc -b` (project references: `tsconfig.app.json` for `src/`, `tsconfig.node.json` for `vite.config.ts`), then production build via `vite build`
- `npm run lint` — run Oxlint (see `.oxlintrc.json`)
- `npm run preview` — preview the production build locally

There is no test runner configured yet.

## Architecture notes

- Entry point: `src/main.tsx` mounts `App` from `src/App.tsx` into `#root` in `index.html`.
- Routing uses `react-router-dom`. `App.tsx` owns the top-level `<BrowserRouter><Routes>...</Routes></BrowserRouter>` shell — add feature routes there, pointing at page components from each feature's `pages/` folder (see below), e.g. eventually `<Route path="/auth" element={<AuthPage />} />`.
- TypeScript is split via project references (`tsconfig.json` → app + node configs) rather than a single flat config; `tsc -b` (used in `npm run build`) respects this and only type-checks, since `noEmit` is set — Vite/esbuild handles actual transpilation.
- `verbatimModuleSyntax` is enabled, so type-only imports must use `import type { ... }`.
- Linting uses Oxlint (Rust-based, fast) instead of ESLint. The current config (`.oxlintrc.json`) enables `react`, `typescript`, and `oxc` plugins but not type-aware linting — see README.md for how to enable `oxlint-tsgolint` and type-aware rules if needed later.
- Static assets referenced by URL (favicon, sprite icons) live in `public/`; assets imported directly in components go in `src/assets/` (currently empty — the demo images that lived here were removed along with the Vite starter content).

## Folder structure: feature modules

This frontend mirrors the feature-based organization of its sibling backend project, `LifeManager` (`../LifeManager`), which is a .NET Clean Architecture solution where each layer (Domain, Application, Infrastructure, WebApi) has one subfolder per domain (`Auth/`, `Users/`, ...), each split further by responsibility (`DTOs/`, `Services/`, `Controllers/`, ...).

Since this is a single-layer SPA rather than a layered architecture, each feature gets one folder directly under `src/`, and inside it the responsibility-based subfolders relevant to a frontend module — not a 1:1 mirror of the backend's layers. **Do not create top-level `src/pages`, `src/components`, `src/services`, etc. shared across all features** — those belong inside each feature folder instead.

Per-feature subfolder convention (established with the `auth` module):
- `pages/` — top-level screens for the feature
- `components/` — UI components used by those screens
- `services/` — API calls / business logic (equivalent to the backend's `Services/`)
- `types/` — request/response types (equivalent to the backend's `DTOs/`)
- `hooks/` — feature-specific custom hooks

Backend concepts intentionally **not** mirrored per feature: `Controllers/` (no frontend equivalent), `Errors/`/`Interfaces/`/`ValueObjects/` (Domain-layer concerns that don't apply to a UI module).

Current modules:
- `src/auth/` — login and registration. The intended design is a single page that toggles between a Login component and a Register component (both under `auth/components/`), rather than two separate routed pages.

As of now these folders only contain the structure above — no files have been added yet (folders are empty and won't show up in git until populated).
