# OSTA Memory

This file is a handoff memory for the next developer working on OSTA.

## Current State

The repo is now a working monorepo with a polished frontend shell and a real auth foundation.

Main apps:

- `apps/web` - Next.js App Router frontend
- `apps/server` - Express API server with Prisma
- `packages/shared` - shared service/category data

## Design Direction

Frontend design was refreshed using the guidance in `frontend design/`.

Current direction:

- warm ivory base
- oxblood primary
- deep teal accent
- antique gold support tone
- softer premium surfaces with art-deco inspired framing

Important design files:

- `apps/web/tailwind.config.ts`
- `apps/web/app/globals.css`
- `apps/web/components/dashboard/dashboard-shell.tsx`
- `apps/web/components/dashboard/dashboard-pages.tsx`
- `apps/web/components/dashboard/dashboard-subpage-primitives.tsx`

## Public Frontend Implemented

Routes implemented:

- `/[locale]`
- `/[locale]/services`
- `/[locale]/how-it-works`
- `/[locale]/about`
- `/[locale]/contact`
- `/[locale]/faq`
- `/[locale]/dashboards`

Relevant files:

- `apps/web/components/landing/landing-page.tsx`
- `apps/web/components/public/public-shell.tsx`
- `apps/web/components/public/public-pages.tsx`

## Dashboard Frontend Implemented

All nav items now have pages.

### Client

- `/[locale]/client`
- `/[locale]/client/new-request`
- `/[locale]/client/my-requests`
- `/[locale]/client/request/[id]`
- `/[locale]/client/favorites`
- `/[locale]/client/wallet`
- `/[locale]/client/settings`

Files:

- `apps/web/components/client/new-request-page.tsx`
- `apps/web/components/client/client-requests-pages.tsx`
- `apps/web/components/client/client-account-pages.tsx`

### Worker

- `/[locale]/worker`
- `/[locale]/worker/requests/incoming`
- `/[locale]/worker/requests/active`
- `/[locale]/worker/earnings`
- `/[locale]/worker/ratings`
- `/[locale]/worker/settings`

Files:

- `apps/web/components/worker/worker-requests-pages.tsx`
- `apps/web/components/worker/worker-earnings-page.tsx`
- `apps/web/components/worker/worker-extra-pages.tsx`

### Admin

- `/[locale]/admin`
- `/[locale]/admin/workers/pending`
- `/[locale]/admin/clients`
- `/[locale]/admin/requests`
- `/[locale]/admin/finance`
- `/[locale]/admin/settings`

Files:

- `apps/web/components/admin/pending-workers-page.tsx`
- `apps/web/components/admin/admin-extra-pages.tsx`

## Backend Implemented

### Auth Foundation

Implemented:

- user registration
- login
- verify-otp placeholder login bridge
- refresh token flow
- logout
- me
- password hashing
- Prisma session records
- JWT access token + refresh token
- httpOnly auth cookies

Main files:

- `apps/server/src/modules/auth/auth.routes.ts`
- `apps/server/src/modules/auth/auth.service.ts`
- `apps/server/src/utils/password.ts`
- `apps/server/src/utils/tokens.ts`
- `apps/server/src/utils/auth-cookies.ts`
- `apps/server/src/middleware/auth.middleware.ts`
- `apps/server/src/lib/prisma.ts`

### Role Guards

Protected server modules:

- `clients.routes.ts` -> `CLIENT`
- `workers.routes.ts` -> `WORKER`
- `admin.routes.ts` -> `ADMIN` / `SUPER_ADMIN`

### Prisma

Prisma schema is large and already includes the product data model in:

- `apps/server/prisma/schema.prisma`

Prisma seed script:

- `apps/server/prisma/seed.ts`

## Frontend Auth / Guards

Implemented:

- login/register forms call API for real
- cookies used for auth
- middleware guards role-based dashboard routes

Files:

- `apps/web/components/auth/auth-forms.tsx`
- `apps/web/lib/api.ts`
- `apps/web/lib/auth-session.ts`
- `apps/web/hooks/use-live-api-data.ts`
- `apps/web/middleware.ts`

## Local Database Status

In the current workspace session, the project was made to work with Prisma Dev local Postgres.

Important notes:

- `prisma dev` failed under Node 20 because of `zstdCompressSync`
- workaround used: `npx -y node@22 "../../node_modules/prisma/build/index.js" dev -d --name osta`
- the generated local DB URL needed `&pgbouncer=true` appended for Prisma client writes to work correctly

Current env files were set with a local Prisma Dev database URL in:

- `.env`
- `apps/server/.env`

These are machine-specific and may need to be changed on another machine.

## Seeded Users

- Client: `+201000000000` / `Password123!`
- Worker: `+201055555555` / `Password123!`
- Admin: `+201099999999` / `Password123!`

## Important Operational Fixes Already Applied

- Next dev/build output conflict fixed by using `.next-dev` in development via `apps/web/next.config.mjs`
- Arabic dashboard pages had a lot of Franco copy; major sections were rewritten back to proper Arabic

## What Is Still Starter / Mock

Even though auth is real now, much of the business data is still starter data returned from routes.

Still mostly mocked or starter-only:

- client favorites/wallet/settings persistence
- worker ratings/settings persistence
- admin clients/requests/finance/settings persistence
- request actions are starter state in memory, not fully DB-driven
- OTP is not a real OTP service yet
- forgot/reset password are placeholder responses
- uploads are not implemented
- payments / escrow are not integrated with a gateway
- chat / realtime / live tracking are not implemented
- many dashboards read starter payloads, not relational DB queries

## Skills Installed For This Repo

Useful local skills were installed under:

- `skills/.agents/skills/`

Most relevant ones used for this repo:

- `better-auth-best-practices`
- `prisma-database-setup`
- `prisma-client-api`
- `nodejs-backend-patterns`
- `api-design-principles`
- `next-best-practices`
- `frontend-design`
- `tailwind-design-system`
- `systematic-debugging`

## Suggested Next Steps

Highest value next work:

1. Replace starter dashboard payloads with real Prisma queries
2. Persist settings pages to DB
3. Build real request lifecycle tables and update worker/client actions to use DB writes
4. Add real OTP / forgot password flow
5. Add file uploads for worker docs and request attachments
6. Add payments / escrow integration
7. Add tests for auth, guards, and dashboard API behavior

## Quick Verification Commands

```bash
npm run lint
npm run typecheck
npm run build --workspace web
npm run build --workspace server
```

## Routes To Check First

```text
/ar/login
/ar/dashboards
/ar/client
/ar/worker
/ar/admin
```
