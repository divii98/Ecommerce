# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

ShopLite: a small full-stack e-commerce demo. Single Express server handles both the API and serves the React (Vite) frontend — there is no separate frontend dev server. Postgres (Neon) is the datastore. User authentication (Better Auth, email/password) gates checkout and order history.

## Commands

- `npm run dev` — start the app in development (`NODE_ENV=development`, Vite runs in middleware mode inside the Express server, with HMR)
- `npm run build` — build the frontend to `dist/` via Vite
- `npm start` — run in production (`NODE_ENV=production`); serves the built `dist/` as static files and requires `npm run build` to have been run first
- `npm run lint` — run Oxlint

There is no test suite configured in this repo.

The app always runs through `server/index.js` (never `vite` directly) — that script owns both the API routes and the frontend serving/HMR.

## Environment

Requires in a `.env` file (see `.env.example`):
- `DATABASE_URL` — Postgres connection string (Neon in practice). The server exits immediately at startup if unset. `server/db/pool.js` sets `ssl: { rejectUnauthorized: false }`, consistent with Neon's connection requirements.
- `BETTER_AUTH_SECRET` — random secret used by Better Auth to sign sessions. The server exits immediately at startup if unset.
- `BETTER_AUTH_URL` — base URL Better Auth issues cookies/links against (e.g. `http://localhost:3000`).

Schema migration is not a separate step: `ensureSchema()` (`server/db/migrate.js`) runs automatically on every server start. It creates the `products` and `orders` tables if missing, upserts the hardcoded catalog from `server/data/products.js` into `products` every time (so product data is defined in code, not the database, and DB-only edits to products will be overwritten on next restart), and also creates Better Auth's own tables (`user`, `session`, `account`, `verification`). That auth schema was generated once via `npx @better-auth/cli generate` against `server/auth.js` and hand-folded into `ensureSchema()` as `CREATE TABLE IF NOT EXISTS` — if Better Auth config/plugins change in a way that alters its schema, regenerate and re-sync this block rather than guessing column definitions.

## Architecture

**Backend** (`server/`): Express app created in `server/index.js`.
- `auth.js` — the Better Auth instance (email/password only), configured with the shared `pool` from `db/pool.js` as its database.
- `server/index.js` defers importing `auth.js` and the route modules until *after* `ensureSchema()` resolves (via dynamic `import()`), rather than importing them at module top-level. This avoids a real race: Better Auth runs its own internal schema check as soon as it's constructed, and on a brand-new database that check can run — and cache a false "missing tables" result — before `ensureSchema()` has finished creating them.
- `/api/auth/*splat` is mounted via `toNodeHandler(auth)` **before** `express.json()` — Better Auth parses its own request body, so body-parsing middleware must come after it.
- `routes/products.js`, `routes/orders.js` — API routes mounted at `/api/products` and `/api/orders`. `POST /api/orders` and `GET /api/orders/mine` require an authenticated session (checked via `auth.api.getSession`); both 401 if there's no session. Orders store the creating user's id in `user_id` (nullable — pre-auth orders have none).
- `store/orders.js` — order persistence/read logic (joins stored order lines back against current `products` rows, but prices are taken from the stored `unitPrice` at order time, not current price). `getOrdersForUser(userId)` powers the "My Orders" page.
- `db/pool.js` — single shared `pg` Pool; also registers a type parser so NUMERIC columns come back as JS numbers instead of strings (the rest of the app assumes numeric prices/totals everywhere).
- `db/migrate.js` — schema creation (products, orders, Better Auth tables) + product catalog upsert (see above).
- `data/products.js` — the actual source of truth for the product catalog.

Order totals (`FREE_SHIPPING_THRESHOLD = 75`, `SHIPPING_COST = 5.99`) are computed server-side in `routes/orders.js` and are duplicated client-side in `src/pages/Checkout.jsx` for display before submission — keep both in sync if these change.

In production, `server/index.js` serves `dist/` as static files and falls back to `dist/index.html` for any non-`/api` route (SPA client-side routing). In development it boots Vite in middleware mode instead.

**Frontend** (`src/`): React 19 + react-router-dom, no external state library.
- `lib/authClient.js` — Better Auth's React client (`createAuthClient` from `better-auth/react`), exporting `useSession`, `signIn`, `signUp`, `signOut`. Same-origin, so no `baseURL` is needed.
- `components/RequireAuth.jsx` — route guard used on `/checkout` and `/orders`; while `useSession()` is pending it renders nothing, and with no session it redirects to `/sign-in?redirect=<path>` so sign-in can bounce back.
- `context/ProductsContext.jsx` — fetches `/api/products` once on mount, exposes `products`/`loading`/`error`/`getProductById`.
- `context/CartContext.jsx` — cart state persisted to `localStorage` via `hooks/useLocalStorage.js` (key `ecommerce_cart`), stores only `{ productId, qty }` pairs and joins against `ProductsContext` for full product data — so cart lines silently disappear if a product is deleted from the catalog.
- Route structure lives in `App.jsx`: `/`, `/product/:id`, `/cart`, `/sign-in`, `/sign-up`, `/checkout` (wrapped in `RequireAuth`), `/orders` (wrapped in `RequireAuth`, "My Orders" page), `/order-confirmation/:orderId`.
- `components/Header.jsx` reads session state to toggle between `Sign in`/`Sign up` links and the user's name + `My orders` link + `Sign out` button.
- The checkout form collects payment fields (card number/expiry/CVC) but nothing is sent to the server or validated beyond HTML pattern attributes — there's no real payment processing.

Provider order matters: `ProductsProvider` wraps `CartProvider` in `App.jsx` because `CartContext` depends on `useProducts()`.
