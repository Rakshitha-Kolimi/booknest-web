# BookNest Web

Frontend monorepo for the BookNest bookstore. The workspace uses React, TypeScript, Vite, pnpm workspaces, and Turbo, with shared packages for API access, page composition, UI, route guards, and browser utilities.

## What is in this repo

- `apps/web`: the browser app and route shell, including the NestyChat AI assistant and GlobalSearch components
- `packages/api`: Axios client and typed service wrappers (auth, books, cart, orders, catalog, images, AI)
- `packages/pages`: page-level screens for auth, catalog, cart, profile, and admin flows
- `packages/ui`: shared UI components
- `packages/ui-helpers`: route guards such as `PrivateRoute`, `PublicRoute`, and role-based access
- `packages/utils`: auth/session and client-side helpers

## Prerequisites

- Node.js `18+`
- pnpm `9+`
- BookNest Platform running locally on `http://localhost:8080`

## Environment

Create a `.env` file in this directory. The frontend reads `VITE_API_BASE` and automatically appends `/api/v1` if you provide only the backend origin.

```env
VITE_API_BASE=http://localhost:8080
```

Examples:

- `http://localhost:8080` becomes `http://localhost:8080/api/v1`
- `http://localhost:8080/api/v1` is used as-is

For production deployments, set `VITE_API_BASE` to the public HTTPS backend origin, for example:

```env
VITE_API_BASE=https://api.example.com
```

## Install and run

From this directory:

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the monorepo dev pipeline through Turbo. That includes the Vite app plus the workspace packages that are watched with `tsup`.

Default local URLs:

- App: `http://localhost:3000`
- Compatible backend origins: `http://localhost:8080`

## Available scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm format
```

App-specific commands are also available from `apps/web`:

```bash
pnpm --filter @booknest/web dev
pnpm --filter @booknest/web build
pnpm --filter @booknest/web test
```

## Deploy

The web app builds to static files in `apps/web/dist`.

### Vercel

This repository includes `vercel.json` for the monorepo build and React Router fallback.

Recommended Vercel project settings:

- Root Directory: repository root
- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output Directory: `apps/web/dist`
- Environment Variable: `VITE_API_BASE=https://your-backend-domain`

After connecting the Git repository in Vercel, set `VITE_API_BASE` in the project environment variables for Production, Preview, and Development as needed, then deploy.

### Amazon S3

Build locally or in CI:

```bash
pnpm install --frozen-lockfile
VITE_API_BASE=https://your-backend-domain pnpm build
```

Upload the built files:

```bash
aws s3 sync apps/web/dist s3://your-bucket-name --delete
```

For a plain S3 static website, enable static website hosting and set both the index document and error document to `index.html` so client-side routes can load after refreshes.

For a production domain, put CloudFront in front of the bucket and configure custom error responses for `403` and `404` to return `/index.html` with status `200`. Also attach an ACM certificate and point DNS at the CloudFront distribution.

Before going live, make sure the backend allows CORS from the deployed frontend origin and supports credentials if cookie-based flows are used.

## Application behavior

The app currently includes:

- Public auth pages for login, registration, forgot password, reset password, and reset success
- Email verification page for confirming account email addresses
- Protected user routes for home, books, book detail, cart, orders, and profile
- Admin-only routes for catalog management and admin order views
- GlobalSearch component for semantic full-text book search from the navigation bar
- NestyChat AI assistant for book discovery and recommendations, available to authenticated users
- Book detail reviews with rating summaries and authenticated review submission
- Token refresh support through `/auth/refresh`, with a legacy fallback to `/refresh`
- 404 Not Found and 401 Unauthorized error pages

Authentication state is stored client-side and attached to API requests through the shared Axios client in `packages/api`.

Review behavior:

- The book detail page loads reviews from the backend and shows average rating plus review count.
- Readers can submit or update a review from the book detail page.
- The backend only accepts reviews from users who have completed a purchase of that book.

NestyChat behavior:

- Opens as a floating chat panel available on all authenticated pages.
- Conversation history is persisted per user on the backend and reloaded on login.
- Nesty answers questions about books, genres, authors, and catalog contents.

## Backend contract

This app expects the backend API under `/api/v1` with these route groups:

- Auth: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password/confirm`, `/auth/verify-email`, `/auth/resend-email-verification`, `/auth/verify-mobile`, `/auth/resend-mobile-otp`
- Books: `/books`, `/books/:id`, `/books/search`, `/books/semantic-search`, `/books/filter`, `/books/recommend`, `/books/:id/reviews`
- Cart: `/cart`, `/cart/items`, `/cart/items/:book_id`, `/cart/clear`
- Orders: `/orders`, `/orders/checkout`, `/orders/confirm`, `/orders/cancel`, `/admin/orders`, `/admin/orders/status`
- Catalog: `/authors`, `/categories`, `/publishers`
- Images: `/images/upload`
- AI: `/ai/health`, `/ai/chat`, `/ai/chat/history`

If the platform server is not running or CORS is not configured for the frontend origin, login and data-loading flows will fail immediately.

## Workspace notes

- The workspace is declared in [`pnpm-workspace.yaml`](./pnpm-workspace.yaml)
- Root scripts use Turbo to coordinate package builds and tests
- Shared packages such as `@booknest/pages`, `@booknest/ui`, `@booknest/ui-helpers`, and `@booknest/utils` build through `tsup`

## Recommended local workflow

1. Start the platform backend first.
2. Confirm `VITE_API_BASE` points at that backend.
3. Run `pnpm dev` from this repository.
4. Sign in with a seeded or manually created user.
5. Use an admin account as well if you want to verify `/admin/manage` and `/admin/orders`.
6. Test the NestyChat assistant and GlobalSearch with a running AI-configured backend.
