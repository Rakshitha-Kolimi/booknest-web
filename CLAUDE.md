# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BookNest Web is a pnpm/Turbo monorepo for the BookNest bookstore frontend. It is a React 18 + TypeScript + Vite single-page app with shared packages for API access, page composition, UI primitives, route guards, and client utilities. The backend lives in a separate repo; this app talks to it under `/api/v1`.

## Workspace layout

- `apps/web` — `@booknest/web`: the Vite app. Hosts the route shell (`App.tsx`, `main.tsx`), `NestyChat` (floating AI assistant), `GlobalSearch` (semantic book search in the nav), and the bootstrap CSS. Dev server runs on port 3000.
- `packages/api` — `@booknest/services` (alias `@booknest/services`): Axios client + typed service wrappers. Files: `client.ts` (interceptors + refresh), `request.ts` (thin `getData`/`postData`/`putData`/`deleteData`/`getErrorMessage` helpers), and one `*Service.ts` per domain (`AuthService/`, `bookService`, `cartService`, `orderService`, `aiService`, `authorService`, `categoryService`, `publisherService`, `imageService`).
- `packages/pages` — `@booknest/pages`: full-page React components grouped into `app/` (Home, Books, BookDetail, Cart, Orders, Profile, AdminBooks, AdminOrders, NotFound) and `auth/` (Login, Register, ForgotPassword, ResetPassword, ResetSuccessful, VerifyEmail, UnAuthorized). Also exports `PageTitleProvider` / `usePageTitle` and the React Query wiring (`query/queryClient.tsx`, `query/hooks.ts`). Bundled with `tsup`.
- `packages/ui` — `@booknest/ui`: shared presentational components (`Button`, `Dialog`, `Header`, `Icons/`). Bundled with `tsup`.
- `packages/ui-helpers` — `@booknest/ui-helpers`: route guards `PrivateRoute`, `PublicRoute`, `RoleBasedRoute`. Source-only (consumed via tsconfig path alias, no build step).
- `packages/utils` — `@booknest/utils`: `safeLocalStorage` wrapper, JWT decode + auth session helpers (`auth.ts` exports `syncAuthSession`, `getRole`, `clearAuthSession`, `decodeToken`, etc.), phone utils, currency formatting (`formatPrice`), and a small `cn` classnames helper.

Path aliases are declared in `tsconfig.base.json` for all five workspace packages, so any package can be imported as `@booknest/<name>` from anywhere.

## Local development

Prereqs: Node 24+, pnpm 9+, and the BookNest Platform backend running on `http://localhost:8080` (CORS must allow the frontend origin and credentials).

```bash
pnpm install
cp .env.example .env   # if .env is missing; otherwise edit it
pnpm dev               # turbo run dev --parallel — Vite + tsup watchers
```

`pnpm dev` runs the whole pipeline in parallel: the Vite app on `http://localhost:3000`, and `tsup --watch` rebuilds the packages that ship compiled output (`@booknest/pages`, `@booknest/ui`).

`VITE_API_BASE` accepts either the bare backend origin (e.g. `http://localhost:8080`, in which case `/api/v1` is appended automatically) or a full `/api/v1` URL. See `packages/api/src/client.ts` for the normalization.

## Build, lint, test, format

All runnable from the repo root via Turbo:

```bash
pnpm build      # turbo run build
pnpm lint       # turbo run lint
pnpm test       # turbo run test (vitest across workspaces)
pnpm format     # prettier --write .
pnpm check-format
```

Per-package filtering works as in the README, e.g. `pnpm --filter @booknest/web test`.

Tests use Vitest with a jsdom environment. `apps/web/src/setupTests.ts` installs `@testing-library/jest-dom`, polyfills `localStorage` + `atob`, and stubs the `Power` icon from `lucide-react`. A single test can be run with `pnpm --filter @booknest/web test -- <pattern>` (e.g. `pnpm --filter @booknest/web test -- route-helpers`).

ESLint is flat config (`eslint.config.mjs`): `@typescript-eslint`, `react`, `react-hooks`, `jsx-a11y`, `import`, `simple-import-sort` (enforced), and Prettier as a soft warning. Husky installs a pre-commit hook via `pnpm prepare`.

## Architecture notes

### Auth and token refresh

- Login response tokens are persisted by `AuthService` consumers via `syncAuthSessionWithRefresh` (`packages/utils/src/auth/auth.ts`), which writes `token`, `role`, `user_id`, `email` to `localStorage` and the refresh token separately.
- `packages/api/src/client.ts` attaches the bearer token on every request and intercepts 401s. On a 401 it calls `/auth/refresh` (with a cached promise so concurrent requests share one refresh), retries the original request, and falls back to `/refresh` for legacy backends. If refresh fails it calls `clearAuthSession()` and forces a redirect to `/login`.
- The role check is purely client-side: `getRole()` reads `localStorage.role`, falling back to decoding the JWT claims. `RoleBasedRoute` uses this to gate `/admin/*` and (for non-admins) `/cart` and `/orders`.

