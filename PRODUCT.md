# Willcall — Product Context

## Register

**product** — App UI for ticketing drops, wallet passes, door scanning, and organizer command center. Marketing home is secondary.

## Users

| User | Context | Primary job |
|------|---------|-------------|
| **Organizer** | Pre-show, live drop, door night | Launch drops, track sell-through, manage tiers, scan tickets |
| **Attendee** | Mobile, social discovery, checkout urgency | Find drops, buy fast, hold wallet pass, share |
| **Door staff** | Venue floor, low light, speed | Scan QR, manual guest lookup, check in |

## Purpose

Willcall is a **drop engine for events people fight to get into**. Every event page should feel like a limited launch: urgency, live demand, clear next action. Not generic event CRUD or SaaS admin.

## Brand personality

Curatorial, editorial, gallery-grade. Confident and calm — a lit exhibition hall, not a SaaS dashboard. High-contrast serif voice on a black canvas, blush & lavender as the single lit accent. (Visual system: see DESIGN.md "The Lit Gallery".)

## Anti-references

- Generic SaaS labels (Dashboard, Browse events, Get Started)
- Cream/sand body backgrounds and safe light themes
- Identical card grids with icon + heading + blurb
- Hero-metric templates (big number, small label, gradient)
- Side-stripe accent borders on every panel
- Form pages that look like auth screens for checkout

## Strategic principles

1. **Drop first** — Poster, countdown, sell-through, tier ladder before CRUD details.
2. **Speed to ticket** — Guest checkout, wallet link, no account wall.
3. **Live momentum** — Pulse badges, velocity, almost-gone states on buyer surfaces.
4. **Command center for organizers** — Health board, not spreadsheet admin.
5. **Accessibility** — Body text ≥4.5:1 on dark panels; keyboard nav on forms and autocomplete.

## Accessibility

- WCAG AA contrast on `--color-text` / `--color-muted` against `--color-bg` and `--color-panel`
- Focus rings on interactive controls
- Autocomplete: ARIA combobox pattern, keyboard navigation
- `prefers-reduced-motion` respected (see globals.css)

## Source of truth

- Product spec: [`SPEC.md`](SPEC.md)
- Visual design: [`DESIGN.md`](DESIGN.md) (Impeccable / Google Stitch format — YAML tokens + six sections)
- Design sidecar: [`.impeccable/design.json`](.impeccable/design.json) (shadows, motion, z-index)
- Brand: [`src/lib/brand.ts`](src/lib/brand.ts)
- Copy: [`src/lib/copy.ts`](src/lib/copy.ts)
