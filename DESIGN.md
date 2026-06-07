---
name: Turnstile
description: Editorial gallery ticketing — black canvas, high-contrast serif, blush & lavender accents
colors:
  canvas-black: "#050505"
  panel: "#181818"
  panel-raised: "#232323"
  text-primary: "#f7f5f5"
  text-muted: "#a3a1a8"
  text-muted-deep: "#4a4a4a"
  border-subtle: "#ffffff1a"
  blush: "#f8d6f7"
  blush-deep: "#f0bdee"
  lavender: "#ecdffb"
  rose: "#f59ac0"
  mint: "#8fd9bd"
  danger: "#ef6f6f"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(3rem, 8vw, 6.5rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "-0.015em"
  title:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.18em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  drop: "0.75rem"
  pass: "1.25rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  section: "5rem"
components:
  button-primary:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.canvas-black}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1.5rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.blush-deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pill}"
    padding: "0.625rem 1.5rem"
  input-default:
    backgroundColor: "{colors.panel-raised}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.drop}"
    padding: "0.625rem 1rem"
    height: "2.75rem"
  panel-default:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.pass}"
    padding: "1.5rem"
---

# Design System: Turnstile

## 1. Overview

**Creative North Star: "The Lit Gallery"**

Turnstile is staged like a dark exhibition hall: a near-black canvas, art (event posters, passes) lit by soft ambient glow, and a high-contrast serif that carries the voice. Tickets are treated as collectible objects, event pages as exhibition openings. The register is **product** (wallet, checkout, command center are real task surfaces) presented with **gallery-grade editorial polish** — calm, curatorial, confident. "Design becomes invisible and the work speaks for itself."

Depth comes from tonal layering (`canvas-black` → `panel` → `panel-raised`) plus rare, soft pastel glows — never neon. Accents are a **blush pink** and a **pale lavender** used sparingly on primary actions, live states, and light moments; the canvas stays overwhelmingly black and white.

**Key characteristics:**

- High-contrast serif (Fraunces) headlines in mixed case — never uppercased, never in UI chrome
- DM Sans for all body, navigation, forms, buttons, data labels
- Blush `#f8d6f7` + lavender `#ecdffb` accents on a pure-black canvas
- Pill-shaped buttons and capsule labels; generous, editorial spacing
- Soft ambient radial glows (blush/lavender/mint) instead of hard neon
- Naturalistic, gallery-grade imagery; posters and passes are the subject

This system explicitly rejects (per PRODUCT.md): generic SaaS labels, identical icon+heading+blurb grids, hero-metric templates, cream/light themes, and form-page checkout. It also rejects the prior festival-neon treatment (acid green, all-caps Bebas, hard glows).

## 2. Colors

A black-and-white gallery with two pastel accents; color is a whisper, not a shout.

### Primary

