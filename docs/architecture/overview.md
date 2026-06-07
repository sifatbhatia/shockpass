# Architecture

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **API Layer**: tRPC v11 (end-to-end typesafe APIs)
- **Database**: PostgreSQL via Prisma 7
- **Auth**: NextAuth.js v5 (JWT strategy)
- **Web3**: RainbowKit + wagmi + viem
- **Payments**: Stripe Connect
- **Styling**: Tailwind CSS
- **Fonts**: Inter (UI), JetBrains Mono (code/prices)
- **Email**: HTML templates via console (stub)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/trpc/[trpc]/    # tRPC HTTP handler (GET + POST)
│   ├── events/[slug]/      # Public event detail page
│   ├── auth/               # Login / signup
│   ├── wallet/             # Attendee ticket wallet
│   ├── dashboard/          # Organizer dashboard
│   │   ├── events/new/     # Create event form
│   │   └── events/[id]/    # Event management (tiers, analytics)
│   ├── scan/               # Mobile QR scanner
│   └── tickets/[id]/       # Individual ticket detail
├── components/
│   ├── Providers.tsx        # Auth + Web3 + Toast providers
│   └── TRPCProvider.tsx     # tRPC React Query provider
├── lib/
│   ├── auth.ts             # NextAuth config (Email, Wallet, Google, Apple)
│   ├── brand.ts            # Willcall name, tagline, monogram
│   ├── prisma.ts           # Prisma client singleton
│   ├── stripe.ts           # Stripe client factory
│   ├── email.ts            # Email template (stub)
│   └── wagmi.ts            # RainbowKit / wagmi config
├── trpc/
│   ├── client.ts           # tRPC React client
│   ├── context.ts           # Request context (session, prisma)
│   ├── init.ts              # tRPC initialization + procedures
│   └── routers/             # API route handlers
│       ├── _app.ts          # Router merge
│       ├── event.ts         # Event CRUD + publish flow
│       ├── ticket.ts        # Ticket tier management
│       ├── order.ts         # Order + Stripe payment flow
│       ├── wallet.ts        # Ticket wallet + transfer
│       ├── organizer.ts     # Dashboard analytics + payouts
│       ├── scan.ts          # QR validation + check-in
│       ├── referral.ts      # Referral codes + rewards
│       └── waitlist.ts      # Waitlist management
├── utils/
│   ├── crypto.ts           # QR token generation, HMAC rotation
│   └── slug.ts             # URL slug generation
└── generated/prisma/       # Generated Prisma client
```

## Data Flow

```
Browser → tRPC client → /api/trpc → tRPC router → Prisma → PostgreSQL
                                     ↑
                              Context (session + prisma)
```

## Auth Flow

### Email
1. User enters email → `signIn('email')` → magic link sent
2. Clicks link → session created → JWT stored

### Wallet
1. User connects wallet (RainbowKit) → address available
2. Clicks "Sign in with wallet" → signs EIP-191 message
3. Verify signature via viem → create/get user → JWT

### OAuth
1. Google/Apple OAuth → callback → create/get user → JWT

## Security

- **QR tokens**: HMAC-SHA256 with rotating secret (30s window)
- **Idempotency**: Orders use idempotency keys for safe retry
- **Web3**: Message verification via `viem.verifyMessage`
- **Auth**: JWT with `next-auth`, session strategy
- **API**: tRPC protectedProcedure + organizerProcedure guards
