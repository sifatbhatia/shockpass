import Link from 'next/link'
import { format } from 'date-fns'
import { EventPoster } from '@/components/EventPoster'
import { cn } from '@/lib/cn'

type TicketPassCardProps = {
  id: string
  event: {
    title: string
    posterUrl: string | null
    venueName: string | null
    startsAt: Date | string
  }
  ticketTier: { name: string }
  status: string
  href: string
  className?: string
  featured?: boolean
}

export function TicketPassCard({
  event,
  ticketTier,
  status,
  href,
  className,
  featured,
}: TicketPassCardProps) {
  const isValid = status === 'VALID'
  const isCheckedIn = status === 'CHECKED_IN'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex overflow-hidden rounded-pass border border-border bg-panel',
        'pass-texture',
        'transition-[border-color,transform,box-shadow] duration-200',
        'hover:-translate-y-1 hover:border-acid/45 hover:shadow-panel focus-ring',
        isValid && 'animate-pass-glow',
        featured && 'md:min-h-[140px]',
        className
      )}
    >
      <span className="pass-notch-left" aria-hidden />
      <span className="pass-notch-right" aria-hidden />

      <div className={cn('relative shrink-0 bg-panel-2', featured ? 'w-28 md:w-36' : 'w-24 md:w-28')}>
        <EventPoster src={event.posterUrl} title={event.title} />
        <div className="absolute inset-y-0 right-0 w-px border-r border-dashed border-border/70" />
      </div>

      <div className="relative flex flex-1 items-center justify-between gap-4 p-4 md:p-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
            {format(new Date(event.startsAt), 'EEE MMM d')}
          </p>
          <h3
            className={cn(
              'truncate font-display tracking-tight transition-colors group-hover:text-acid',
              featured ? 'text-2xl' : 'text-lg'
            )}
          >
            {event.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-muted font-sans">
            {event.venueName}
          </p>
          <p className="mt-2 text-xs font-mono text-muted">{ticketTier.name}</p>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider font-sans',
            isCheckedIn
              ? 'border border-electric/30 bg-electric/15 text-electric'
              : isValid
                ? 'border border-success/30 bg-success/10 text-success'
                : 'border border-border bg-panel-2 text-muted'
          )}
        >
          {status.replace('_', ' ')}
        </span>
      </div>
    </Link>
  )
}
