export type MockHomeEvent = {
  id: string
  slug: string
  title: string
  posterUrl: string | null
  venueName: string | null
  city: string
  startsAt: string
  status: string
  ticketTiers: {
    priceCents: number
    currency: string
    quantityTotal: number
    quantitySold: number
  }[]
}

export const MOCK_HOME_EVENTS: MockHomeEvent[] = [
  {
    id: 'mock-1',
    slug: 'velvet-underground',
    title: 'Velvet Underground — Night Two',
    posterUrl: null,
    venueName: 'The Echo',
    city: 'Los Angeles',
    startsAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'LIVE',
    ticketTiers: [
      { priceCents: 3500, currency: 'USD', quantityTotal: 250, quantitySold: 225 },
    ],
  },
  {
    id: 'mock-2',
    slug: 'fujii-kaze-live',
    title: 'Fujii Kaze — Live in LA',
    posterUrl: null,
    venueName: 'Hollywood Bowl',
    city: 'Los Angeles',
    startsAt: new Date(Date.now() + 86400000 * 14).toISOString(),
    status: 'LIVE',
    ticketTiers: [
      { priceCents: 6500, currency: 'USD', quantityTotal: 3000, quantitySold: 2100 },
    ],
  },
  {
    id: 'mock-3',
    slug: 'keith-jarrett-residency',
    title: 'Keith Jarrett — Solo Residency',
    posterUrl: null,
    venueName: 'Walt Disney Concert Hall',
    city: 'Los Angeles',
    startsAt: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'LIVE',
    ticketTiers: [
      { priceCents: 8500, currency: 'USD', quantityTotal: 1800, quantitySold: 1720 },
    ],
  },
  {
    id: 'mock-4',
    slug: 'techno-night',
    title: 'Kompakt x DVS1 — All Night Long',
    posterUrl: null,
    venueName: 'Warehouse DTLA',
    city: 'Los Angeles',
    startsAt: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'LIVE',
    ticketTiers: [
      { priceCents: 2500, currency: 'USD', quantityTotal: 500, quantitySold: 310 },
    ],
  },
  {
    id: 'mock-5',
    slug: 'sufjan-stevens-orchestral',
    title: 'Sufjan Stevens — Orchestral Set',
    posterUrl: null,
    venueName: 'The Ford',
    city: 'Los Angeles',
    startsAt: new Date(Date.now() + 86400000 * 21).toISOString(),
    status: 'SCHEDULED',
    ticketTiers: [
      { priceCents: 5500, currency: 'USD', quantityTotal: 1200, quantitySold: 680 },
    ],
  },
  {
    id: 'mock-6',
    slug: 'ambient-benefit',
    title: 'Music for Sleep — Benefit Night',
    posterUrl: null,
    venueName: 'Zebulon',
    city: 'Los Angeles',
    startsAt: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'LIVE',
    ticketTiers: [
      { priceCents: 2000, currency: 'USD', quantityTotal: 200, quantitySold: 195 },
    ],
  },
]
