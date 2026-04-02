# CineTube — Backend 

Next.js 16 (App Router) + Tailwind CSS 4 + TanStack Query + shadcn-style UI, aligned with the structure and tooling of the PH Healthcare frontend reference project.

## Features

- **Browse & search** — Catalog with filters, sort, pagination (server-rendered).
- **Title pages** — Poster, metadata, YouTube embed when a stream URL is available, buy/rent (Stripe checkout via API), watchlist, reviews, likes, comments (moderation-aware).
- **Reviews feed** — Public list with sort (recent / top rated / most liked).
- **Auth** — Email/password via Better Auth HTTP routes (`/api/better-auth/...` proxied to the backend), Google OAuth link, register/forgot/reset flows against the Express API.
- **Subscription & purchases** — Stripe checkout session redirects for plans and title entitlements.
- **Admin** — Dashboard stats, users (role/status), moderation queue, payments JSON.
- **Middleware** — Redirects unauthenticated users away from `/watchlist`, `/profile`, `/purchases`, and `/admin/*`.

## Prerequisites

- Node.js 20+
- [CineTube backend](../cinetube-backend/cinetube-backend) running (default `http://127.0.0.1:5000`)

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Adjust `BACKEND_URL` and `NEXT_PUBLIC_APP_URL` if your ports differ.

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). API calls go to `/api/*` on the same origin; `next.config.ts` rewrites those requests to `BACKEND_URL`.

## How it connects to the API

| Frontend path | Proxied to |
|---------------|------------|
| `/api/*` | `{BACKEND_URL}/api/*` |

Session cookies set by Better Auth on the backend are stored for `localhost:3000` when using the dev proxy, so `credentials: "include"` fetches work from the browser.

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — ESLint

## Admin testing

Use the admin credentials from your backend `.env` (`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`) after signing in through the app.

## Notes

- Next.js 16 may show a notice about migrating from `middleware` to `proxy`; behavior remains valid for this project.
- Removed unused copied UI primitives (`calendar`, `input-otp`, `drawer`, `sidebar`) that required extra packages; add them back if you need those components.
