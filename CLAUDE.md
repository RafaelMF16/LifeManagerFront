# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

LifeManager is a personal life management tool: the goal is to help users manage different areas of their life — starting with personal finances (transactions, categories, monthly summaries) and eventually habits and other areas — from one place. This repo (`LifeManagerFront`) is the frontend SPA; it consumes the sibling backend project `LifeManager` (`../LifeManager`, a .NET API), whose domains so far are Auth, Users, Categories, Transactions, and MonthlySummaries.

## Project state

This is a Vite + React + TypeScript app (`lifemanagerfront`). The Vite starter demo content has been stripped out. Routing (`react-router-dom`) is wired up in `App.tsx`, with `/auth` as the only real route so far and everything else (`*`, including `/`) redirecting to it. The `auth` feature has a working login/register screen built from a Claude Design handoff; there is no backend integration (forms don't call any API yet) or test setup. Treat further architectural decisions as open until more features are added.

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
- Design tokens (color, typography, spacing, radius, shadows, motion) live as CSS custom properties in `src/shared/styles/tokens/*.css`, sourced from a Claude Design handoff — see the folder-structure section below. `src/index.css` (imported once, in `main.tsx`) is just the `@import` list for these plus `shared/styles/base.css`; don't add component-specific rules there.
- Icons use `lucide-react`. The shared `Icon` component (`src/shared/components/Icon/Icon.tsx`) wraps a small explicit name→icon registry rather than importing the whole library — add new icons to that registry as they're needed, don't import `lucide-react` icons directly elsewhere.
- Dark mode is real, not decorative: `src/shared/hooks/useTheme.ts` toggles `data-theme="dark"` on `<html>` and persists the choice in `localStorage`; all color tokens have light/dark values keyed off that attribute.
- HTTP goes through `src/shared/services/httpClient.ts` (`apiRequest`), which attaches `Authorization: Bearer <token>` from `src/shared/services/tokenStorage.ts` (access token in `sessionStorage`) when present.
- **Paged listings** — every list endpoint is paginated, searched and sorted on the backend (offset pagination: `?page=&pageSize=&search=&sortDirection=Asc|Desc`, `pageSize` ≤ 100), returning the envelope typed as `PagedResponse<T>` in `shared/types/Paging.ts`. Never fetch a whole collection to filter/sort/slice it in the browser. Pattern (see `finance/hooks/useCategories.ts`): the feature hook owns the query state, debounces the search input with `shared/hooks/useDebouncedValue.ts`, fetches with an `AbortController`, keeps the last page on screen while the next loads (`isFetching`), and refetches after mutations; the list component is presentational and renders `shared/components/Pagination/` (windowed page numbers via `shared/utils/getPageItems.ts`; the caller passes the translated range label). Backend search is accent/case-insensitive: it matches a persisted normalized column (`SearchText.Normalize` in the Domain) through a `pg_trgm` GIN index.
- User preferences (theme + language) are persisted in the backend (`/api/UserPreferences`, enums as strings `Light|Dark`, `PTBR|EN` — mapped in `shared/utils/userPreferencesMapper.ts`). On login, `LoginForm` calls `loadAndApplyUserPreferences()` (`shared/services/userPreferencesService.ts`) before navigating, which applies them via `applyTheme`/`applyLanguage` (exported from `useTheme.ts`/`useLanguage.ts`) so the hooks initialize from them. `Header` calls `useUserPreferencesSync(theme, language)`, which saves changes with an 800 ms debounce (skips unchanged values, flushes on unmount) and returns `{ flush }` to save a pending change immediately.
- **Logout** — the Header's "Sair" button calls `flush()` (so a still-debounced preference change goes out while the access token is valid; `apiRequest` reads the token synchronously before `fetch`), then `useLogout()` (`shared/hooks/useLogout.ts`: guards double clicks via `isLoggingOut`, shows `common:logoutSuccessToast`, `navigate('/auth', { replace: true })`). The API call lives in `shared/services/authSession.ts` (not `auth/services`, since `shared/` must not import from features): `POST /api/Auth/Logout` revokes the refresh token and deletes its HttpOnly cookie server-side (the backend endpoint is anonymous and idempotent); `clearAccessToken()` runs in a `finally`, so a failed request never blocks signing out locally.

## Internationalization (i18n)

**Every new screen or UI text from now on must ship with i18n already wired up — never land a hardcoded user-facing string, not even "to translate later."** This is part of finishing a feature, not a follow-up cleanup task.

- The app uses `react-i18next` (`i18next` + `react-i18next`), initialized once in `src/i18n/i18n.ts` and imported as a side effect at the top of `src/main.tsx`. Supported languages: `en-US` (default/fallback) and `pt-BR`, tracked by `src/shared/hooks/useLanguage.ts` — mirrors `useTheme.ts`'s pattern (plain hook, `localStorage['lm-language']`, no Context/Provider).
- Every feature owns its own i18next **namespace**, mirroring the per-feature folder convention: strings live in `<feature>/locales/{en-US,pt-BR}.ts` (see `src/auth/locales/`, `src/home/locales/`), and any new namespace must be registered in the `resources`/`ns` list in `src/i18n/i18n.ts`. A string only belongs in the shared `common` namespace (`src/shared/locales/`) if it's rendered from `src/shared/**` or reused verbatim by 2+ features — otherwise it stays in the owning feature's namespace, even if similar wording exists elsewhere.
- In components: `const { t: translate } = useTranslation('<namespace>')` (or an array of namespaces if the component needs more than one), then `translate('namespace:key.path')` — always with the explicit `ns:` prefix, even for a single-namespace call.
- Data-shaped content (e.g. a config array like `HomePage.tsx`'s `MODULES`) can't hold translated text directly, since it's evaluated once rather than re-rendered — store an id/key instead and look the copy up with `translate(...)` inside the component that renders it (see `ModuleCard.tsx`).
- Validation messages (Zod schemas, backend error-code maps) are also evaluated once at import time, so they store translation **keys** as the message and get translated at the render boundary — see `src/auth/validation/userSchemas.ts` and `src/shared/utils/applyApiErrorToForm.ts`.
- When adding a new screen: create its `locales/en-US.ts` + `locales/pt-BR.ts` pair, register the namespace in `src/i18n/i18n.ts`, and translate every string as it's written.

## Folder structure: feature modules

This frontend mirrors the feature-based organization of its sibling backend project, `LifeManager` (`../LifeManager`), which is a .NET Clean Architecture solution where each layer (Domain, Application, Infrastructure, WebApi) has one subfolder per domain (`Auth/`, `Users/`, ...), each split further by responsibility (`DTOs/`, `Services/`, `Controllers/`, ...).

Since this is a single-layer SPA rather than a layered architecture, each feature gets one folder directly under `src/`, and inside it the responsibility-based subfolders relevant to a frontend module — not a 1:1 mirror of the backend's layers. **Do not create top-level `src/pages`, `src/services`, etc. shared across all features** — those belong inside each feature folder instead.

Per-feature subfolder convention (established with the `auth` module):
- `pages/` — top-level screens for the feature
- `components/` — UI components used by those screens. **One folder per component** (`ComponentName/ComponentName.tsx` + `ComponentName.css`), matching the convention in `shared/components/`. Exception: a `.css` file genuinely shared by several sibling components in the same feature (not a component itself) can live directly under `components/` instead of inside any one of their folders — e.g. `auth/components/AuthForm.css`, shared by `LoginForm/` and `RegisterForm/`.
- `services/` — API calls / business logic (equivalent to the backend's `Services/`)
- `types/` — request/response types (equivalent to the backend's `DTOs/`), **plus feature-wide domain vocabulary used by more than one file** (e.g. `auth/types/AuthMode.ts`, the `'login' | 'signup'` union shared by `AuthPage` and `AuthTabs`). This is *not* where component props types go — a component's own `Props` interface stays colocated in its `.tsx` file, same as everywhere else in React/TS; `types/` is for things that aren't the shape of one component's JSX API.
- `hooks/` — feature-specific custom hooks

Backend concepts intentionally **not** mirrored per feature: `Controllers/` (no frontend equivalent), `Errors/`/`Interfaces/`/`ValueObjects/` (Domain-layer concerns that don't apply to a UI module).

**Exception: `src/shared/`.** Features don't share folders with each other, but they can all depend on `src/shared/` — the frontend equivalent of the `Shared/` folder that already exists in the backend (`LifeManager.Domain/Shared`). It holds design tokens and UI primitives meant to be reused across the whole app (buttons, inputs, icons, colors), not feature-specific code:
- `shared/styles/tokens/` and `shared/styles/base.css` — the design system's CSS custom properties (see Architecture notes above)
- `shared/components/` — one folder per primitive (e.g. `Button/`, `Input/`, `IconButton/`, `Icon/`), each with its `.tsx` and its own `.css`
- `shared/hooks/` — cross-feature hooks (e.g. `useTheme`)

Before adding something new to `shared/`, make sure it's genuinely cross-feature — a component only used by one feature belongs in that feature's `components/`, not here (this is why there's no generic `Card` in `shared/` yet: nothing needs it besides `auth`'s hand-built layout, so it hasn't been extracted).

Current modules:
- `src/auth/` — login and registration, built from a Claude Design handoff (`Auth.dc.html`). `pages/AuthPage.tsx` is a single page that toggles between `components/LoginForm/` and `components/RegisterForm/` via `components/AuthTabs/` (animated tab switcher), rather than two separate routed pages. `types/AuthMode.ts` holds the shared `'login' | 'signup'` union. Forms only call `preventDefault()` for now — `auth/services` stays empty until there's a real API integration.
- `src/finance/` — the Finance module, built from a Claude Design handoff (`Categorias.dc.html`). Routed as a nested layout: `/finance` renders `components/FinanceLayout/` (Header + `FinanceSidebar` + `<Outlet />` + Footer) and each screen is a child route (`/finance/categories` → `pages/CategoriesPage.tsx`). New Finance screens get a child route in `App.tsx` and an entry in the sidebar's `NAV_ITEMS` (`path: null` renders it disabled as "coming soon", as "Meses" is today). Categories talk to `/api/Categories` via `services/categoryService.ts`; `hooks/useCategories.ts` owns the listing query (page, debounced search, sort) and refetches the current page after each mutation; `components/CategoryList/` is presentational (see "Paged listings" above). The sidebar collapses to icons only (`hooks/useSidebarCollapsed.ts`, persisted in `localStorage['lm-finance-sidebar-collapsed']`; ignored on the ≤768px horizontal layout). GETs issued from effects pass an `AbortSignal` to `apiRequest` (aborted in the effect cleanup) so the backend's `CancellationToken` fires; mutations never pass one, since a cancelled write may already be persisted. Modals use the shared `Dialog` shell (`shared/components/Dialog/`, also used by `ErrorModal`).
