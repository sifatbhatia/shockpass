# Turnstile — Agent Handoff

**Project path:** `C:\Users\sifat\Documents\projects\shockpass`  
**Current date:** June 6, 2026  
**Product:** Turnstile — drop-style event ticketing for attendees, organizers, and door staff  
**Stack:** Next.js 16.2.7, React 19.2, Tailwind 4, tRPC 11, Prisma 7, PostgreSQL, NextAuth v5 beta, Stripe, RainbowKit/wagmi  
**Package manager:** npm only (`package-lock.json` is canonical)

This is the file a new agent should read first. The user may continue in another IDE or on phone, so assume they need low-lag, high-signal continuity.

---

## Current Status

Turnstile is presentable as a portfolio product prototype. The core app builds and the main buyer/organizer surfaces exist:

- Public home, event discovery, event detail, checkout, wallet, ticket detail, scanner, auth, organizer dashboard.
- Guest checkout exists through wallet access tokens.
- Stripe PaymentElement and webhook fulfillment exist, with demo auto-fulfillment when Stripe is not configured.
- Scanner includes camera QR reader, manual token fallback, and high-contrast result overlay.
- Organizer dashboard includes metrics, attendee list, CSV export, promo tooling, onboarding, and event creation.
- Visual direction is now “Lit Gallery”: black canvas, Fraunces display, DM Sans UI, blush/lavender surfaces, lime nav accent, restrained editorial layout.

Latest verified commands:

```bash
npm run lint   # passed
npm run test   # passed, 12 tests
npm run build  # passed
```

Known non-failing warning:

```text
[DEP0205] DeprecationWarning: module.register() is deprecated
```

This appears during `vitest`/`next build` from dependency/tooling internals. It does not currently fail the app.

---

## Important Repo Notes

- Git is initialized, but all files are currently untracked. Do not assume there is a clean baseline.
- Do not run destructive git commands.
- `.env` exists locally; do not print secrets.
- `AGENTS.md` says this is not the Next.js you know. Before touching Next-specific APIs, read the relevant local docs under `node_modules/next/dist/docs/`.
- The project folder is still named `shockpass`, but the product and package are now `Turnstile`.

Recommended first commit, only if the user asks:

```bash
git add .
git commit -m "Initial Turnstile V1 prototype"
```

---

## Latest Work Completed

### Assets Wired

User generated UI/product assets and they are now copied into:

```text
public/assets/pass-texture.png
public/assets/empty-drops-gallery.png
public/assets/empty-wallet-rope.png
public/assets/scan-success-moment.png
public/assets/trust-icons-sheet.png
```

Brand icons exist in:

```text
public/brand/icon-32x32.png
public/brand/icon-80x80.png
public/brand/icon-120x120.png
public/brand/icon-152x152.png
public/brand/icon-180x180.png
public/brand/icon-192x192.png
public/brand/icon-512x512.png
public/brand/icon-1024x1024.png
```

### UI/UX Upgrades

- `src/components/SiteFooter.tsx`
  - New full-viewport footer.
  - Uses scan/pass imagery, large editorial type, blush/lavender glow, lime CTA accents.

- `src/components/ui/DropNav.tsx`
  - Desktop mega menu is now a constrained floating sheet attached to header.
  - Mobile menu now opens as a connected dropdown below the header instead of a separate full-screen thing.
  - Motion uses softer vertical reveal and scrim.

- `src/components/home/HomePageView.tsx`
  - Home after “Live now” was upgraded from generic sections into a stronger editorial layout.
  - Split headline/content bands, numbered pills, thin rules, rounded trust rows, brand-color accents.

- `src/components/ui/EmptyState.tsx`
  - Supports `illustration="drops"` and `illustration="wallet"`.

- `src/components/TicketPassCard.tsx` and `src/app/tickets/[id]/page.tsx`
  - Pass texture applied to wallet cards and ticket detail.

