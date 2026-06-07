# Willcall — Development TODO

> QA: [SPEC.md](SPEC.md) · [docs/TEST_SPEC.md](docs/TEST_SPEC.md) · [docs/QA_SCORECARD.md](docs/QA_SCORECARD.md)

## Ship blockers (below V1 minimum)

- [ ] **Production migrations** — Convert schema to Prisma migrate workflow before deploy
- [ ] **Stripe live keys** — Configure `STRIPE_*` + webhook endpoint in production
- [ ] **Resend domain** — Verify sending domain for production email

## Identity layer (six surfaces)

- [x] Ticket drop module with sale states, waitlist, share, sticky mobile CTA
- [x] Guest checkout without account + wallet access token
- [x] Checkout hold timer + transparent fees + promo preview
- [x] Scanner camera + high-contrast result screen + guestlist/VIP
- [x] Dashboard command center metrics + sell-through bar
- [x] Centralized copy in `src/lib/copy.ts`

## Test coverage

- [x] Vitest — crypto, rate limit, copy audit
- [x] Playwright — buyer smoke path
- [x] CI — lint, build, vitest

## V1 features completed this pass

- [x] Willcall rebrand (`src/lib/brand.ts`, `BrandMark`)
- [x] Stripe PaymentElement + webhook fulfillment
- [x] Order holds + inventory reservation
- [x] Promo CRUD + server-side validation
- [x] Attendee list UI + CSV export
- [x] Organizer onboarding (`/dashboard/onboarding`)
- [x] Rate limits on checkout + scan

## V2 backlog (explicitly deferred)

- Dynamic pricing engine UI
- Referral rewards UI
- Waitlist campaigns
- Verified resale marketplace
- Apple/Google Wallet passes
- Offline scanner
- Promoter dashboard + payouts
- Campaign center
- Seating charts
- White-label organizer pages
- Handcrafted event page templates and brand-safe copy prompts

## DevOps

- [ ] Docker setup
- [ ] Sentry monitoring
- [ ] Poster upload (S3/Cloudinary)
