# Willcall Test Spec

Full product QA specification. Canonical living spec: [../SPEC.md](../SPEC.md).

## Product standard

Willcall is a **drop engine for events people fight to get into** — not generic ticketing CRUD.

## V1 functional QA

See [SPEC.md § V1 Functional QA Checklist](../SPEC.md#v1-functional-qa-checklist) for complete test cases covering:

- Organizer auth & onboarding
- Event + tier creation
- Public event page / ticket drop module
- Guest checkout + Stripe + hold timer
- Ticket issuing + wallet access token
- Promo codes (server-validated)
- Dashboard metrics + attendee list + export
- Door scanner (camera + manual + VIP/guestlist)
- Email confirmation (Resend)

## V1 identity QA

Score 0–3 on: product voice, visual identity, event page weight, drop mechanics, trust.

Minimum ship: identity ≥ 4/5 on rubric; event page, checkout, scanner ≥ 4.

## V1 technical QA

- Security: org isolation, wallet access tokens, hashed QR, Stripe webhook, rate limits
- Performance: LCP, idempotent orders, paginated attendees
- Accessibility: keyboard checkout, scanner text results, contrast

## V2 scope (deferred)

Dynamic pricing, referrals UI, waitlist campaigns, verified resale, wallet passes, offline scanner, promoter dashboard, campaign center, seating, white-label, and guided page templates.

**Gate:** V1 average ≥ 3.6 before starting V2.

## Regression matrix

```
Create event → Publish → Buy ticket → Apply promo → Email → Wallet
→ Scan → Duplicate reject → Refund reject → Export attendees
→ Dashboard metrics → Waitlist join
```

Automated: `npm test` (Vitest) + `npm run test:e2e` (Playwright).

## Scoring rubric

| Module | V1 min |
|--------|--------|
| Event page | 4 |
| Checkout | 4 |
| Scanner | 4 |
| Identity | 4 |
| Security | 4 |
| **Average** | **3.6** |

Live scores: [QA_SCORECARD.md](./QA_SCORECARD.md)
