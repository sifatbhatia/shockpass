export const BRAND = {
  name: 'Willcall',
  monogram: 'WC',
  tagline: 'Ticketing built for drops, hype, and packed rooms.',
  domain: 'willcall.app',
  demoEmail: 'demo@willcall.app',
  logo: {
    nav: '/brand/willcall-nav.webp',
    mark: '/brand/willcall-emblem.webp',
    wordmark: '/brand/willcall-wordmark.webp',
    horizontal: '/brand/willcall-horizontal-full.webp',
    vertical: '/brand/willcall-vertical-full.webp',
    favicon: '/brand/icon-32x32.webp',
    apple: '/brand/icon-180x180.webp',
    og: '/brand/willcall-vertical-full.webp',
  },
} as const

export const brandTitle = (suffix?: string) =>
  suffix ? `${BRAND.name} — ${suffix}` : `${BRAND.name} — ${BRAND.tagline}`
