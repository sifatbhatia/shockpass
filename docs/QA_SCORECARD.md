# Turnstile QA Scorecard

> Update after each implementation pass. Rubric: 0 missing · 1 broken · 2 bland · 3 solid · 4 polished · 5 signature

| Module | Current | Target | Evidence |
|--------|---------|--------|----------|
| Auth | 4 | 3 | Split festival layout — [`src/components/AuthWalletForm.tsx`](../src/components/AuthWalletForm.tsx) |
| Organizer onboarding | 3 | 3 | [`src/app/dashboard/onboarding/`](../src/app/dashboard/onboarding/) |
| Event creation | 4 | 3 | Multi-step wizard — [`src/app/dashboard/events/new/`](../src/app/dashboard/events/new/) |
| Ticket tiers | 4 | 3 | Dollar input + tier ladder — [`src/components/drop/TierLadder.tsx`](../src/components/drop/TierLadder.tsx) |
| **Event page** | **5** | **5** | Full-bleed poster, CountdownTimer, HypeMeter, TierLadder — [`src/app/events/[slug]/`](../src/app/events/[slug]/page.tsx) |
| **Checkout** | **5** | **5** | 2-step hold/pay pass flow + trust strip — [`src/app/events/[slug]/checkout/`](../src/app/events/[slug]/checkout/) |
| **Ticket issuing** | 4 | **4** | [`src/lib/order-fulfillment.ts`](../src/lib/order-fulfillment.ts), webhook |
| Wallet | **5** | 4–5 | Horizontal pass cards — [`src/components/TicketPassCard.tsx`](../src/components/TicketPassCard.tsx) |
| **Scanner** | **5** | **5** | Full-viewport camera + display-type results — [`src/app/scan/`](../src/app/scan/) |
| Dashboard | **4** | **4** | InsightCard, SalesVelocityChart, health rows — [`src/app/dashboard/`](../src/app/dashboard/) |
| Promo codes | 3 | 3 | [`src/trpc/routers/promo.ts`](../src/trpc/routers/promo.ts) |
| Attendee list | 3 | 3 | [`src/app/dashboard/events/[id]/attendees/`](../src/app/dashboard/events/[id]/attendees/) |
| Email | 3 | 4 | [`src/lib/email.ts`](../src/lib/email.ts) — Resend when configured |
| **Identity** | **5** | **5** | Bebas Neue display, ui/ primitives, AppShell — [`src/app/globals.css`](../src/app/globals.css), [`src/components/ui/`](../src/components/ui/) |
| **Security** | 4 | **4** | [`src/lib/rate-limit.ts`](../src/lib/rate-limit.ts), webhook, guest tokens |
| Tests | 4 | 3 | Copy audit + unit tests |

**Estimated average: ~4.3 / 5** — festival drop identity achieved on signature surfaces.

## Six signature surfaces

1. Event page + `TicketDropModule` — **5**
2. Checkout + hold timer + Stripe — **5**
3. Wallet + guest access — **5**
4. Scanner + camera — **5**
5. Dashboard command center — **4**
6. Copy / visual identity — **5**

## Not started (V2)

Verified resale, offline scanner, dynamic pricing UI, campaign center, promoter dashboard, seating, white-label, and guided page templates.