- `src/app/events/[slug]/checkout/page.tsx`
  - Checkout trust strip now uses generated icon sheet.

- `src/components/ScanResultScreen.tsx`
  - Successful scan result shows generated success moment image.

### Lint Cleanup

- ESLint ignores bundled tooling folders:
  - `.github/skills/**`
  - `.impeccable/**`
  - `.cursor/**`
- Fixed React 19 lint warnings around synchronous state set in effects.
- Removed unused imports.

---

## Key Files

```text
src/app/page.tsx                         # home page entry
src/components/home/HomePageView.tsx     # home UI
src/components/AppShell.tsx              # nav + optional footer shell
src/components/SiteFooter.tsx            # 100vh footer
src/components/ui/DropNav.tsx            # header / mega menu / mobile dropdown
src/lib/copy.ts                          # user-facing copy
src/lib/brand.ts                         # brand name, logo paths, domain
src/app/globals.css                      # tokens, animations, shared visual utilities
src/lib/auth.ts                          # NextAuth setup
src/trpc/routers/_app.ts                 # tRPC root
src/trpc/routers/order.ts                # checkout/order logic
src/lib/order-fulfillment.ts             # ticket issuing
src/app/api/webhooks/stripe/route.ts     # Stripe webhook
prisma/schema.prisma                     # data model
```

Docs worth reading:

```text
PRODUCT.md
DESIGN.md
SPEC.md
TODO.md
docs/QA_SCORECARD.md
docs/TEST_SPEC.md
ASSETS-BRIEF.md
```

Warning: some older docs may still overstate or understate implementation status. Trust code plus this handoff first.

---

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home / discovery landing |
| `/events` | Browse drops |
| `/events/[slug]` | Public event page |
| `/events/[slug]/checkout` | Guest checkout hold/pay flow |
| `/auth` | Email/wallet sign in and signup |
| `/wallet` | Buyer wallet |
| `/tickets/[id]` | Ticket detail + rotating QR |
| `/dashboard` | Organizer hub |
| `/dashboard/onboarding` | Organizer profile setup |
| `/dashboard/events/new` | Event/drop creation |
| `/dashboard/events/[id]` | Event management |
| `/dashboard/events/[id]/attendees` | Attendee list + CSV |
| `/dashboard/events/[id]/check-in` | Redirects to scanner |
| `/scan` | Door scanner |

---

## Product Direction

Do not make it generic SaaS.

Preferred language:

- “Drop”
- “Launch a drop”
- “Find the drop”
- “Get tickets”
- “Organizer hub”
- “Fill the room”
- “Door scanner”

Avoid primary UI labels like:

- “Create event”
- “View dashboard”
- “Manage tickets”
- “Discover events”
- “Get Started”

Centralize user-facing copy in `src/lib/copy.ts`.

---

## Visual Direction

Current brand style:

- Black gallery background, not colorful festival neon.
- Blush: `#f8d6f7`
- Lavender: `#ecdffb`
- Lime nav accent: `#d4ff52`
- Mint validation: `#8fd9bd`
- Fraunces display, DM Sans UI, JetBrains Mono data/pills.
- Use editorial split layouts, thin rules, numbered pills, large type, dark panels.
- Cards can exist for repeated items, but avoid nested cards and generic card grids.
- Do not introduce orange, beige, blue-slate, purple-gradient-heavy, or generic startup palettes.

Important CSS utilities/tokens live in `src/app/globals.css`:

```css
.pass-texture
.trust-icon-sheet
.grain-overlay
.stage-vignette
.animate-pass-glow
.animate-live-pulse
```

---

## Auth Reality Check

The user asked if sign-in already exists. Yes, it does, but production identity is not fully hardened.

Current state:

- `/auth` has email login/signup and wallet sign-in.
- Email credentials auth creates/finds user by email with no password, magic-link, or verification.
- Wallet sign-in verifies a signature.
- Dashboard gate can promote an attendee to organizer by calling `user.ensureOrganizer`.

