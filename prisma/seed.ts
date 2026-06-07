import { PrismaClient, EventStatus, EventVisibility, TicketTierStatus, UserRole } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const databaseUrl = process.env.DATABASE_URL
const prisma = new PrismaClient(
  databaseUrl?.startsWith('prisma+postgres://')
    ? { accelerateUrl: databaseUrl }
    : { adapter: new PrismaPg({ connectionString: databaseUrl }) }
)

async function main() {
  // Create a sample organizer user
  const organizer = await prisma.user.upsert({
    where: { email: 'demo@willcall.app' },
    update: {},
    create: {
      email: 'demo@willcall.app',
      name: 'Willcall Demo',
      role: UserRole.ORGANIZER,
      authProvider: 'EMAIL',
    },
  })

  // Create sample events
  const events = [
    {
      title: 'Neon District Block Party',
      subtitle: 'Brooklyn\'s biggest underground dance night',
      description: 'A night of house, techno, and bass music under the Brooklyn Bridge. Three stages, 20+ DJs, immersive art installations, and a silent disco until sunrise.',
      venueName: 'The Warehouse',
      venueAddress: '45 Kent Ave, Brooklyn, NY 11249',
      city: 'Brooklyn, NY',
      startsAt: new Date('2026-07-18T22:00:00Z'),
      endsAt: new Date('2026-07-19T06:00:00Z'),
      capacity: 900,
      posterUrl: '/assets/willcall-hero-drop-v2.png',
      timezone: 'America/New_York',
      status: EventStatus.LIVE,
      visibility: EventVisibility.PUBLIC,
    },
    {
      title: 'Synthwave After Dark',
      subtitle: 'Retro-futuristic sounds in a historic theater',
      description: 'Journey back to the future with live synthwave, retrowave, and darksynth performances. Full light show, VJ projections, and an 80s arcade lounge.',
      venueName: 'The Regent Theater',
      venueAddress: '448 S Main St, Los Angeles, CA 90012',
      city: 'Los Angeles, CA',
      startsAt: new Date('2026-07-25T21:00:00Z'),
      endsAt: new Date('2026-07-26T03:00:00Z'),
      capacity: 500,
      posterUrl: '/assets/scan-success-moment.png',
      timezone: 'America/Los_Angeles',
      status: EventStatus.LIVE,
      visibility: EventVisibility.PUBLIC,
    },
    {
      title: 'Bass Protocol Vol. 3',
      subtitle: 'Berlin\'s premier bass music showcase',
      description: 'The third installment of Berlin\'s most anticipated bass music night. Featuring international headliners, local talent, and a 50kW sound system.',
      venueName: 'Arena Berlin',
      venueAddress: 'Eichenstraße 4, 12435 Berlin',
      city: 'Berlin',
      startsAt: new Date('2026-08-02T20:00:00Z'),
      endsAt: new Date('2026-08-03T05:00:00Z'),
      capacity: 1500,
      posterUrl: '/assets/empty-drops-gallery.png',
      timezone: 'Europe/Berlin',
      status: EventStatus.LIVE,
      visibility: EventVisibility.PUBLIC,
    },
  ]

  for (const eventData of events) {
    const slug = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const existing = await prisma.event.findUnique({ where: { slug } })
    if (existing) continue

    const event = await prisma.event.create({
      data: {
        ...eventData,
        slug,
        organizerId: organizer.id,
      },
    })

    // Create ticket tiers for each event
    if (event.title === 'Neon District Block Party') {
      await prisma.ticketTier.createMany({
        data: [
          { eventId: event.id, name: 'Early Bird', priceCents: 3500, currency: 'USD', quantityTotal: 200, quantitySold: 180, maxPerOrder: 4, sortOrder: 0, status: TicketTierStatus.ON_SALE },
          { eventId: event.id, name: 'General Admission', priceCents: 4500, currency: 'USD', quantityTotal: 500, quantitySold: 340, maxPerOrder: 6, sortOrder: 1, status: TicketTierStatus.ON_SALE },
          { eventId: event.id, name: 'VIP', priceCents: 8500, currency: 'USD', quantityTotal: 75, quantitySold: 60, maxPerOrder: 2, sortOrder: 2, status: TicketTierStatus.ON_SALE },
        ],
      })
    } else if (event.title === 'Synthwave After Dark') {
      await prisma.ticketTier.createMany({
        data: [
          { eventId: event.id, name: 'General Admission', priceCents: 4500, currency: 'USD', quantityTotal: 400, quantitySold: 287, maxPerOrder: 6, sortOrder: 0, status: TicketTierStatus.ON_SALE },
          { eventId: event.id, name: 'VIP + Meet & Greet', priceCents: 12000, currency: 'USD', quantityTotal: 50, quantitySold: 42, maxPerOrder: 2, sortOrder: 1, status: TicketTierStatus.ON_SALE },
        ],
      })
    } else if (event.title === 'Bass Protocol Vol. 3') {
      await prisma.ticketTier.createMany({
        data: [
          { eventId: event.id, name: 'Early Bird', priceCents: 3000, currency: 'EUR', quantityTotal: 300, quantitySold: 300, maxPerOrder: 4, sortOrder: 0, status: TicketTierStatus.SOLD_OUT },
          { eventId: event.id, name: 'Tier 2', priceCents: 4000, currency: 'EUR', quantityTotal: 500, quantitySold: 480, maxPerOrder: 6, sortOrder: 1, status: TicketTierStatus.ON_SALE },
          { eventId: event.id, name: 'Final Release', priceCents: 5000, currency: 'EUR', quantityTotal: 400, quantitySold: 210, maxPerOrder: 6, sortOrder: 2, status: TicketTierStatus.ON_SALE },
          { eventId: event.id, name: 'VIP Backstage', priceCents: 10000, currency: 'EUR', quantityTotal: 100, quantitySold: 85, maxPerOrder: 2, sortOrder: 3, status: TicketTierStatus.ON_SALE },
        ],
      })
    }
  }

  console.log('Seeded demo events with ticket tiers')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
