'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/trpc/client'
import { format } from 'date-fns'
import { EventPoster } from '@/components/EventPoster'
import { AppShell } from '@/components/AppShell'
import { TicketDropModule } from '@/components/TicketDropModule'
import { DropStatePill } from '@/components/drop/DropStatePill'
import { MetaChip } from '@/components/ui/MetaChip'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { EventPageSkeleton } from '@/components/ui/Skeleton'
import { COPY } from '@/lib/copy'

export default function EventPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: event, isLoading } = trpc.event.getBySlug.useQuery({ slug })

  if (isLoading) {
    return (
      <AppShell stickyNav={false}>
        <EventPageSkeleton />
      </AppShell>
    )
  }

  if (!event) {
    return (
      <AppShell>
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="text-center animate-fade-up">
            <h1 className="font-display text-4xl tracking-tight">{COPY.dropNotFound}</h1>
            <Link
              href="/events"
              className="focus-ring mt-4 inline-block rounded-drop text-sm text-acid hover:underline font-sans"
            >
              {COPY.seeWhatsLive}
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  const totalCapacity = event.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0)
  const totalSold = event.ticketTiers.reduce((s, t) => s + t.quantitySold, 0)
  const isOnSale = event.ticketTiers.some((t) => t.status === 'ON_SALE')
  const dropState =
    totalSold >= totalCapacity
      ? 'sold_out'
      : totalSold / Math.max(1, totalCapacity) >= 0.9
        ? 'almost_sold_out'
        : isOnSale
          ? 'on_sale'
          : 'before_sale'

  return (
    <AppShell showLivePulse={isOnSale} mainClassName="pb-[420px] md:pb-0">
      <section className="relative min-h-[70vh] overflow-hidden grain-overlay stage-vignette">
        <div className="absolute inset-0">
          <EventPoster
            src={event.posterUrl}
            title={event.title}
            priority
            className="!absolute inset-0 !h-full !aspect-auto scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/20 to-transparent" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-[1650px] flex-col justify-end px-6 pb-10 pt-16 md:pb-14">
          <div className="animate-fade-up max-w-4xl">
            <DropStatePill state={dropState} className="mb-5 w-fit" />
            <h1 className="font-display text-balance text-5xl leading-[0.95] tracking-tight md:text-7xl lg:text-8xl">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted font-sans md:text-lg">
                {event.subtitle}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              <MetaChip>{event.venueName}, {event.city}</MetaChip>
              <MetaChip>{format(new Date(event.startsAt), 'EEE · MMM d · h:mm a')}</MetaChip>
              {totalCapacity > 0 && (
                <MetaChip className="font-mono">
                  {totalSold}/{totalCapacity} sold
                </MetaChip>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="ambient-glow mx-auto max-w-[1650px] px-6 py-12 md:py-20">
        <div className="grid gap-12 md:grid-cols-5 md:gap-16">
          <div className="space-y-12 md:col-span-3">
            <article className="animate-fade-up">
              <SectionLabel className="mb-3">{COPY.aboutDrop}</SectionLabel>
              <div className="max-w-prose text-sm leading-[1.75] text-muted whitespace-pre-wrap font-sans text-pretty">
                {event.description}
              </div>
            </article>

            <article className="border-t border-border pt-10 animate-fade-up">
              <SectionLabel className="mb-4">{COPY.presentedBy}</SectionLabel>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-panel-2 font-display text-lg text-acid">
                  {event.organizer.name?.[0] || '?'}
                </div>
                <div>
                  <p className="font-semibold font-sans">{event.organizer.name}</p>
                  <p className="text-xs text-muted font-sans">{COPY.dropCurator}</p>
                </div>
              </div>
            </article>
          </div>

          <div className="md:col-span-2">
            <TicketDropModule
              eventId={event.id}
              eventSlug={event.slug}
              eventTitle={event.title}
              tiers={event.ticketTiers}
              totalCapacity={totalCapacity}
              totalSold={totalSold}
            />
          </div>
        </div>
      </section>
    </AppShell>
  )
}