Implication:

- Presentable for prototype/demo.
- Not production-secure identity.
- Next real step should be magic-link email verification or stricter organizer invite/approval.

---

## Payment Reality Check

Current state:

- Stripe PaymentIntent is created when Stripe env vars are configured.
- PaymentElement UI is present.
- Webhook verifies Stripe signature and fulfills paid orders.
- When Stripe is not configured, demo checkout auto-fulfills tickets.

Production blockers:

- Configure live Stripe keys.
- Configure webhook endpoint and `STRIPE_WEBHOOK_SECRET`.
- Verify order idempotency under real retries.
- Confirm Stripe Connect strategy if organizers need direct payouts.

---

## Email Reality Check

`src/lib/email.ts` has confirmation template behavior, but if Resend is not configured it logs to console.

Production blocker:

- Verify Resend domain and set API key.
- Remove or guard console-only behavior for production observability.

---

## Database / Prisma

Current setup:

- Prisma schema is in `prisma/schema.prisma`.
- Prisma client outputs to `src/generated/prisma`.
- Local dev likely uses `db push`.

Production blocker:

- Move to proper Prisma migrations before deploy.

Useful commands:

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

---

## Tests

Current tests:

```text
src/lib/rate-limit.test.ts
src/utils/crypto.test.ts
tests/identity/copy-audit.test.ts
tests/lib/us-locations.test.ts
tests/e2e/v1-smoke.spec.ts
```

Commands:

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

E2E likely needs a running dev server and seeded/demo data. Check `playwright.config.ts`.

---

## Known Gaps / Best Next Tasks

High priority:

- Update `README.md`; it is still the default create-next-app README.
- Make auth production-real: email magic link or passwordless verification, no blind organizer promotion.
- Prisma migrations for production.
- Stripe live/webhook setup docs.
- Resend production email setup.
- Visual QA pass in browser on desktop and mobile, especially header dropdown and lower-home sections.

Medium priority:

- Poster upload via S3/Cloudinary.
- Remove unused WalletConnect v1 dependency if not needed.
- Align older docs that still say features are missing.
- Run Playwright smoke with seeded DB.
- Improve attendee CSV escaping for commas/quotes.
- Add tests for checkout order idempotency and promo usage boundaries.

Deferred V2:

- Dynamic pricing engine UI.
- Referral rewards UI.
- Verified resale.
- Apple/Google Wallet passes.
- Offline scanner.
- Seating charts.
- White-label organizer pages.
- Campaign center.

---

## Current Audit Snapshot

Last audit run:

```bash
git status --short
npm run lint
npm run test
npm run build
rg -n "Shockpass|Command center|TODO|FIXME|console\\.log|demo|missing|not built|no verify|stale|ship blocker" README.md HANDOFF.md TODO.md SPEC.md PRODUCT.md DESIGN.md src docs tests
```

Findings:

- Gates pass.
- All repo files are untracked.
- README is stale default Next text.
- Some docs are stale:
  - `docs/index.md` says no PaymentElement/webhooks/camera scanner/attendee UI, but code now has those.
  - `SPEC.md` has older score rows, but detailed checklist remains useful.
  - `PRODUCT.md` still says “Command center” conceptually; UI copy uses “Organizer hub.”
- `src/lib/email.ts` logs email details when email provider is not configured.
- Demo checkout paths are intentionally present for local/prototype mode.

---

## If Continuing Tomorrow

Suggested sequence:

1. Open home page and visually check desktop/mobile header + footer.
2. Update `README.md` for Turnstile.
3. Update stale `docs/index.md` and `SPEC.md` score table.
4. Run or repair Playwright E2E against seeded data.
5. Start production-hardening auth/payment/email only after UI presentation pass is approved.

Keep the product weird, sharp, and event-native. The user does not want default SaaS.
