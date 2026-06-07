import { prisma } from '@/lib/prisma'
import { pageMetadata } from '@/lib/seo'
import { EventVisibility } from '@/generated/prisma/enums'
import { getDemoEventBySlug } from '@/lib/demo-events'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Omit<Props, 'children'>) {
  const { slug } = await params
  let event: { title: string; slug: string } | null = null

  try {
    event = await prisma.event.findFirst({
      where: { slug, visibility: EventVisibility.PUBLIC },
      select: { title: true, slug: true },
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[events/[slug]/checkout/metadata] Database unavailable, checking demo event:', error)
    }
  }

  event ??= getDemoEventBySlug(slug)

  return pageMetadata.checkout(event?.title ?? 'Ticket drop', slug)
}

export default function CheckoutLayout({ children }: Props) {
  return children
}
