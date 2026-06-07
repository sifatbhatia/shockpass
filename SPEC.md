# Turnstile — Living Spec

> Ticketing built for drops, hype, and packed rooms.

## Brand

| Asset | Value |
|-------|-------|
| **Name** | Turnstile |
| **Monogram** | TS |
| **Domain** | turnstile.app |
| **Tagline** | Ticketing built for drops, hype, and packed rooms. |
| **Source of truth** | `src/lib/brand.ts` |

Turnstile is not just an event ticketing app. It should feel like:

> A drop engine for events people fight to get into.

The app must communicate urgency, exclusivity, trust, demand, and live momentum across the attendee experience and the organizer dashboard. If the app only lets organizers create events and sell tickets, it passes basic functionality but fails the product thesis.

## Product Concept

A ticketing webapp for creators, venues, festivals, nightlife brands, conferences, and pop-up events that helps them sell out faster, not just process orders.

**Every event page should feel like a drop. Every ticket sale should create momentum.**

## Core Users

1. **Event Organizer** — Creates events, manages ticket inventory, tracks sales, checks people in, runs promotions.
2. **Attendee** — Discovers events, buys tickets, joins waitlists, shares referral links, manages wallet passes, transfers tickets.
3. **Door Staff** — Uses mobile check-in scanner, validates QR codes, handles guestlist/VIP exceptions.

## Core Product Pillars

### 1. Drop-Style Ticketing
Launch tickets like limited-edition drops:
- Early Access opens Friday at 10 AM
- 500 tickets available
- Price increases after every 100 sold
- VIP unlocks after 80% GA sells out
- Waitlist gets priority access if someone refunds

### 2. Dynamic Ticket Drops
| Tier | Price | Quantity |
|------|-------|----------|
| Tier 1 (Early Bird) | $35 | First 200 |
| Tier 2 | $45 | Next 300 |
| Tier 3 | $60 | Final 400 |
| VIP | $120 | Max 75 |

Pricing rules: Increase per quantity sold, increase per date, unlock when previous tier sells out.

### 3. Built-in Hype Mechanics
- **Referral unlocks** — Bring 3 friends → VIP bar access. Bring 5 → 25% refund.
- **Social proof feed** — Live sold counts, friends going, waitlist growth.
- **Waitlist engine** — Early access, abandoned-cart releases, resale priority.
- **Creator codes** — Track sales per promoter/artist/sponsor.

### 4. Fast Checkout
Select ticket → Enter phone/email → Apple Pay / Google Pay / Card → Instant ticket → Add to wallet → Share. No account required before purchase.

### 5. Ticket Wallet
- Event poster, date, venue, QR code
- Transfer button with email-based flow
- Add to Apple Wallet / Google Wallet
- Rotating QR codes (30-second window)

### 6. Anti-Fraud & Resale
- Rotating QR codes (HMAC-SHA256)
- Transfer limits and expiration
- Organizer-controlled resale with max markup
- Duplicate scan detection

### 7. Door Scanner
- Scan QR codes
- Search by name/email
- Manual check-in
- VIP/Guestlist modes
- Offline-first (IndexedDB + background sync)
- Color-coded results: green (valid), red (already scanned), purple (VIP), blue (guestlist)

---

## V1 Scope

V1 must support:

- Organizer auth
- Organizer onboarding
- Event creation
- Ticket tier creation
- Public event page
- Live ticket purchase
- Stripe checkout
- Ticket issuing
- QR code ticket delivery
- Attendee wallet
- Mobile check-in scanner
- Promo codes
- Basic organizer dashboard
- Attendee list
- Email confirmation
- Basic event branding

### V1 Implementation Status

Score each module 0–5: `0` missing · `1` broken/generic · `2` functional but bland · `3` solid · `4` polished · `5` signature

