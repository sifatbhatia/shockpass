'use client'

import Link from 'next/link'
import { cn } from '@/lib/cn'

export type LiveTickerItem = {
  label: string
  href: string
}

type LiveTickerProps = {
  items: LiveTickerItem[]
  className?: string
}

export function LiveTicker({ items, className }: LiveTickerProps) {
  const hasItems = items.length > 0
  const safeItems = hasItems
    ? items
    : [{ label: 'Preparing live drops', href: '/events' }]

  const doubled = [...safeItems, ...safeItems]

  return (
    <div
      className={cn(
        'relative min-h-[2.5625rem] overflow-hidden border-y border-border/60 bg-panel/60 py-2.5 backdrop-blur-sm ticker-fade',
        !hasItems && 'pointer-events-none opacity-0',
        className
      )}
      aria-live={hasItems ? 'polite' : 'off'}
      aria-hidden={!hasItems}
    >
      <div className="flex w-max animate-marquee gap-8 px-6 hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <Link
            key={`${item.href}-${i}`}
            href={item.href}
            className="group flex items-center gap-2 whitespace-nowrap text-xs font-medium text-muted transition-colors hover:text-nav-accent focus-ring font-sans"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-live-pulse" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
