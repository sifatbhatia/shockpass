# Willcall — ChatGPT Asset Generation Brief

**Paste this entire file into ChatGPT** (or attach it) when asking for logos, icons, illustrations, or textures. It contains brand rules, exact colors, file specs, and ready-made prompts.

---

## Copy-paste opener for ChatGPT

```
You are designing brand assets for Willcall — a premium dark-mode ticketing app for drop-style events (clubs, live shows, limited capacity). Buyers get fast guest checkout and wallet QR passes; organizers run drops, sell-through, and door scanning.

Creative direction: "The Lit Gallery" — a near-black exhibition hall, editorial and calm, NOT festival rave, NOT generic SaaS, NOT neon club lasers.

Rules:
- Canvas is always near-black #050505
- Primary accent: blush pink #f8d6f7 (buttons, logo mark, highlights)
- Secondary accent: lavender #ecdffb (soft glows, VIP/pre-sale)
- Nav-only accent: lime #d4ff52 (small UI pills only — do NOT dominate logo)
- Success/live dot: sage mint #8fd9bd
- Typography in real UI: Fraunces serif for headlines/wordmark, DM Sans for UI (you may reference serif style in wordmarks only)
- Mixed case wordmarks — never ALL CAPS
- Soft ambient glow at 5–15% opacity only — no hard neon, no acid green floods
- Vector-clean, flat or subtle depth, generous negative space
- Logo must work at 32×32px (favicon) and as app icon

Avoid: ticket clipart, QR codes in logos, gradient rainbows, Bebas Neue style, Eventbrite-blue, stock SaaS illustrations, people with lanyards, disco balls.

Output: PNG with transparent background where noted, square safe padding ~12%, crisp edges suitable for web.
```

---

## Brand snapshot

| Field | Value |
|-------|-------|
| **Name** | Willcall |
| **Monogram** | WC |
| **Tagline** | Ticketing built for drops, hype, and packed rooms. |
| **Domain** | willcall.app |
| **Product** | Drop engine — urgency, live sell-through, wallet passes, organizer hub |
| **Mood** | Gallery opening meets nightlife drop — confident, curatorial, dark luxury |
| **Competitor vibe** | DICE (mobile-first, QR at door) + editorial fashion/gallery — **not** Shotgun neon party posters |

### Metaphor for logo

**Willcall = entry to a packed room.** Abstract guest-list mark: a ticket notch, entry slit, velvet-rope passage, or minimal access symbol. Should feel like **access**, not a literal venue photo or generic ticket stub.

Preferred directions (pick one cohesive system):

1. **Gate mark** — abstract blush symbol on black  
2. **WC monogram** — serif-inspired ligature, gallery placard feel  
3. **Wordmark** — “Willcall” in high-contrast editorial serif + small gate icon  

---

## Color palette (exact hex)

Use these literally in prompts and when recoloring in Figma.

| Token | Hex | Use in assets |
|-------|-----|----------------|
| Canvas black | `#050505` | Backgrounds, app icon base |
| Panel | `#181818` | Cards, pass backgrounds |
| Panel raised | `#232323` | Inputs, nested surfaces |
| Text primary | `#f7f5f5` | Wordmarks on dark |
| Text muted | `#a3a1a8` | Secondary illustration lines |
| **Blush** | `#f8d6f7` | **Primary logo color, CTA fills** |
| Blush deep | `#f0bdee` | Hover / deeper blush |
| Lavender | `#ecdffb` | Soft glows, VIP accents |
| Rose | `#f59ac0` | Urgency (almost sold out) |
| Mint | `#8fd9bd` | Valid pass, live pulse |
| **Nav lime** | `#d4ff52` | **Nav pills only** — optional tiny live dot on icon |
| Danger | `#ef6f6f` | Errors (rare in brand assets) |

**Rules:**

- Blush + lavender ≤ 10% of any frame  
- Black text `#050505` on blush fills (never gray on blush)  
- No cream/light theme backgrounds  
- No full-frame lime green  

---

## File manifest (what the app expects)

Save generated files to `public/brand/` in the repo:

