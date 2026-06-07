export type DemoTicketTier = {
  id: string
  eventId: string
  name: string
  description: string | null
  priceCents: number
  currency: string
  quantityTotal: number
  quantitySold: number
  maxPerOrder: number
  salesStartAt: Date | null
  salesEndAt: Date | null
  status: 'ON_SALE' | 'SOLD_OUT' | 'LOCKED'
  unlockRule: null
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export type DemoEvent = {
  id: string
  slug: string
  organizerId: string
  title: string
  subtitle: string | null
  description: string
  posterUrl: string
  heroVideoUrl: string | null
  venueName: string
  venueAddress: string
  city: string
  timezone: string
  lat: number | null
  lng: number | null
  startsAt: Date
  endsAt: Date
  capacity: number
  status: 'LIVE' | 'SCHEDULED' | 'SOLD_OUT'
  visibility: 'PUBLIC'
  stripeAccountId: string | null
  createdAt: Date
  updatedAt: Date
  organizer: {
    id: string
    name: string
    avatarUrl: string | null
    walletAddress?: string | null
  }
  ticketTiers: DemoTicketTier[]
}

const now = new Date('2026-06-06T09:00:00.000Z')
const organizer = {
  id: 'demo_org_turnstile',
  name: 'Turnstile Demo',
  avatarUrl: null,
  walletAddress: null,
}

function tier(
  eventId: string,
  sortOrder: number,
  data: Pick<DemoTicketTier, 'name' | 'description' | 'priceCents' | 'currency' | 'quantityTotal' | 'quantitySold' | 'maxPerOrder' | 'status'>
): DemoTicketTier {
  return {
    id: `demo_tier_${eventId}_${sortOrder}`,
    eventId,
    ...data,
    salesStartAt: null,
    salesEndAt: null,
    unlockRule: null,
    sortOrder,
    createdAt: now,
    updatedAt: now,
  }
}

export const DEMO_EVENTS: DemoEvent[] = [
  {
    id: 'demo_event_neon_district',
    slug: 'neon-district-block-party',
    organizerId: organizer.id,
    title: 'Neon District Block Party',
    subtitle: "Brooklyn's biggest underground dance night",
    description:
      'A night of house, techno, and bass music under the Brooklyn Bridge. Three stages, immersive art installations, and a silent disco until sunrise. This is the proof-of-flow demo drop for Turnstile.',
    posterUrl: '/assets/turnstile-hero-drop-v2.png',
    heroVideoUrl: null,
    venueName: 'The Warehouse',
    venueAddress: '45 Kent Ave, Brooklyn, NY 11249',
    city: 'Brooklyn, NY',
    timezone: 'America/New_York',
    lat: null,
    lng: null,
    startsAt: new Date('2026-07-18T22:00:00Z'),
    endsAt: new Date('2026-07-19T06:00:00Z'),
    capacity: 775,
    status: 'LIVE',
    visibility: 'PUBLIC',
    stripeAccountId: null,
    createdAt: now,
    updatedAt: now,
    organizer,
    ticketTiers: [
      tier('demo_event_neon_district', 0, {
        name: 'Early Bird',
        description: 'First wave pricing for early movers.',
        priceCents: 3500,
        currency: 'USD',
        quantityTotal: 200,
        quantitySold: 180,
        maxPerOrder: 4,
        status: 'ON_SALE',
      }),
      tier('demo_event_neon_district', 1, {
        name: 'General Admission',
        description: 'Main room access.',
        priceCents: 4500,
        currency: 'USD',
        quantityTotal: 500,
        quantitySold: 340,
        maxPerOrder: 6,
        status: 'ON_SALE',
      }),
      tier('demo_event_neon_district', 2, {
        name: 'VIP',
        description: 'Priority entry and lounge access.',
        priceCents: 8500,
        currency: 'USD',
        quantityTotal: 75,
        quantitySold: 60,
        maxPerOrder: 2,
        status: 'ON_SALE',
      }),
    ],
  },
  {
    id: 'demo_event_synthwave_after_dark',
    slug: 'synthwave-after-dark',
    organizerId: organizer.id,
    title: 'Synthwave After Dark',
    subtitle: 'Retro-futuristic sounds in a historic theater',
    description:
      'Live synthwave, retrowave, and darksynth performances with a full light show, VJ projections, and an arcade lounge built for the midnight crowd.',
    posterUrl: '/assets/scan-success-moment.png',
    heroVideoUrl: null,
    venueName: 'The Regent Theater',
    venueAddress: '448 S Main St, Los Angeles, CA 90012',
    city: 'Los Angeles, CA',
    timezone: 'America/Los_Angeles',
    lat: null,
    lng: null,
    startsAt: new Date('2026-07-25T21:00:00Z'),
    endsAt: new Date('2026-07-26T03:00:00Z'),
    capacity: 450,
    status: 'LIVE',
    visibility: 'PUBLIC',
    stripeAccountId: null,
    createdAt: now,
    updatedAt: now,
    organizer,
    ticketTiers: [
      tier('demo_event_synthwave_after_dark', 0, {
        name: 'General Admission',
        description: 'Theater floor access.',
        priceCents: 4500,
        currency: 'USD',
        quantityTotal: 400,
        quantitySold: 287,
        maxPerOrder: 6,
        status: 'ON_SALE',
      }),
      tier('demo_event_synthwave_after_dark', 1, {
        name: 'VIP + Meet & Greet',
        description: 'Meet the artists after the show.',
        priceCents: 12000,
        currency: 'USD',
        quantityTotal: 50,
        quantitySold: 42,
        maxPerOrder: 2,
        status: 'ON_SALE',
      }),
    ],
  },
  {
    id: 'demo_event_bass_protocol',
    slug: 'bass-protocol-vol-3',
    organizerId: organizer.id,
    title: 'Bass Protocol Vol. 3',
    subtitle: 'A limited-capacity bass showcase',
    description:
      'The third installment of a bass-heavy warehouse night with international headliners, local talent, and a sound system tuned for people who arrive early.',
    posterUrl: '/assets/empty-drops-gallery.png',
    heroVideoUrl: null,
    venueName: 'Arena Berlin',
    venueAddress: 'Eichenstrasse 4, 12435 Berlin',
    city: 'Berlin',
    timezone: 'Europe/Berlin',
    lat: null,
    lng: null,
    startsAt: new Date('2026-08-02T20:00:00Z'),
    endsAt: new Date('2026-08-03T05:00:00Z'),
    capacity: 1300,
    status: 'LIVE',
    visibility: 'PUBLIC',
    stripeAccountId: null,
    createdAt: now,
    updatedAt: now,
    organizer,
    ticketTiers: [
      tier('demo_event_bass_protocol', 0, {
        name: 'Early Bird',
        description: 'Gone in the first release.',
        priceCents: 3000,
        currency: 'EUR',
        quantityTotal: 300,
        quantitySold: 300,
        maxPerOrder: 4,
        status: 'SOLD_OUT',
      }),
      tier('demo_event_bass_protocol', 1, {
        name: 'Tier 2',
        description: 'Current release.',
        priceCents: 4000,
        currency: 'EUR',
        quantityTotal: 500,
        quantitySold: 480,
        maxPerOrder: 6,
        status: 'ON_SALE',
      }),
      tier('demo_event_bass_protocol', 2, {
        name: 'Final Release',
        description: 'Final public allocation.',
        priceCents: 5000,
        currency: 'EUR',
        quantityTotal: 400,
        quantitySold: 210,
        maxPerOrder: 6,
        status: 'ON_SALE',
      }),
    ],
  },
]

export function listDemoEvents(input?: { limit?: number; cursor?: string; city?: string; search?: string; status?: string }) {
  const filtered = DEMO_EVENTS.filter((event) => {
    if (input?.status && event.status !== input.status) return false
    if (input?.city && !event.city.toLowerCase().includes(input.city.toLowerCase())) return false
    if (input?.search) {
      const q = input.search.toLowerCase()
      return [event.title, event.description, event.venueName, event.city].some((value) =>
        value.toLowerCase().includes(q)
      )
    }
    return true
  })

  return filtered.slice(0, input?.limit ?? filtered.length)
}

export function getDemoEventBySlug(slug: string) {
  return DEMO_EVENTS.find((event) => event.slug === slug) ?? null
}

export function getDemoTierById(id: string) {
  return DEMO_EVENTS.flatMap((event) => event.ticketTiers).find((tier) => tier.id === id) ?? null
}