### Routing and route guards

- `apps/web/src/App.tsx` is the only place that defines the route table. Public routes use `<PublicRoute>`, authenticated routes use `<PrivateRoute>`, role-specific routes use `<RoleBasedRoute element={…} allowedRoles={…} />`.
- The header swaps nav items based on `getRole()` — admins see Manage + Admin Orders, regular users see Cart + Orders.
- `NestyChat` and `GlobalSearch` are mounted at the top of the shell on every authenticated non-auth page.

### Data fetching

- A single `QueryClient` is provided by `BookNestQueryProvider` (in `packages/pages/src/query/queryClient.tsx`) and wraps the app in `main.tsx` above the router.
- All query/mutation hooks live in `packages/pages/src/query/hooks.ts` and are the canonical way pages talk to the backend. Each hook owns its `queryKey` (the `queryKeys` map), invalidates the right caches on mutation success, and surfaces a `getQueryErrorMessage` helper.
- New endpoints should be added as typed functions in the appropriate `*Service.ts` and then wrapped by a `use*Query` / `use*Mutation` hook in `query/hooks.ts` — pages should not call the services directly.

### Page composition

- Pages in `packages/pages` are plain React components. They use `usePageTitle()` to set `document.title`, call the query hooks, and render Tailwind classes from the global stylesheet.
- Cross-page concerns (currency formatting, role checks, storage) come from `@booknest/utils`. Anything reused across pages belongs in a workspace package, not a local helper.

### NestyChat and AI integration

- `apps/web/src/NestyChat.tsx` is a self-contained floating panel. On mount it loads history via `aiService.getChatHistory`, sends messages via `chatWithNesty`, and renders lightweight inline markdown (bold/italic, ordered/unordered lists). Book references from the response render as clickable cards that navigate to `/books/:id`.
- Closing the panel calls `clearChatHistory` on the backend. There is no incremental persistence on the client beyond what the backend stores per user.

### Styling

- Tailwind v4 is loaded via `@import 'tailwindcss'` in `apps/web/src/index.css`, with `@source` lines that pull in `packages/pages/src`, `packages/ui/src`, and `packages/ui-helpers/src` so Tailwind scans the workspace packages.
- Shared design tokens (gradients, brand colors, `.bn-*` utility classes, Nesty chat styles) live in `apps/web/src/index.css` as CSS variables. Most components in `packages/pages` rely on these classes rather than ad-hoc Tailwind.

## Backend contract (must match)

All routes are under `/api/v1`. The frontend relies on these (see `packages/api/src/*Service.ts` for full payloads):

- Auth: `/auth/register`, `/auth/login`, `/auth/refresh` (with `/refresh` legacy fallback), `/auth/forgot-password`, `/auth/reset-password/confirm`, `/auth/verify-email`, `/auth/resend-email-verify`, `/auth/verify-mobile`, `/auth/resend-mobile-otp`, `/auth/user/:id`, `/auth/user/:id/preferences`.
- Books: `/books`, `/books/:id`, `/books/search`, `/books/semantic-search`, `/books/filter`, `/books/recommend`, `/books/:id/reviews`.
- Cart: `/cart`, `/cart/items`, `/cart/items/:book_id`, `/cart/clear`.
- Orders: `/orders`, `/orders/checkout`, `/orders/confirm`, `/orders/cancel`, `/admin/orders`, `/admin/orders/status`.
- Catalog: `/authors`, `/categories`, `/publishers`.
- Images: `/images/upload` (multipart `image` field).
- AI: `/ai/health`, `/ai/chat`, `/ai/chat/history`.

Prices on the wire are integer cents. UI converts via `formatPrice` (divide by 100, two decimals).

## Conventions

- TypeScript strict mode is on (`tsconfig.base.json`). Path aliases are the only acceptable way to reference workspace packages.
- Prettier: no semis, single quotes, trailing commas, 2-space indent, LF line endings. CI runs `pnpm check-format` and `pnpm lint` on `main` (`.github/workflows/format.yml`).
- `simple-import-sort/imports` is enforced — group external first, then workspace (`@booknest/*`), then relative. `App.tsx` and `main.tsx` show the typical order.
- Husky runs a pre-commit hook; install with `pnpm prepare` if it isn't already wired.
- VS Code settings in `.vscode/settings.json` turn on format-on-save with Prettier and auto-fix ESLint on save. Recommended extensions: `esbenp.prettier-vscode`, `dbaeumer.vscode-eslint`.
