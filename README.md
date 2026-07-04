# BookNest Web

BookNest Web is the React + TypeScript frontend for the BookNest bookstore platform. The repository is organized as a pnpm monorepo with Turbo, shared UI and utility packages, and a Vite app in `apps/web`.

## Repository Layout

- `apps/web`: browser app, route shell, `GlobalSearch`, and the `NestyChat` assistant
- `packages/pages`: page-level screens for auth, catalog, cart, profile, and admin flows
- `packages/services`: API client and typed service wrappers for books, auth, cart, orders, AI, and catalog data
- `packages/ui`: shared UI components
- `packages/ui-helpers`: route guards and role-based access helpers
- `packages/utils`: auth/session helpers and browser-safe utilities

## Prerequisites

- Node.js `18+`
- pnpm `9+`
- A running BookNest backend, usually at `http://localhost:8080`

## Environment

Create a `.env` file in the repository root.

```env
VITE_API_BASE=http://localhost:8080
```

`VITE_API_BASE` can point to either:

- the backend origin, such as `http://localhost:8080`
- the full API base, such as `http://localhost:8080/api/v1`

If you provide only the origin, the frontend appends `/api/v1` automatically.

For production, set `VITE_API_BASE` to the public backend origin or API base used by your deployment.

## Install and Run

From the repository root:

```bash
pnpm install
pnpm dev
```

Root scripts:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm format
pnpm check-format
```

App-specific commands:

```bash
pnpm --filter @booknest/web dev
pnpm --filter @booknest/web build
pnpm --filter @booknest/web preview
pnpm --filter @booknest/web test
pnpm --filter @booknest/web lint
```

Shared workspace packages are built with `tsup` and watched automatically during `pnpm dev`.

## Local URLs

- Frontend app: `http://localhost:3000`
- Backend API: `http://localhost:8080` or `http://localhost:8080/api/v1`

## What the App Includes

- Public auth pages for login, registration, forgot password, reset password, reset success, and email verification
- Protected user routes for home, books, book detail, cart, orders, and profile
- Admin routes for catalog management and admin order views
- Global semantic search from the top navigation for authenticated users
- NestyChat AI assistant for book discovery and catalog questions
- Book detail reviews with average rating, review counts, and authenticated review submission
- Client-side auth session handling with automatic token refresh
- 401 Unauthorized and 404 Not Found pages

## Routes

The main route shell in `apps/web/src/App.tsx` currently serves:

- `/`
- `/books`
- `/books/:id`
- `/cart`
- `/orders`
- `/profile`
- `/admin/manage`
- `/admin/books`
- `/admin/orders`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/reset-successful`
- `/verify-email`
- `/unauthorized`

## Backend Contract

The frontend expects the backend under `/api/v1` with these route groups:

- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password/confirm`, `/auth/verify-email`, `/auth/resend-email-verification`, `/auth/verify-mobile`, `/auth/resend-mobile-otp`
- Books: `/books`, `/books/:id`, `/books/search`, `/books/semantic-search`, `/books/filter`, `/books/recommend`, `/books/:id/reviews`
- Cart: `/cart`, `/cart/items`, `/cart/items/:book_id`, `/cart/clear`
- Orders: `/orders`, `/orders/checkout`, `/orders/confirm`, `/orders/cancel`, `/admin/orders`, `/admin/orders/status`
- Catalog: `/authors`, `/categories`, `/publishers`
- Images: `/images/upload`
- AI: `/ai/health`, `/ai/chat`, `/ai/chat/history`

The app uses `withCredentials` on API requests, so CORS and cookie settings must be configured correctly on the backend if you rely on cookie-based flows.

## Deployment

The app builds to static files in `apps/web/dist`.

### Vercel

Recommended settings:

- Root Directory: repository root
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `apps/web/dist`
- Environment Variable: `VITE_API_BASE=https://your-backend-domain`

### Amazon S3

Build locally or in CI:

```bash
pnpm install --frozen-lockfile
VITE_API_BASE=https://your-backend-domain pnpm build
```

Upload the output:

```bash
aws s3 sync apps/web/dist s3://your-bucket-name --delete
```

For client-side routing, configure the bucket or CDN so unknown routes fall back to `index.html`.

## Recommended Workflow

1. Start the backend first.
2. Set `VITE_API_BASE` to match that backend.
3. Run `pnpm dev` from the repository root.
4. Sign in with a test user or admin account.
5. Verify search, cart, reviews, and NestyChat against a running backend.