| Module | Score | Status | Key files |
|--------|-------|--------|-----------|
| Auth | 2 | Partial — email + wallet; no verify flow, auth required at checkout | `src/lib/auth.ts`, `src/app/auth/` |
| Organizer onboarding | 1 | Missing wizard; Stripe Connect UI not built | `src/trpc/routers/organizer.ts` |
| Event creation | 3 | Done — create + launch with poster presets | `src/app/dashboard/events/new/` |
| Ticket tiers | 2 | Done CRUD; `unlockRule` unused; price-in-cents UX | `src/trpc/routers/ticket.ts` |
| **Event page** | 3–4 | Strong drop panel; missing countdown, sticky mobile CTA, waitlist wire-up | `src/app/events/[slug]/` |
| **Checkout** | 2 | Demo path works; no Stripe Elements, webhook, guest checkout, hold timer | `src/app/events/[slug]/checkout/` |
| **Ticket issuing** | 3 | Demo issues tickets; production needs webhook confirm | `src/trpc/routers/order.ts` |
| Wallet | 3 | Poster cards + rotating QR | `src/app/wallet/`, `src/app/tickets/[id]/` |
| **Scanner** | 2–3 | Manual token entry; no camera QR; VIP works | `src/app/scan/`, `src/trpc/routers/scan.ts` |
| Dashboard | 2 | Metrics API; no attendee table, charts, promo mgmt | `src/app/dashboard/` |
| Promo codes | 2 | Apply at checkout; no organizer CRUD | `src/trpc/routers/order.ts` |
| Attendee list | 1 | API only — no dashboard UI or CSV download | `src/trpc/routers/organizer.ts` |
| Email | 1 | Template done; console stub only | `src/lib/email.ts` |
| Event branding | 2 | Poster + subtitle; no upload, no per-event theme | `src/components/EventPoster.tsx` |
| **Identity** | 3 | Buyer surfaces on-brand; organizer ops generic | `src/app/globals.css`, copy inline |
| Security | 2–3 | Rotating QR + org guards; no rate limits, no webhook | `src/utils/crypto.ts` |

**Estimated V1 average: ~2.5 / 5** — below ship bar of **3.6** (event page, checkout, scanner, identity each ≥ 4).

### V1 Ship Criteria

V1 is ready for public launch only when:

- Organizer can launch an event from scratch
- Buyer can purchase without an account
- Ticket is issued securely (webhook-confirmed)
- Ticket can be scanned at the door
- Dashboard reflects real event health
- Event page feels like a drop, not a database detail page
- Product has recognizable visual and copy identity

If all of that works but still feels bland, the failure is **identity layer** — not engineering.

### Six Signature Surfaces

These screens carry the whole product. Prioritize identity work here before V2:

1. Event page — `src/app/events/[slug]/`
2. Ticket drop module — extract to `src/components/TicketDropModule.tsx`
3. Checkout — `src/app/events/[slug]/checkout/`
4. Wallet + ticket detail — `src/app/wallet/`, `src/app/tickets/[id]/`
5. Scanner — `src/app/scan/`
6. Organizer dashboard — `src/app/dashboard/`

---

## V1 Functional QA Checklist

Use as manual QA, Linear epic, or automated test mapping.

### Organizer auth
- Sign up at `/auth?tab=signup` with organizer intent
- Session persists after refresh
- **Fail if:** blank dashboard, no organizer profile, session breaks

### Event creation
- Draft saves with validation; slug unique; timezone applied
- **Fail if:** publish without date/tiers; broken poster fallback; slug collision unhandled

### Ticket tiers
- States: hidden, locked, on sale, sold out, ended
- Inventory decrements; sold-out not purchasable; sales windows enforced
- **Fail if:** oversell, hidden tier purchasable, max-per-order ignored

### Public event page (`/events/[slug]`)
- Full-bleed hero, ticket drop module, sold progress, sticky buy CTA (mobile), share hook
- **Fail if:** looks like CRUD output; no urgency; mobile CTA buried

### Ticket drop states
- Before sale · on sale · almost sold out · sold out · waitlist · sale ended — each visually distinct

### Checkout
- Guest purchase path; Stripe payment; confirmation email; wallet via magic link
- Fees transparent; hold timer; Apple Pay / Google Pay where supported
- **Fail if:** forced password; fees hidden until last step; refresh loses cart

### Ticket issuing
- Unique ID + hashed QR token per ticket; states: valid, checked in, transferred, refunded, voided
- **Fail if:** reused QR; raw token stored; refunded ticket scans valid

### Wallet (`/wallet`, `/tickets/[id]`)
- Poster, date, venue, tier, large QR, status, transfer affordance
- **Fail if:** requires organizer login; QR too small; no email recovery

### Promo codes
- Percent/fixed, usage limits, expiry, tier-specific — validated server-side
- **Fail if:** usage increments on abandoned checkout; expired codes work

### Dashboard (`/dashboard`, `/dashboard/events/[id]`)
- Gross/net sales, tickets sold, capacity %, tier breakdown, check-ins, promo performance
- **Fail if:** generic cards only; no sell-through; no drill-down links

