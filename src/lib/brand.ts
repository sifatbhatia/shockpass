export const BRAND = {
  name: 'Turnstile',
  monogram: 'TS',
  tagline: 'Ticketing built for drops, hype, and packed rooms.',
  domain: 'turnstile.app',
  demoEmail: 'demo@turnstile.app',
  logo: {
    nav: '/brand/icon-80x80.png',
    mark: '/brand/icon-120x120.png',
    favicon: '/brand/icon-32x32.png',
    apple: '/brand/icon-180x180.png',
    og: '/brand/icon-512x512.png',
  },
} as const

export const brandTitle = (suffix?: string) =>
  suffix ? `${BRAND.name} — ${suffix}` : `${BRAND.name} — ${BRAND.tagline}`
