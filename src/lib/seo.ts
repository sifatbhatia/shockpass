import type { Metadata } from 'next'
import { BRAND } from '@/lib/brand'
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
  keywords?: string[]
}

export function buildPageMetadata({
  title,
  description,
  path = '',
  noIndex = false,
  images,
  keywords,
}: PageMetaInput): Metadata {
  const url = `${siteConfig.url}${path}`

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
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
      title: `${BRAND.name} — Ticket drops for rooms that sell out`,
      description: `${BRAND.tagline} Live drops, fast checkout, and wallet passes for rooms that sell out.`,
      path: '/',
      keywords: ['ticket drops', 'event ticketing', 'guest checkout', 'wallet tickets', 'door scanning'],
    }),

  events: () =>
    buildPageMetadata({
      title: COPY.findTheDrop,
      description: 'Live drops, upcoming rooms, and sellout campaigns ranked by demand.',
      path: '/events',
      keywords: ['live events', 'ticket drops', 'concert tickets', 'club tickets', 'event discovery'],
    }),

  organizers: () =>
    buildPageMetadata({
      title: 'For organizers',
      description:
        'Launch ticket drops with human-made pages, short checkout, wallet passes, and door scanning.',
      path: '/organizers',
      keywords: ['event organizer software', 'ticketing platform', 'sell tickets online', 'door scanning', 'Stripe ticketing'],
    }),

  eventDetail: (event: {
    title: string
    subtitle?: string | null
    description: string
    posterUrl?: string | null
    slug: string
  }) =>
    buildPageMetadata({
      title: `${event.title} · ${BRAND.name}`,
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
      title: `${COPY.completeOrder} · ${eventTitle} · ${BRAND.name}`,
      description: COPY.secureCheckout,
      path: `/events/${slug}/checkout`,
      noIndex: true,
    }),

  wallet: () =>
    buildPageMetadata({
      title: COPY.myWallet,
      description: 'Your Willcall passes — rotating QR codes ready at the door.',
      path: '/wallet',
      noIndex: true,
    }),

  auth: () =>
    buildPageMetadata({
      title: COPY.signIn,
      description: `${COPY.joinTheRoom} or ${COPY.launchADrop.toLowerCase()} with email or wallet.`,
      path: '/auth',
      noIndex: true,
    }),

  scan: () =>
    buildPageMetadata({
      title: COPY.doorScanner,
      description: 'Scan rotating QR passes and check guests in at the door.',
      path: '/scan',
      noIndex: true,
    }),

  dashboard: () =>
    buildPageMetadata({
      title: COPY.commandCenter,
      description: COPY.trackDemand,
      path: '/dashboard',
      noIndex: true,
    }),

  newDrop: () =>
    buildPageMetadata({
      title: COPY.openNewDrop,
      description: 'Set your poster, tiers, and go live with a drop-first sales page.',
      path: '/dashboard/events/new',
      noIndex: true,
    }),

  onboarding: () =>
    buildPageMetadata({
      title: COPY.setupBrand,
      description: COPY.setupBrandHint,
      path: '/dashboard/onboarding',
      noIndex: true,
    }),

  notFound: () =>
    buildPageMetadata({
      title: 'Page not found',
      description: COPY.dropNotFound,
      noIndex: true,
    }),
}
