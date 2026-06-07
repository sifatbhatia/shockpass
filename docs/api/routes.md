# API Reference

All APIs are exposed via tRPC at `/api/trpc`. All procedures are typesafe end-to-end.

## Event Router

### `event.list`
List public events with pagination.
```ts
Input: { cursor?: string, limit?: number, city?: string, search?: string }
Output: { events: Event[], nextCursor?: string }
```

### `event.getBySlug`
Get single event by slug (public).
```ts
Input: { slug: string }
Output: Event with ticketTiers and organizer
```

### `event.getById`
Get event by ID (organizer only).
```ts
Input: { id: string }
Output: Event with _count
```

### `event.create`
Create new event. Requires ORGANIZER role.
```ts
Input: { title, subtitle?, description, posterUrl, venueName, venueAddress, city, timezone, startsAt, endsAt, capacity, visibility? }
Output: Event
```

### `event.myEvents`
List organizer's events.
```ts
Input: { cursor?, limit? }
Output: { events: Event[], nextCursor? }
```

## Ticket Router

### `ticket.create`
Create ticket tier. Requires ORGANIZER.
```ts
Input: { eventId, name, description?, priceCents, currency?, quantityTotal, maxPerOrder?, salesStartAt?, salesEndAt?, unlockRule?, sortOrder? }
```

### `ticket.openSales` / `ticket.closeSales`
Open or close sales for a tier.

### `ticket.checkAvailability`
Check how many tickets are available.
```ts
Input: { tierId, quantity }
Output: { available, canPurchase, maxPerOrder, priceCents, currency }
```

## Order Router

### `order.create`
Create order and Stripe PaymentIntent.
```ts
Input: { eventId, ticketTierId, quantity, buyerEmail, buyerPhone?, promoCode?, referralCode?, idempotencyKey? }
Output: { orderId, clientSecret }
```

### `order.confirm`
Confirm order after successful Stripe payment. Issues tickets.
```ts
Input: { orderId, paymentIntentId }
```

### `order.refund`
Refund an order. Requires ORGANIZER.

## Wallet Router

### `wallet.getTickets`
Get authenticated user's tickets.
```ts
Input: { status?, cursor?, limit? }
```

### `wallet.initiateTransfer`
Start ticket transfer to another email.
```ts
Input: { ticketId, recipientEmail }
```

### `wallet.acceptTransfer`
Accept a transfer via token.
```ts
Input: { transferToken }
```

## Scan Router

### `scan.validate`
Validate QR token and check in attendee.
```ts
Input: { eventId, qrToken, deviceInfo? }
Output: { result: 'VALID' | 'ALREADY_SCANNED' | 'WRONG_EVENT' | 'REFUNDED' | 'VIP' | 'GUESTLIST', ticket? }
```

### `scan.search`
Search attendees by name/email.

### `scan.stats`
Check-in stats for an event.

## Organizer Router

### `organizer.dashboard`
Full analytics for an event.
```ts
Input: { eventId }
Output: { metrics, salesChart, salesByTier, salesByChannel, topReferralCodes }
```

### `organizer.attendees`
Paginated attendee list.

### `organizer.connectStripe`
Create Stripe Connect Express account.

## Referral Router

### `referral.create`
Create referral code.

### `referral.trackClick` / `referral.trackConversion`
Track referral engagement.

## Waitlist Router

### `waitlist.join`
Join event waitlist.

### `waitlist.notifyNext`
Notify next N waitlist entries (ORGANIZER).

### `waitlist.list`
List waitlist entries (ORGANIZER).
