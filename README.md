# OSTA

OSTA is a monorepo with:

- `apps/web` - Next.js bilingual frontend
- `apps/server` - Express API + Prisma
- `packages/shared` - shared frontend data/constants

## What Is Implemented

- Public marketing pages: landing, services, how-it-works, about, contact, faq
- Dashboard hub
- Client dashboard + subpages
- Worker dashboard + subpages
- Admin dashboard + subpages
- Auth foundation: register, login, me, refresh, logout
- Prisma-backed users and sessions
- Role-based API guards
- Next middleware route guards for `client`, `worker`, and `admin`

## Local Run

There are 2 supported ways to run the project locally.

### Option A - Docker/Postgres

Use this if you already have Docker.

1. Install dependencies

```bash
npm install
```

2. Create env files

```bash
copy .env.example .env
copy .env.example apps\server\.env
```

3. Start services

```bash
docker compose up -d
npm run prisma:generate
npm run prisma:push
npm run seed
```

4. Start the app

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:web
```

### Option B - Prisma Dev Local Database

Use this if Docker is not installed.

Important: `prisma dev` needs Node 22 in this project environment.

1. Install dependencies

```bash
npm install
```

2. Start Prisma Dev database from `apps/server`

```bash
cd apps/server
npx -y node@22 "../../node_modules/prisma/build/index.js" dev -d --name osta
```

3. Print the Prisma Dev connection info

```bash
npx -y node@22 "../../node_modules/prisma/build/index.js" dev ls
```

4. Copy the `TCP` database URL into both:

- `.env`
- `apps/server/.env`

If you use Prisma Dev, append this to the database URL:

```text
&pgbouncer=true
```

5. Push schema and seed data

```bash
cd ../..
npm run prisma:generate
npm run prisma:push
npm run seed
```

6. Start the app

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:web
```

## App URLs

- Web: `http://localhost:3000`
- API: `http://localhost:4000`
- Arabic login: `http://localhost:3000/ar/login`
- Dashboard hub: `http://localhost:3000/ar/dashboards`

Use `localhost`, not `127.0.0.1`, because auth cookies are host-sensitive.

## Seeded Test Accounts

- Client: `+201000000000` / `Password123!`
- Worker: `+201055555555` / `Password123!`
- Admin: `+201099999999` / `Password123!`

## Useful Scripts

```bash
npm run dev:web
npm run dev:server
npm run prisma:generate
npm run prisma:push
npm run seed
npm run lint
npm run typecheck
npm run build --workspace web
npm run build --workspace server
```

## Notes

- `apps/web` uses `.next-dev` in development to avoid the `@swc vendor-chunks` conflict between dev and build output.
- Dashboard/API auth is role-based:
  - client routes require `CLIENT`
  - worker routes require `WORKER`
  - admin routes require `ADMIN` or `SUPER_ADMIN`

## Handoff

Read `MEMORY.md` before continuing work. It contains the current architecture state, implemented areas, known gaps, and recommended next steps.