### Attendee list
- Search, filters, ticket status, CSV export scoped to organizer
- **Fail if:** no search; refunded buyers disappear; cross-org export leak

### Door scanner (`/scan?event=`, `/dashboard/events/[id]/check-in`)
- Valid · already scanned · wrong event · refunded · VIP · guestlist
- Camera scan + manual fallback; high-contrast mobile results
- **Fail if:** desktop-only; duplicate shows success; no manual fallback

### Email confirmation
- Event details, wallet link, refund policy — sent only after confirmed payment

---

## V1 Identity QA

Score 0–3 per dimension: `0` missing · `1` generic · `2` solid · `3` distinctive

| Dimension | Pass standard |
|-----------|---------------|
| **Product voice** | ≥70% of primary CTAs and empty states feel event-native ("Launch drop", "Fill the room") not SaaS ("Create event", "View dashboard") |
| **Visual identity** | Event page recognizable without logo; tokens in `globals.css` used consistently |
| **Event page weight** | Buyer understands in 5s: what, when, where, why urgent, how to buy |
| **Drop mechanics** | Buying feels like catching a release, not a government form |
| **Trust** | Fees, refund policy, ticket status, scanner rejection all obvious |

### Required design tokens

```css
--bg: #050505;
--panel: #0d0d0f;
--panel-2: #17171a;
--text: #f5f5f5;
--muted: #a1a1aa;
--border: rgba(255,255,255,0.1);
--hot: #ff2d55;
--acid: #d7ff3f;
--electric: #6d5dfc;
--success: #22c55e;
--danger: #ef4444;
```

Defined in `src/app/globals.css` as Tailwind v4 `@theme inline` tokens.

---

## V1 Technical QA

### Security (must pass)
- Organizer cannot access another organizer's events
- Buyer cannot access another buyer's wallet by guessing ID
- QR token is not raw database ID
- Stripe webhook verifies signature; payment success from webhook not client redirect alone
- Promo validation server-side

### Performance (must pass)
- Event page LCP under 2.5s on reasonable connection
- Purchase mutation idempotent — no duplicate orders
- Dashboard pagination for large attendee lists
- Scanner response near-instant

### Accessibility (must pass)
- Keyboard-usable checkout; labeled forms and errors
- Scanner result has text, not color only
- Dark theme contrast; QR page supports high brightness

---

## V1 Scoring Rubric — Ship Minimums

| Module | Minimum |
|--------|---------|
| Auth | 3 |
| Event creation | 3 |
| Ticket tiers | 3 |
| Event page | **4** |
| Checkout | **4** |
| Ticket issuing | **4** |
| Wallet | 3 |
| Scanner | **4** |
| Dashboard | 3 |
| Promo codes | 3 |
| Identity | **4** |
| Security | **4** |

**Do not ship publicly below:** average **3.6 / 5**; event page, checkout, scanner, identity each ≥ **4**.

---

## V2 Scope (future — gated on V1 scorecard)

V2 must support:

- Dynamic pricing engine + simulation
- Referral rewards (full UI + checkout wiring)
- Waitlist campaigns
- Verified resale marketplace
- Rotating QR / transfer controls (production-hardened)
- Apple Wallet / Google Wallet passes
- Offline scanner mode
- Guestlist and comps
- Promoter dashboard + payouts
- Campaign center (email/SMS segments)
- Event intelligence dashboard
- Seating charts / tables
- White-label organizer pages (`/o/:organizerSlug`)
- Handcrafted event page templates and brand-safe copy prompts

### V2 Ship Minimums

Average **4 / 5**; verified resale **5**; offline scanner **5**; dynamic pricing **4**; referral engine **4**; promoter dashboard **4**; identity **5**.

**Do not start V2 until V1 average ≥ 3.6.** The fix for an MVP-ish V1 is not more features — it is making the six signature surfaces unmistakable.

---

## Regression Test Matrix

Run after every major feature change:

```
Create event → Publish event → Buy ticket → Apply promo code
→ Receive email → Open wallet → Scan ticket
→ Reject duplicate scan → Refund ticket → Confirm refunded ticket rejects
→ Export attendees → Check dashboard metrics
→ Join waitlist → Send campaign → Track conversion
→ List resale ticket → Buy resale → Confirm original QR invalid
→ Transfer ticket → Confirm old owner loses access
→ Check promoter attribution → Calculate commission
→ Sync offline scanner → Resolve scan conflict
```

