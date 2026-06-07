# Turnstile Production Setup

This guide is for wiring the local Turnstile app to real production services while keeping the current local setup usable.

## 1. Local Development Stays As-Is

Use local `.env` for development:

```bash
npm install
npx prisma generate
npm run dev
```

If your local database is offline, public discovery pages have demo fallback data so the UI can still render. Production should use a real database.

## 2. Cloud Database

Recommended options:

- Neon Postgres
- Supabase Postgres
- Railway Postgres
- Render Postgres
- Prisma Postgres

Create a production Postgres database and set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"
```

For Prisma Postgres / Accelerate style URLs:

```env
DATABASE_URL="prisma+postgres://..."
```

After creating the DB:

```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate deploy
```

Important: do not rely on `prisma db push` for production. Use migrations.

## 3. Auth

Set:

```env
NEXTAUTH_SECRET="a-long-random-secret"
NEXTAUTH_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

Current auth is prototype-grade:

- Email credentials sign in by typed email.
- Wallet sign-in verifies a signature.
- Organizer access can be enabled in-app.

Before a real launch, replace email credentials with verified magic-link email or another real identity flow. Also restrict organizer upgrades to invite/approval or admin action.

## 4. Stripe

Set:

```env
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Create a webhook endpoint:

```text
https://your-domain.com/api/webhooks/stripe
```

Subscribe at minimum:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Local testing with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then copy the printed webhook secret into `.env`.

Current behavior:

- If Stripe is configured, checkout creates real PaymentIntents.
- If Stripe is not configured, demo checkout auto-fulfills tickets for local presentation.

## 5. Email

Recommended provider: Resend.

Set:

```env
RESEND_API_KEY="re_..."
EMAIL_FROM="Turnstile <tickets@your-domain.com>"
```

Verify the sending domain in Resend before production.

Current fallback:

- If email is not configured, `src/lib/email.ts` logs ticket email details to the server console.

## 6. QR Signing

Set a strong secret:

```env
QR_ROTATION_SECRET="a-long-random-secret"
```

Changing this invalidates existing rotating QR token validation assumptions.

## 7. Deployment

Recommended deployment targets:

- Vercel for Next.js hosting
- Railway/Render/Fly.io if you want DB and app in one place

### Vercel Quick Path

Yes, this app can run on Vercel. The lowest-friction path is:

1. Push the repo to GitHub.
2. Import the GitHub repo in Vercel.
3. Keep the default Next.js build settings:
   - Build command: `npm run build`
   - Install command: `npm install`
   - Output directory: leave blank / framework default
4. Add production environment variables in Vercel Project Settings.
5. Attach a production Postgres database.
6. Run Prisma migrations against that database.
7. Redeploy.

Minimum env vars for an online demo:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="https://your-vercel-domain.vercel.app"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
QR_ROTATION_SECRET="..."
```

For real paid checkout, also add:

```env
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

After the first Vercel URL exists, update `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, and Stripe webhook URLs to the final production domain.

Production build command:

```bash
npm run build
```

Start command:

```bash
npm run start
```

Environment variables must be set in the hosting dashboard, not committed.

### Current Vercel POC

Current production alias:

```text
https://turnstile-tau.vercel.app
```

Current state:

- Vercel production envs are configured for `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, and `QR_ROTATION_SECRET`.
- `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` should remain set to `https://turnstile-tau.vercel.app` until a custom domain is attached.
- The production database schema has been initialized and the app has three demo public drops for presentation.
- `.vercelignore` excludes local `.env` files so Vercel uses dashboard env vars instead of localhost values.
- The repo includes an initial Prisma migration at `prisma/migrations/20260606192500_init/migration.sql` for future clean databases.

If a future owner creates a fresh database, run:

```bash
npx prisma migrate deploy
```

The current POC database was initialized before the migration file was added, so do not blindly run the init migration against that same already-initialized database unless it has been baselined or reset.

## 8. Required Production Checklist

Before selling as a live system:

- [ ] Production Postgres with Prisma migrations
- [ ] `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`
- [ ] Real verified email auth
- [ ] Organizer role approval/invites
- [ ] Stripe live keys
- [ ] Stripe webhook endpoint and secret
- [ ] Resend domain and API key
- [ ] `QR_ROTATION_SECRET`
- [ ] Error monitoring, such as Sentry
- [ ] Analytics, such as PostHog or Vercel Analytics
- [ ] Backups for Postgres
- [ ] Refund/void flows tested
- [ ] E2E checkout/scanner test passing against seeded production-like data

## 9. Optional Services

Poster upload:

- Cloudinary
- S3 + CloudFront
- UploadThing

SMS campaigns:

- Twilio
- Knock

Monitoring:

- Sentry
- Axiom
- Logtail/Better Stack

## 10. Selling Notes

The current repo is best described as a polished V1 prototype / demo MVP. It is not yet a fully hardened ticketing business unless the production checklist is completed.

Suggested positioning:

> Turnstile is a conversion-focused drop engine for events: live demand, fast checkout, wallet passes, and door scanning in one product.

Suggested pricing if sold as custom work:

- Polished prototype / portfolio MVP: `$12k-$25k`
- Production MVP with deployment and payment/email setup: `$35k-$75k`
- Hardened ticketing product with monitoring, migrations, support, refunds, compliance workflows: `$80k-$150k+`
