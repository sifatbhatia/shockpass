import Link from 'next/link'
import { format } from 'date-fns'
import { EventPoster } from '@/components/EventPoster'
import { cn } from '@/lib/cn'
import { ChevronRight, Ticket } from 'lucide-react'

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
}

export function TicketPassCard({
  event,
  ticketTier,
  status,
  href,
  className,
}: TicketPassCardProps) {
  const isValid = status === 'VALID'
  const isCheckedIn = status === 'CHECKED_IN'

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex min-h-[160px] overflow-hidden rounded-[24px] border border-border transition-all duration-200',
        'hover:-translate-y-[1px] hover:border-acid/32 hover:shadow-lg focus-ring',
        isValid && 'animate-pass-glow',
        className
      )}
    >
      {/* Poster */}
      <div className="relative w-24 shrink-0 bg-panel-2 sm:w-[96px]">
        <div className="absolute inset-0">
          {event.posterUrl ? (
            <EventPoster src={event.posterUrl} title={event.title} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-acid/20 to-acid/5">
              <Ticket className="h-8 w-8 text-acid/40" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div className="absolute inset-y-0 right-0 w-px border-r border-dashed border-border/70" />
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-center gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-6">
        {/* Left — Event info */}
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">
            {format(new Date(event.startsAt), 'EEE MMM d · h:mm a')}
          </p>
          <h3 className={cn(
            'mt-1 font-display text-lg tracking-tight transition-colors group-hover:text-acid sm:text-xl',
            'line-clamp-1'
          )}>
            {event.title}
          </h3>
          {event.venueName && (
            <p className="mt-0.5 text-sm text-muted font-sans truncate">
              {event.venueName}
            </p>
          )}
          <p className="mt-1.5 text-xs font-mono text-muted">{ticketTier.name}</p>
        </div>

        {/* Middle — Date/Time + Status */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2 sm:min-w-[120px]">
          <div className="sm:text-right">
            <p className="font-mono text-sm text-text font-semibold">
              {format(new Date(event.startsAt), 'MMM d')}
            </p>
            <p className="font-mono text-[11px] text-muted">
              {format(new Date(event.startsAt), 'h:mm a')}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 inline-flex items-center h-7 rounded-full px-3 text-[11px] font-bold uppercase tracking-wider font-sans border',
              isCheckedIn
                ? 'border-electric/30 bg-electric/15 text-electric'
                : isValid
                  ? 'border-success/30 bg-success/12 text-success'
                  : 'border-border bg-panel-2 text-muted'
            )}
          >
            {isValid ? 'Valid' : status.replace('_', ' ')}
          </span>
        </div>

        {/* Right — Chevron */}
        <ChevronRight
          className="hidden sm:block h-5 w-5 text-muted-deep transition-transform group-hover:translate-x-0.5 group-hover:text-acid shrink-0"
          strokeWidth={1.5}
        />
      </div>
    </Link>
  )
}
