import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/seo'
import { EventStatus, EventVisibility } from '@/generated/prisma/enums'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${siteConfig.url}/events`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
  ]

  try {
    const events = await prisma.event.findMany({
      where: {
        visibility: EventVisibility.PUBLIC,
        status: { in: [EventStatus.SCHEDULED, EventStatus.LIVE, EventStatus.SOLD_OUT] },
      },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    })

    return [
      ...staticRoutes,
      ...events.map((event) => ({
        url: `${siteConfig.url}/events/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      })),
    ]
  } catch {
    return staticRoutes
  }
}
