export const BRAND = {
  name: 'Willcall',
  monogram: 'WC',
  tagline: 'Ticketing built for drops, hype, and packed rooms.',
  domain: 'willcall.app',
  demoEmail: 'demo@willcall.app',
  logo: {
    nav: '/brand/willcall-nav.png',
    mark: '/brand/willcall-emblem.png',
    wordmark: '/brand/willcall-wordmark.png',
    horizontal: '/brand/willcall-horizontal-full.png',
    vertical: '/brand/willcall-vertical-full.png',
    favicon: '/brand/icon-32x32.png',
    apple: '/brand/icon-180x180.png',
    og: '/brand/willcall-vertical-full.png',
  },
} as const

export const brandTitle = (suffix?: string) =>
  suffix ? `${BRAND.name} — ${suffix}` : `${BRAND.name} — ${BRAND.tagline}`