| Filename | Size | Purpose |
|----------|------|---------|
| `icon-32x32.png` | 32×32 | Favicon |
| `icon-80x80.png` | 80×80 | Nav bar icon ([BrandMark](src/components/BrandMark.tsx)) |
| `icon-120x120.png` | 120×120 | Default mark |
| `icon-180x180.png` | 180×180 | Apple touch icon |
| `icon-192x192.png` | 192×192 | PWA / layout metadata |
| `icon-512x512.png` | 512×512 | OG / high-res |
| `wordmark-horizontal.png` | ~1200×400 | Marketing (optional) |
| `og-background.png` | 1200×630 | Social share background (no baked text) |

**Export settings:** PNG, transparent background for icons, sRGB, no compression artifacts. Keep logo centered with ~15% padding for iOS rounded-rect crop.

**Optional UI illustrations** → `public/illustrations/`:

| File | Ratio | Use |
|------|-------|-----|
| `empty-drops.png` | 4:3 | No live events |
| `empty-wallet.png` | 1:1 | Wallet has no tickets |
| `scan-success.png` | 16:9 | Checkout / scan marketing |
| `pass-texture.png` | 1:1 tile | Wallet pass background |

---

## Master style suffix (append to every prompt)

> Ultra-minimal editorial brand design for Willcall ticketing app. Near-black canvas #050505, blush #f8d6f7 and lavender #ecdffb accents sparingly. Gallery-grade, calm, confident — not neon, not SaaS clipart, not festival rave. Soft ambient glow only. Clean vector-friendly shapes, high contrast, generous negative space. Flat or subtle depth.

---

## Asset prompts (ready to use)

### Logo & identity

**1. Primary logomark (icon only)**  
> Minimal geometric logomark for Willcall — abstract willcall gate with two curved arms and a single entry slit, suggesting access to a packed room. One continuous stroke, rounded terminals, editorial not corporate. Blush #f8d6f7 mark on pure black #050505. Centered square, safe padding for app icon crop. Vector logo style, no text, no gradients except one soft blush radial glow at 8% opacity.  
> [Master style suffix]

**2. WC monogram**  
> Monogram “WC” for Willcall — custom ligature where W and C feel like a gallery placard bracket around an entry slit. Simplified geometric letterforms inspired by high-contrast serif. Single color blush #f8d6f7 on transparent background. Ultra clean, readable at 32px. No drop shadow, no 3D.  
> [Master style suffix]

**3. Horizontal wordmark lockup**  
> Horizontal logo: abstract willcall gate icon left + word “Willcall” in elegant editorial serif wordmark (Fraunces-like), mixed case not uppercase. Blush icon, off-white #f7f5f5 wordmark on #050505. Wide 3:1 ratio, museum exhibition poster aesthetic.  
> [Master style suffix]

**4. iOS app icon**  
> App icon for Willcall: rounded-square format, near-black #050505 background, centered blush willcall gate symbol, subtle lavender glow at bottom edge only 5% opacity. No text. Crisp edges, premium nightlife-meets-gallery mood.  
> [Master style suffix]

**5. Favicon (ultra simple)**  
> Favicon icon: single blush dot with tiny vertical slit (willcall entry metaphor). Maximum legibility at 16px, flat, transparent or black background, pixel-sharp vector style.  
> [Master style suffix]

---

### UI illustrations

**6. Empty state — no drops live**  
> Editorial illustration: dark empty gallery room with one illuminated empty frame on wall, soft blush spotlight on floor, no people. Minimal line-art plus flat color, calm not sad. 4:3, transparent or #050505 background, web UI empty state.  
> [Master style suffix]

**7. Empty state — no tickets in wallet**  
> Minimal illustration: empty velvet rope stanchion in dark foyer, lavender rope, blush accent light on brass post. “Not inside yet” mood. Clean vector, 1:1, UI illustration.  
> [Master style suffix]

**8. QR / door pass moment**  
> Stylized phone showing glowing digital ticket pass, soft mint #8fd9bd validation ring at 15% opacity (not neon). Dark environment, blush highlight on pass edge. Product marketing still, 16:9, no readable text or QR code detail.  
> [Master style suffix]

**9. Organizer hub empty dashboard**  
> Dark desk scene with single glowing sell-through chart line on muted panel #181818, blush accent on peak point. Editorial data viz, not corporate clipart. 4:3.  
> [Master style suffix]

---

### Textures & marketing

**10. Open Graph background (1200×630)**  
> Brand social share background: dark exhibition hall perspective, soft blush and lavender light pools on floor, subtle film grain, large negative space center-left for headline overlay. No text. Cinematic but restrained.  
> [Master style suffix]

