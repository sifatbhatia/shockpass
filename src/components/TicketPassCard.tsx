'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/cn'
import { normalizePosterUrl } from '@/lib/poster-assets'
import { ChevronRight } from 'lucide-react'

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
  const posterSrc = normalizePosterUrl(event.posterUrl)

  return (
    <Link
      href={href}
      className={cn(
        'group relative grid min-h-[160px] grid-cols-[96px_1fr_auto] items-center gap-6 overflow-hidden rounded-[24px] border border-white/10 p-5 transition-all duration-200',
        'hover:-translate-y-[1px] hover:border-acid/32 hover:shadow-lg focus-ring',
        isValid && 'animate-pass-glow',
        className
      )}
    >
      {/* Poster background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-panel-2 via-bg to-panel-2" />
      {posterSrc && (
        <>
          <div className="absolute inset-0">
            <Image
              src={posterSrc}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-bg/85 via-bg/70 to-bg/85" />
        </>
      )}

      {/* Left column — 96px */}
      <div className="relative z-10 flex flex-col items-start gap-1 min-w-0">
        <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg border border-acid/25 bg-acid/10">
          <span className="text-xs font-black text-acid">{BRAND.monogram}</span>
        </div>
        <h3 className="font-display text-lg tracking-tight text-text line-clamp-2 group-hover:text-acid transition-colors sm:text-xl">
          {event.title}
        </h3>
        <p className="text-sm text-muted font-sans truncate w-full">
          {event.venueName || 'Venue TBD'}
        </p>
        <p className="text-xs font-mono text-muted-deep">{ticketTier.name}</p>
      </div>

      {/* Middle column — 1fr */}
      <div className="relative z-10 flex flex-col items-start gap-0.5 min-w-0">
        <p className="font-mono text-sm text-text font-semibold whitespace-nowrap">
          {format(new Date(event.startsAt), 'EEE MMM d · h:mm a')}
        </p>
        <p
          className={cn(
            'font-mono text-xs',
            isValid ? 'text-success' : 'text-muted-deep'
          )}
        >
          {isValid ? 'Door pass ready' : status.replace('_', ' ')}
        </p>
      </div>

      {/* Right column — auto */}
      <div className="relative z-10 flex flex-col items-end gap-2 self-center">
        <span
          className={cn(
            'inline-flex items-center h-7 rounded-full px-3 text-[11px] font-bold uppercase tracking-wider font-sans border',
            isValid
              ? 'border-success/30 bg-success/12 text-success'
              : 'border-border bg-panel-2 text-muted'
          )}
        >
          {isValid ? 'Valid' : status.replace('_', ' ')}
        </span>
        <span className="flex items-center gap-1 text-xs font-sans text-muted-deep group-hover:text-acid transition-colors">
          View pass
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      </div>
    </Link>
  )
}
