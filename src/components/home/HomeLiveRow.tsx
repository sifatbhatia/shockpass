'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowRight } from 'lucide-react'
import { EventPoster } from '@/components/EventPoster'
import { DropStatePill, type DropState } from '@/components/drop/DropStatePill'
import { SellThroughBar } from '@/components/SellThroughBar'
import { COPY } from '@/lib/copy'
import { cn } from '@/lib/cn'

type HomeEvent = {
  id: string
  slug: string
  title: string
  posterUrl: string | null
  venueName: string | null
  city: string
  startsAt: Date | string
  status: string
  ticketTiers: {
    priceCents: number
    currency?: string
    quantityTotal: number
    quantitySold: number
  }[]
}

function getDropState(event: HomeEvent): DropState {
  const capacity = event.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0)
  const sold = event.ticketTiers.reduce((s, t) => s + t.quantitySold, 0)
  const pct = capacity > 0 ? sold / capacity : 0

  if (event.status === 'SOLD_OUT' || (capacity > 0 && sold >= capacity)) return 'sold_out'
  if (event.status === 'COMPLETED' || event.status === 'CANCELLED') return 'ended'
  if (event.status === 'SCHEDULED') return 'before_sale'
  if (event.status === 'LIVE') {
    if (pct >= 0.9) return 'almost_sold_out'
    return 'on_sale'
  }
  return 'locked'
}

function formatPrice(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export function HomeLiveRow({
  event,
  rank,
  featured,
}: {
  event: HomeEvent
  rank?: number
  featured?: boolean
}) {
  const capacity = event.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0)
  const sold = event.ticketTiers.reduce((s, t) => s + t.quantitySold, 0)
  const minPrice =
    event.ticketTiers.length > 0 ? Math.min(...event.ticketTiers.map((t) => t.priceCents)) : null
  const currency = event.ticketTiers[0]?.currency ?? 'USD'
  const state = getDropState(event)

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'group block transition-colors hover:bg-panel/60 focus-ring',
        'mx-4 my-3 rounded-pass border border-border bg-panel/30 p-4 sm:mx-0 sm:my-0 sm:rounded-none sm:border-0 sm:border-b sm:bg-transparent sm:p-0',
        'sm:grid sm:grid-cols-[56px_minmax(0,1.3fr)_minmax(0,0.9fr)_100px_90px_96px] sm:items-center sm:gap-4 sm:px-4 sm:py-3'
      )}
    >
      <div className="flex items-start gap-3 sm:contents">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-drop bg-panel-2 sm:h-14 sm:w-14">
          <EventPoster src={event.posterUrl} title={event.title} className="h-full w-full sm:h-14 sm:w-14" />
          {rank != null && (
            <span className="absolute left-1 top-1 rounded bg-bg/80 px-1.5 py-0.5 font-mono text-[10px] text-muted">
              {rank}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="line-clamp-2 font-sans text-sm font-semibold leading-snug text-text group-hover:text-nav-accent sm:truncate">
                  {event.title}
                </p>
                {featured && (
                  <span className="rounded-full border border-nav-accent/30 bg-nav-accent/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-nav-accent font-sans sm:hidden">
                    {COPY.featuredDrop}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted font-sans sm:mt-0.5 sm:truncate">
                {event.venueName ? `${event.venueName} · ` : ''}
                {event.city} · {format(new Date(event.startsAt), 'MMM d')}
              </p>
            </div>
            <DropStatePill state={state} className="shrink-0 !px-2 !py-0.5 !text-[10px] sm:hidden" />
          </div>

          <div className="mt-3 sm:hidden">
            <SellThroughBar sold={sold} capacity={capacity} compact />
            <div className="mt-3 flex items-center justify-between gap-2">
              <p className="font-mono text-xs text-muted">
                {sold.toLocaleString()} / {capacity.toLocaleString()}
              </p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-nav-accent font-sans">
                {COPY.getTickets}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden min-w-0 sm:block">
        <SellThroughBar sold={sold} capacity={capacity} compact className="max-w-[140px]" />
        <p className="mt-1 font-mono text-[10px] text-muted">
          {sold.toLocaleString()} / {capacity.toLocaleString()}
        </p>
      </div>

      <p className="hidden text-right font-mono text-sm text-text sm:block">
        {minPrice != null ? `from ${formatPrice(minPrice, currency)}` : '—'}
      </p>

      <div className="hidden justify-end sm:flex">
        <DropStatePill state={state} className="!px-2 !py-0.5 !text-[10px]" />
      </div>

      <div className="hidden items-center justify-end sm:flex">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors group-hover:text-nav-accent font-sans">
          {COPY.getTickets}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  )
}

export function HomeLiveRowSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'mx-4 my-3 rounded-pass border border-border bg-panel/30 p-4 sm:mx-0 sm:my-0 sm:rounded-none sm:border-0 sm:border-b sm:bg-transparent sm:p-0',
        'sm:grid sm:grid-cols-[56px_minmax(0,1.3fr)_minmax(0,0.9fr)_100px_90px_96px] sm:items-center sm:gap-4 sm:px-4 sm:py-3',
        className
      )}
    >
      <div className="flex items-start gap-3 sm:contents">
        <div className="h-16 w-16 shrink-0 rounded-drop skeleton-shimmer sm:h-14 sm:w-14" />
        <div className="min-w-0 flex-1 space-y-2 sm:col-span-1">
          <div className="h-4 w-3/4 max-w-xs rounded skeleton-shimmer" />
          <div className="h-3 w-1/2 max-w-[200px] rounded skeleton-shimmer" />
          <div className="mt-2 h-2 w-full max-w-[180px] rounded skeleton-shimmer sm:hidden" />
        </div>
      </div>
      <div className="hidden sm:block">
        <div className="h-2 w-[120px] rounded skeleton-shimmer" />
        <div className="mt-2 h-2 w-16 rounded skeleton-shimmer" />
      </div>
      <div className="hidden h-4 w-14 justify-self-end rounded skeleton-shimmer sm:block" />
      <div className="hidden h-5 w-16 justify-self-end rounded-full skeleton-shimmer sm:block" />
      <div className="hidden h-3 w-20 justify-self-end rounded skeleton-shimmer sm:block" />
    </div>
  )
}

export function HomeStatCell({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <div className={cn('border border-border bg-panel/50 px-4 py-3', className)}>
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted font-sans">{label}</p>
      <p className="mt-1 font-mono text-xl font-medium text-text sm:text-2xl">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted font-sans">{hint}</p> : null}
    </div>
  )
}
