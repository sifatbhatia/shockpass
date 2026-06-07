import type { Metadata } from 'next'
import { BRAND, brandTitle } from '@/lib/brand'
import { COPY } from '@/lib/copy'

export const siteConfig = {
  url: process.env.NEXT_PUBLIC_APP_URL ?? `https://${BRAND.domain}`,
  name: BRAND.name,
  tagline: BRAND.tagline,
  ogImage: `${process.env.NEXT_PUBLIC_APP_URL ?? `https://${BRAND.domain}`}${BRAND.logo.og}`,
} as const

type PageMetaInput = {
  title: string
  description: string
  path?: string
  noIndex?: boolean
  images?: NonNullable<Metadata['openGraph']>['images']
}

export function buildPageMetadata({
  title,
  description,
  path = '',
  noIndex = false,
  images,
}: PageMetaInput): Metadata {
  const url = `${siteConfig.url}${path}`

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: 'website',
      locale: 'en_US',
      images: images ?? [
        { url: siteConfig.ogImage, width: 512, height: 512, alt: `${siteConfig.name} logo` },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImage],
    },
  }
}

export const pageMetadata = {
  home: () =>
    buildPageMetadata({
      title: brandTitle(COPY.liveNow),
      description: `${BRAND.tagline} Live drops, fast checkout, and wallet passes for rooms that sell out.`,
      path: '/',
    }),

  events: () =>
    buildPageMetadata({
      title: brandTitle(COPY.findTheDrop),
      description: 'Live drops, upcoming rooms, and sellout campaigns ranked by demand.',
      path: '/events',
    }),

  organizers: () =>
    buildPageMetadata({
      title: brandTitle('For organizers'),
      description:
        'Launch ticket drops with human-made pages, short checkout, wallet passes, and door scanning.',
      path: '/organizers',
    }),

  eventDetail: (event: {
    title: string
    subtitle?: string | null
    description: string
    posterUrl?: string | null
    slug: string
  }) =>
    buildPageMetadata({
      title: brandTitle(event.title),
      description:
        event.subtitle?.trim() ||
        event.description.replace(/\s+/g, ' ').trim().slice(0, 160),
      path: `/events/${event.slug}`,
      images: event.posterUrl
        ? [{ url: event.posterUrl, alt: `${event.title} poster` }]
        : undefined,
    }),

  checkout: (eventTitle: string, slug: string) =>
    buildPageMetadata({
      title: brandTitle(`${COPY.completeOrder} · ${eventTitle}`),
      description: COPY.secureCheckout,
      path: `/events/${slug}/checkout`,
      noIndex: true,
    }),

  wallet: () =>
    buildPageMetadata({
      title: brandTitle(COPY.myWallet),
      description: 'Your Turnstile passes — rotating QR codes ready at the door.',
      path: '/wallet',
      noIndex: true,
    }),

  auth: () =>
    buildPageMetadata({
      title: brandTitle(COPY.signIn),
      description: `${COPY.joinTheRoom} or ${COPY.launchADrop.toLowerCase()} with email or wallet.`,
      path: '/auth',
    }),

  scan: () =>
    buildPageMetadata({
      title: brandTitle(COPY.doorScanner),
      description: 'Scan rotating QR passes and check guests in at the door.',
      path: '/scan',
      noIndex: true,
    }),

  dashboard: () =>
    buildPageMetadata({
      title: brandTitle(COPY.commandCenter),
      description: COPY.trackDemand,
      path: '/dashboard',
      noIndex: true,
    }),

  newDrop: () =>
    buildPageMetadata({
      title: brandTitle(COPY.openNewDrop),
      description: 'Set your poster, tiers, and go live with a drop-first sales page.',
      path: '/dashboard/events/new',
      noIndex: true,
    }),

  onboarding: () =>
    buildPageMetadata({
      title: brandTitle(COPY.setupBrand),
      description: COPY.setupBrandHint,
      path: '/dashboard/onboarding',
      noIndex: true,
    }),

  notFound: () =>
    buildPageMetadata({
      title: brandTitle('Page not found'),
      description: COPY.dropNotFound,
      noIndex: true,
    }),
}