- **Blush** (#f8d6f7): Primary buttons, live/on-sale states, focus rings, selected tier, key highlights. Black text always sits on blush.
- **Blush Deep** (#f0bdee): Primary button hover only.

### Secondary

- **Lavender** (#ecdffb): VIP/pre-sale panels, checked-in pass states, secondary glow, soft callouts.
- **Rose** (#f59ac0): Urgency — almost gone, hold timers, critical sell-through.

### Tertiary

- **Mint** (#8fd9bd): Valid passes, success states, live pulse dot — a muted sage, never neon green.
- **Danger** (#ef6f6f): Errors, refunded/invalid scans — a softened red, not fire-engine.

### Neutral

- **Canvas Black** (#050505): Page background, pass-notch fill, scanner vignette.
- **Panel** (#181818): Cards, nav backdrop, drop module shell.
- **Panel Raised** (#232323): Inputs, nested tiers, skeleton base.
- **Text Primary** (#f7f5f5): Headlines, body on dark.
- **Text Muted** (#a3a1a8): Secondary copy, labels — WCAG-tuned on dark panels.
- **Text Muted Deep** (#4a4a4a): Dividers context, faint captions, disabled glyphs.

**The Whisper Accent Rule.** Blush and lavender appear on ≤10% of any screen — primary action, live state, focus, one lit moment. The canvas stays black and white; the accent is the spotlight, not the wall.

**The Gray-on-Color Rule.** Never put muted gray text on blush, lavender, rose, or mint. Use `{colors.canvas-black}` on accent fills.

**The No-Neon Rule.** Glows are soft (12–22% alpha radial). If it looks like a club laser, dial it back to gallery candlelight.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback) — high-contrast, ball-terminal editorial serif with optical sizing.
**Body Font:** DM Sans (with system-ui fallback).
**Secondary Sans:** Afacad — optional, for softer secondary captions.
**Data Font:** JetBrains Mono — prices, counts, timers, ticket IDs, QR captions.

**Character:** Curatorial and literary. Fraunces gives headlines museum-caption gravity; DM Sans keeps every task surface plain and trustworthy. The contrast between the two IS the voice.

### Hierarchy

- **Display** (500, clamp 3–6.5rem, lh 0.95, tracking -0.02em): Brand wordmark, event titles, hero headlines, section openers. Mixed case.
- **Headline** (500, clamp 2–3rem): Section titles ("Live now", "The drop", "About").
- **Title** (600, 1rem, DM Sans): Dashboard event names, card titles, tier names in product contexts.
- **Body** (400, 0.9375rem, lh 1.7, max ~65ch): Descriptions, checkout copy, about text.
- **Label** (500, 0.75rem, uppercase, tracking 0.18em): Section labels, capsule tags, meta — small caps only.
- **Mono** (500, 0.875rem): Prices, sell-through counts, hold timers, promo codes.

**The Serif Boundary Rule.** Fraunces is for headlines, event titles, and the wordmark only. Buttons, nav links, form labels, table headers, and data always use DM Sans.

**The Mixed-Case Rule.** Display serif is never `text-transform: uppercase`. Uppercasing is reserved for small tracked labels (0.18em) only.

## 4. Elevation

Hybrid: flat panels at rest, soft pastel glow for live/selected/valid states, deep ambient shadow for floating surfaces.

### Shadow Vocabulary

- **Glow Blush** (`0 0 48px rgba(248,214,247,0.16)`): Live drop module, selected tier, valid pass pulse.
- **Glow Rose** (`0 0 36px rgba(245,154,192,0.18)`): Urgency, almost-gone sell-through.
- **Panel Lift** (`0 24px 60px rgba(0,0,0,0.5)`): Sticky panels, pass hover, order stub.
- **Sheet Rise** (`0 -12px 40px rgba(0,0,0,0.55)`): Mobile drop bottom sheet.

**The Candlelight Rule.** Glow appears only as a response to state (live, selected, valid). Surfaces are flat by default; depth otherwise comes from tonal layering and dashed perforation, not drop shadows.

## 5. Components

### Buttons

- **Shape:** Pill (`rounded-full`), min height 44px, DM Sans medium, tracking tight.
- **Primary:** Blush fill, canvas-black text, blush-deep hover, soft glow.
- **Ghost:** Transparent, subtle border, panel-raised hover.
- **Outline:** Blush border at 45%, blush/10 hover — secondary CTA on dark heroes.
- **Rose / Lavender:** Reserved for pay-now and wallet-connect — not generic actions.
- **Focus:** 2px blush ring at 60%, 2px offset on canvas-black — all variants.

### Inputs

- **Style:** Panel-raised fill, subtle border, drop radius (12px), 44px min height, DM Sans.
- **Focus:** Blush border tint + `.focus-ring`.
- **Error:** Danger border; `FieldHint` in danger.

### Panels / Cards

- **Corners:** Pass radius (20px) for passes/panels, drop radius (12px) for inputs/small tiles.
- **Pass cards:** Poster strip, perforation notches, dashed tear line before QR/details.
- **Event cards:** Poster-dominant (`EventDropCard`); featured spans full-width horizontal on desktop.
- **No nested cards** — use spacing and dividers.

### Navigation (`DropNav` + `AppShell`)

- Sticky, blurred canvas-black bar, subtle border.
- Soft blush underline when live drops exist.
- Wordmark in Fraunces; links and CTAs in DM Sans (Buttons are pills).

### Signature: Pass Surfaces

- Wallet: featured first pass larger; horizontal with notches.
- Ticket detail: full-screen pass mode, white QR zone, lavender checked-in stamp.
- Checkout: `OrderStub` with poster header, notches, dashed line, mono totals.

### Loading

- `.skeleton-shimmer` on cards, dashboard shell, event hero — never centered spinners on content.

## 6. Do's and Don'ts

### Do:

- **Do** set headlines in Fraunces, mixed case, with tight tracking.
- **Do** keep the canvas black and white; let blush/lavender be the single lit accent.
- **Do** lead event pages with full-bleed poster art and soft gradient scrims.
- **Do** use editorial dividers and asymmetric layouts — not numbered feature grids.
- **Do** use skeleton shimmer for async; reserve spinners for inline button text.
- **Do** respect `prefers-reduced-motion` on every animation.

### Don't:

- **Don't** uppercase the display serif, or use it on buttons, nav, labels, or data.
- **Don't** reintroduce acid green, Bebas Neue, or hard neon glows (prior festival skin).
- **Don't** use generic SaaS labels (Dashboard, Browse events, Get Started) — use `src/lib/copy.ts`.
- **Don't** use identical three-column icon+heading+text feature grids.
- **Don't** use hero-metric templates (big number, small label, gradient).
- **Don't** put muted gray text on blush/lavender/rose/mint fills.
- **Don't** nest cards inside cards.
- **Don't** use cream/sand/light body backgrounds — canvas-black only.
- **Don't** hard-code colors outside `globals.css` tokens — extend this frontmatter first.

## Implementation

| Asset | Path |
|-------|------|
| CSS tokens | `src/app/globals.css` |
| Fonts (Fraunces / DM Sans / Afacad / JetBrains Mono) | `src/app/layout.tsx` |
| UI primitives | `src/components/ui/` |
| Sidecar (shadows, motion, z-index) | `.impeccable/design.json` |
| TS token mirror | `src/lib/design-tokens.ts` |
| Product strategy | `PRODUCT.md` |