Automated coverage target: Vitest for routers/crypto; Playwright for buyer + organizer smoke paths.

---

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Event discovery / marketing |
| `/events` | Event browse + search |
| `/events/[slug]` | Public event page |
| `/events/[slug]/checkout` | Checkout flow |
| `/auth` | Sign in / sign up |
| `/wallet` | Ticket wallet |
| `/dashboard` | Organizer dashboard |
| `/dashboard/events/new` | Create event |
| `/dashboard/events/[id]` | Event management |
| `/dashboard/events/[id]/check-in` | Redirect → scanner |
| `/scan` | Mobile QR scanner |
| `/tickets/[id]` | Individual ticket detail |
| `/api/trpc` | tRPC API endpoint |

---

## Data Model

### Core Entities
- **User** — Attendee/organizer/admin, supports email + wallet + OAuth auth
- **Event** — Event details, status lifecycle (draft → scheduled → live → sold_out → completed → cancelled)
- **TicketTier** — Pricing tier with dynamic rules, unlock conditions
- **Order** — Purchase with Stripe payment, idempotency key for safe retry
- **Ticket** — Individual ticket with rotating QR, transfer support
- **PromoCode** — Discount codes (percent or fixed)
- **WaitlistEntry** — Position-based waitlist with notification lifecycle
- **Referral** — Referral tracking with reward system
- **ScanLog** — Check-in audit trail
- **OrganizerPayout** — Stripe Connect payout tracking

### Ticket Status Lifecycle
```
VALID → CHECKED_IN (scanned at door)
VALID → TRANSFERRED → VALID (claimed by new owner)
VALID → REFUNDED (organizer refunded)
VALID → VOIDED (organizer voided)
```

### Order Status Lifecycle
```
PENDING → PAID (payment confirmed)
PENDING → FAILED (payment failed)
PAID → REFUNDED (organizer refunded)
```

---

## Visual Design

### Typography
- Display / body: Inter (via Google Fonts)
- Mono: JetBrains Mono (prices, countdowns, ticket IDs)

### Layout
```
<main className="max-w-[1650px] mx-auto px-4 md:px-8">
```
Full-bleed hero art can exceed the cap; readable content stays inside.

### Copy conventions
- Primary CTA: `bg-acid text-bg` — "Get tickets", "Launch drop", "Open sales"
- Urgency: `text-hot`, sold-through bars, countdowns
- Section labels: `text-xs uppercase tracking-wider text-muted`
- Centralize event-native copy in `src/lib/copy.ts` (planned)

---

## Differentiation Strategy

**We don't compete on inventory. We compete on conversion.**

Ticketing is a $30B+ industry dominated by Ticketmaster (~70% market share in primary ticketing). We can't beat them on exclusive venue contracts or monopoly power.

But we can win on:

1. **Creator-first product** — Every feature is designed to sell rooms faster, not process fees.
2. **Drop mechanics** — No other platform treats ticket sales as a live market event.
3. **Speed** — Checkout in under 10 seconds with Apple Pay. No account creation gate.
4. **Design** — Looks and feels like a product drop platform, not enterprise SaaS.
5. **Web3 native** — Wallet login, potential for on-chain ticket verification and NFT gated events.
6. **Transparency** — Clear pricing, no hidden fees (unlike TM which adds ~30% in fees).

### Target Audience (Early)
- Independent concert promoters (500–2000 cap venues)
- Nightlife brands and club nights
- Festival organizers (small–medium)
- Conference organizers
- Pop-up events and brand activations
- Creators hosting live shows

### Go-to-Market Wedge
"Drop-style ticketing for events" — the product sells itself when event pages look like product drops. A/B test showing social proof (live sold count, friends going, price increasing) vs static ticket pages and measure conversion lift.

---

## Product Identity Acceptance Tests

### Event page (10 seconds)
Viewer can answer: what is it, when, where, is it popular, are tickets scarce, what do I click next?

### Dashboard (15 seconds)
Organizer knows: tickets sold, sellout proximity, best tier, best channel, next action.

### Door test (no training)
Staff can scan, read success/failure, search manually, handle duplicate, recognize VIP/guestlist.

### Buyer trust
Buyer never wonders: did payment work, where is my ticket, can QR be stolen, can I transfer, what if event changes?
