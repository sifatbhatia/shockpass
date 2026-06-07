# Willcall

Willcall is a drop-style ticketing product for events that need momentum before doors open. It combines public drop pages, guest checkout, wallet passes, organizer dashboards, promo tooling, and door scanning in a single Next.js app.

## Stack

- Next.js 16 App Router
- React 19
- tRPC v11
- Prisma 7 with Postgres
- NextAuth v5 credentials and wallet auth
- Stripe PaymentIntents
- Tailwind CSS v4
- GSAP for interface motion
- Vitest and Playwright

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Open `http://localhost:3000`.

## Required Env

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
NEXTAUTH_SECRET="replace-me"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
QR_ROTATION_SECRET="replace-me"
```

Optional production services:

```env
STRIPE_SECRET_KEY="sk_live_or_test"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_or_test"
STRIPE_WEBHOOK_SECRET="whsec"
RESEND_API_KEY="re_key"
RESEND_FROM="Willcall <tickets@your-domain.com>"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="walletconnect_project_id"
```

Wallet login is intentionally optional. If `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is missing, email auth still works and the wallet UI is not loaded.

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm run test:e2e
```

## Core Routes

| Route | Purpose |
| --- | --- |
| `/` | Public discovery/home |
| `/events` | Live drop listing |
| `/events/[slug]` | Public event drop page |
| `/events/[slug]/checkout` | Checkout |
| `/auth` | Sign in and signup |
| `/wallet` | Buyer wallet |
| `/dashboard` | Organizer hub |
| `/dashboard/events/new` | Create a drop |
| `/dashboard/events/[id]` | Manage a drop |
| `/scan` | Door scanner |

## Production

Use a real Postgres database and run migrations for fresh environments:

```bash
npx prisma migrate deploy
```

Production setup details, Vercel notes, and remaining hardening work live in [docs/PRODUCTION_SETUP.md](docs/PRODUCTION_SETUP.md).

## Project Docs

- [PRODUCT.md](PRODUCT.md)
- [SPEC.md](SPEC.md)
- [DESIGN.md](DESIGN.md)
- [TODO.md](TODO.md)
- [HANDOFF.md](HANDOFF.md)