**11. Wallet pass texture (seamless tile)**  
> Seamless subtle texture for digital ticket pass: #050505 with faint film grain, soft perforated-edge hint along one side, blush/lavender ambient leaks at 5% from corners. No text, no QR. Tileable 512×512.  
> [Master style suffix]

**12. Event poster placeholder (2:3)**  
> Generic event poster placeholder vertical: dark stage silhouette, soft lavender haze, single blush spotlight cone. No band name, no text. Gallery poster aesthetic.  
> [Master style suffix]

**13. Live pulse badge (UI element)**  
> Small pill-shaped live indicator graphic: mint dot #8fd9bd with soft pulse rings at 15% opacity on dark panel #181818. Isolated asset, no text.  
> [Master style suffix]

**14. Icon set style reference (4 icons)**  
> Set of 4 matching line icons on transparent background: secure lock, wallet pass, fast checkout lightning, guest user silhouette. Unified 2px stroke, rounded caps, blush #f8d6f7 stroke with lavender detail. Grid layout 2×2, #050505 implied background.  
> [Master style suffix]

---

## Iteration tips for ChatGPT

1. **Generate logomark first** — use it as reference image for app icon + favicon variants.  
2. **Ask for variations:** “Same mark, thicker stroke for 32px legibility” / “Same mark, no glow”.  
3. **Recolor pass:** “Convert to single-color blush #f8d6f7 on transparent PNG”.  
4. **Reject and redirect:** If output looks like club flyer, say: “Remove neon, reduce glow, more museum/gallery, less EDM.”  
5. **Vector cleanup:** Import PNG to Figma → Image Trace or redraw paths → export @1x and @2x PNGs.  
6. **Do not** ask ChatGPT for fake Stripe/Apple Pay official logos — use text badges in UI instead.

---

## How assets plug into code

After export, place files in `public/brand/` matching [src/lib/brand.ts](src/lib/brand.ts):

```ts
logo: {
  nav: '/brand/icon-80x80.png',
  mark: '/brand/icon-120x120.png',
  favicon: '/brand/icon-32x32.png',
  apple: '/brand/icon-180x180.png',
  og: '/brand/icon-512x512.png',
}
```

Favicon + OG also referenced in [src/app/layout.tsx](src/app/layout.tsx).

[BrandMark](src/components/BrandMark.tsx) shows icon-only in nav; default variant shows icon + “Willcall” in Fraunces (text is code, not baked into nav icon).

---

## Visual references (describe, don’t copy)

| Reference | Take | Leave |
|-----------|------|-------|
| **DICE** | Mobile-first, QR at door, upfront pricing clarity | Mandatory app vibe, their green brand |
| **Eventbrite** | Trust, discovery | Blue corporate, generic grids |
| **Gallery / fashion editorial** | Black canvas, serif headlines, negative space | — |
| **Consensys nav** | Pill nav, lime accent on dark | Their exact logo |

---

## Anti-patterns checklist

Before accepting an asset, reject if it has:

- [ ] Acid green or laser neon dominating the frame  
- [ ] ALL CAPS heavy wordmark  
- [ ] Generic ticket icon with perforated stub clipart  
- [ ] Light/cream background as primary  
- [ ] 3D glassmorphism logo trendy style  
- [ ] Too much detail to read at 32px (for icons)  
- [ ] Embedded text in app icon besides optional “T” monogram  

---

## Suggested ChatGPT workflow

**Step 1 — Logo exploration**  
> Using the Willcall brief attached, generate 4 distinct logomark directions (gate, monogram, geometric T, rotation arc). Blush on black. Square 1024×1024 transparent PNG.

**Step 2 — Refine winner**  
> Direction 2 is closest. Simplify for 32px favicon. Export 3 versions: full detail, medium, ultra-minimal.

**Step 3 — App icon**  
> Place chosen mark on #050505 rounded square, 1024×1024, subtle lavender floor glow only.

**Step 4 — Scale exports**  
> Resize to manifest sizes (32, 80, 120, 180, 192, 512).

**Step 5 — Illustrations**  
> Generate empty states and OG background using same blush/lavender language.

---

## Related docs

- [HANDOFF.md](HANDOFF.md) — full project handoff for any IDE  
- [DESIGN.md](DESIGN.md) — complete design system  
- [PRODUCT.md](PRODUCT.md) — product principles  

---

*Give ChatGPT this file + “Start with prompt 1 and 4” for fastest path to shippable icons.*
