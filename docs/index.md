# Turnstile

> Ticketing built for drops, hype, and packed rooms.

## The Wedge

Most event ticketing platforms are transactional. Turnstile is emotional, social, and conversion-obsessed.

**Drop-style ticketing** — Launch tickets like limited-edition product drops. Early Access opens Friday at 10 AM. Price increases after every 100 sold. VIP unlocks after 80% GA sells out.

This turns tickets into a live market, not a checkout form.

## Current Progress

| Layer | Status | Notes |
|-------|--------|-------|
| **Data model** | ✅ Complete | 13 models, 9 enums |
| **API (tRPC)** | ✅ Complete | 8 routers — event, ticket, order, wallet, organizer, scan, referral, waitlist |
| **Auth** | ⏳ Partial | Email + wallet sign-in; OAuth configured but no UI; checkout still requires auth |
| **Web3** | ✅ Complete | RainbowKit + wagmi |
| **Payments** | ⏳ Partial | Stripe backend + demo checkout; no PaymentElement UI or webhooks |
| **QR / Scanner** | ⏳ Partial | Rotating QR + manual scan; no camera QR; offline mode not built |
| **Home + event pages** | ✅ Strong | Drop-aesthetic buyer surfaces |
| **Wallet** | ✅ Complete | Poster cards, rotating QR, transfer API |
| **Dashboard** | ⏳ Partial | Metrics API; missing attendee list UI, promo CRUD, charts |
| **Email** | ⏳ Stub | HTML template; console transport only |
| **Tests** | ❌ Not started | See [SPEC.md](../SPEC.md) regression matrix |
| **Brand** | ✅ Turnstile | `src/lib/brand.ts` |

Full QA scorecard and ship criteria: [SPEC.md](../SPEC.md)

## Market Differentiation vs Ticketmaster

| Dimension | Ticketmaster | Turnstile |
|-----------|-------------|-----------|
| **Ticket pricing** | Fixed, opaque fees | Dynamic drops, transparent pricing |
| **Hype mechanics** | None | Referral unlocks, social proof, waitlist engine |
| **Creator tools** | Admin panel | Creator codes, affiliate tracking, drop management |
| **Checkout** | Multi-step, account required | Apple Pay / Google Pay, no account needed |
| **Resale** | Controlled by TM | Organizer-controlled, max markup cap |
| **Design** | Bureaucratic SaaS | Drop platform aesthetic, dark-first |
| **Web3** | None | Wallet sign-in, on-chain identity |

## Architecture

```
turnstile/
├── prisma/              # Schema + seed
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/      # UI (BrandMark, EventPoster, …)
│   ├── lib/             # auth, brand, prisma, stripe, email, wagmi
│   ├── trpc/            # tRPC routers
│   └── utils/           # crypto, slug
├── SPEC.md              # Living product + QA spec
└── docs/                # Architecture + API reference
```

## Getting Started

```bash
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev
```

Demo organizer: `demo@turnstile.app` (after seed)

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Event discovery |
| `/events/[slug]` | Public event page |
| `/auth` | Login/signup |
| `/wallet` | Ticket wallet |
| `/dashboard` | Organizer dashboard |
| `/dashboard/events/new` | Create event |
| `/dashboard/events/[id]` | Event management |
| `/scan` | QR door scanner |
| `/tickets/[id]` | Ticket detail |
