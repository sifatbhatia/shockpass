import { prisma } from '@/lib/prisma'
import { pageMetadata } from '@/lib/seo'
import { EventVisibility } from '@/generated/prisma/enums'
import { getDemoEventBySlug } from '@/lib/demo-events'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  let event = null

  try {
    event = await prisma.event.findFirst({
      where: { slug, visibility: EventVisibility.PUBLIC },
      select: { title: true, subtitle: true, description: true, posterUrl: true, slug: true },
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[events/[slug]/metadata] Database unavailable, checking demo event:', error)
    }
  }

  event ??= getDemoEventBySlug(slug)

  if (!event) return pageMetadata.notFound()
  return pageMetadata.eventDetail(event)
}

export default function EventDetailLayout({ children }: { children: React.ReactNode }) {
  return children
}
