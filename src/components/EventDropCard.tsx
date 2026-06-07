import Link from 'next/link'
import { format } from 'date-fns'
import { EventPoster } from '@/components/EventPoster'
import { SellThroughBar } from '@/components/SellThroughBar'
import { COPY } from '@/lib/copy'
import { cn } from '@/lib/cn'

type EventDropCardProps = {
  event: {
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
  variant?: 'vertical' | 'horizontal' | 'featured'
  className?: string
}

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export function EventDropCard({ event, variant = 'vertical', className }: EventDropCardProps) {
  const totalCapacity = event.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0)
  const totalSold = event.ticketTiers.reduce((s, t) => s + t.quantitySold, 0)
  const soldPercent = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0
  const minPrice =
    event.ticketTiers.length > 0 ? Math.min(...event.ticketTiers.map((t) => t.priceCents)) : null
  const currency = event.ticketTiers[0]?.currency ?? 'USD'

  const isHorizontal = variant === 'horizontal' || variant === 'featured'

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        'group focus-ring block min-w-0 overflow-hidden rounded-pass border border-border bg-panel shadow-panel',
        'transition-[border-color,transform,box-shadow] duration-200 hover:border-acid/45 hover:-translate-y-1 hover:shadow-glow-acid',
        isHorizontal ? 'grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]' : '',
        variant === 'featured' && 'md:min-h-[280px]',
        className
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden bg-panel-2',
          isHorizontal ? 'min-h-[200px] md:min-h-full' : 'aspect-[4/3]'
        )}
      >
        <EventPoster src={event.posterUrl} title={event.title} />
        {event.status === 'LIVE' && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-bg/85 px-3 py-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-live-pulse" />
            <span className="text-[11px] font-medium font-sans">{COPY.onSaleNow}</span>
          </div>
        )}
        {soldPercent >= 75 && event.status !== 'SOLD_OUT' && (
          <div className="absolute top-3 right-3 rounded-full bg-hot px-2.5 py-1 text-[11px] font-semibold text-white font-sans">
            {COPY.sellingFast}
          </div>
        )}
      </div>

      <div className={cn('flex min-w-0 flex-col justify-center p-4 sm:p-5 md:p-6', variant === 'featured' && 'md:p-8')}>
        <p className="text-[11px] font-mono uppercase tracking-wider text-muted mb-2">
          {format(new Date(event.startsAt), 'EEE · MMM d')}
          {event.city ? ` · ${event.city}` : ''}
        </p>
        <h3
          className={cn(
            'text-balance font-display tracking-tight group-hover:text-acid transition-colors',
            variant === 'featured' ? 'text-3xl md:text-4xl leading-none' : 'text-xl line-clamp-2'
          )}
        >
          {event.title}
        </h3>
        {event.venueName && (
          <p className="mt-2 text-sm text-muted font-sans truncate">{event.venueName}</p>
        )}
        <div className="mt-4 flex min-w-0 items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted font-sans">From</p>
            <p className="font-mono text-lg font-semibold text-text">
              {minPrice !== null ? formatPrice(minPrice, currency) : '—'}
            </p>
          </div>
          <p className="font-mono text-xs text-muted">
            {totalSold}/{totalCapacity}
          </p>
        </div>
        {totalCapacity > 0 && (
          <div className="mt-3">
            <SellThroughBar sold={totalSold} capacity={totalCapacity} />
          </div>
        )}
      </div>
    </Link>
  )
}
