'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { Plus, Ticket } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { Panel } from '@/components/ui/Panel'
import { DashboardShellSkeleton } from '@/components/ui/Skeleton'
import { EventPoster } from '@/components/EventPoster'
import { SellThroughBar } from '@/components/SellThroughBar'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'
import { cn } from '@/lib/cn'
import toast from 'react-hot-toast'

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export default function DashboardPage() {
  const { status } = useSession()
  const router = useRouter()
  const { data, isLoading } = trpc.event.myEvents.useQuery({ limit: 50 })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth')
  }, [status, router])

  if (status === 'loading' || isLoading) {
    return <DashboardShellSkeleton />
  }

  const events = data?.events || []
  const totals = events.reduce(
    (acc, event) => {
      const sold = event.ticketTiers.reduce((s, t) => s + t.quantitySold, 0)
      const cap = event.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0)
      const gross = event.ticketTiers.reduce((s, t) => s + t.priceCents * t.quantitySold, 0)
      acc.sold += sold
      acc.capacity += cap
      acc.gross += gross
      if (event.status === 'LIVE') acc.live += 1
      return acc
    },
    { sold: 0, capacity: 0, gross: 0, live: 0 }
  )
  const fillRate = totals.capacity > 0 ? ((totals.sold / totals.capacity) * 100) : 0

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 md:py-10">
        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-nav-accent mb-1">Organizer hub</p>
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl leading-[1.05]">
              {events.length > 0 ? `You have ${events.length} drop${events.length !== 1 ? 's' : ''}` : 'Welcome to your hub'}
            </h1>
            <p className="text-sm text-muted font-sans mt-1 max-w-xl">
              Track demand, revenue, capacity, and launch state from one place.
            </p>
          </div>
          <Button href="/dashboard/events/new" className="shrink-0">
            <Plus className="h-4 w-4 mr-1.5" />
            {COPY.launchDrop}
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Gross</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{formatCurrency(totals.gross)}</p>
          </Panel>
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Tickets sold</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{totals.sold}/{totals.capacity}</p>
          </Panel>
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Live drops</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{totals.live}</p>
          </Panel>
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Fill rate</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{fillRate.toFixed(1)}%</p>
          </Panel>
        </div>

        {/* ── Events / Empty State ── */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket className="h-12 w-12 text-muted-deep mb-4" strokeWidth={1.5} />
            <h2 className="font-display text-2xl tracking-tight mb-2">No drops yet</h2>
            <p className="text-sm text-muted font-sans mb-6 max-w-md">{COPY.firstDropHint}</p>
            <Button href="/dashboard/events/new">
              <Plus className="h-4 w-4 mr-1.5" />
              {COPY.openNewDrop}
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-pass border border-border bg-panel/40">
            {/* Table header (desktop) */}
            <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-border font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
              <span>Drop</span>
              <span>When</span>
              <span>Fill</span>
              <span>Gross</span>
              <span>Status</span>
            </div>

            {events.map((event) => {
              const totalSold = event.ticketTiers.reduce((s, t) => s + t.quantitySold, 0)
              const totalCap = event.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0)
              const gross = event.ticketTiers.reduce((s, t) => s + t.priceCents * t.quantitySold, 0) / 100
              const isCancelled = event.status === 'CANCELLED'

              const nextAction =
                event.status === 'DRAFT'
                  ? 'Publish'
                  : event.status === 'SCHEDULED'
                    ? 'Go live'
                    : totalSold / Math.max(1, totalCap) >= 0.8
                      ? 'Almost full'
                      : 'Share drop'

              const handleShare = (e: React.MouseEvent) => {
                e.preventDefault()
                e.stopPropagation()
                navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`)
                toast.success('Link copied')
              }

              return (
                <div
                  key={event.id}
                  className={cn(
                    'focus-ring block border-b border-border last:border-b-0 transition-colors hover:bg-white/[0.025]',
                    isCancelled && 'opacity-55 pointer-events-none'
                  )}
                >
                  <div className="p-4 sm:p-5">
                    {/* Mobile layout */}
                    <div className="lg:hidden">
                      <div className="flex gap-4">
                        <Link href={`/dashboard/events/${event.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-drop bg-panel-2">
                          <EventPoster src={event.posterUrl} title={event.title} />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link href={`/dashboard/events/${event.id}`} className="text-sm font-semibold font-sans truncate hover:text-acid transition-colors">{event.title}</Link>
                              <p className="text-xs text-muted font-sans truncate mt-0.5">
                                {event.venueName} · {event.city} · {format(new Date(event.startsAt), 'MMM d')}
                              </p>
                            </div>
                            <span className={cn(
                              'shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-sans',
                              event.status === 'LIVE' ? 'border-success/40 bg-success/10 text-success' :
                              event.status === 'SCHEDULED' ? 'border-acid/30 bg-acid/10 text-acid' :
                              event.status === 'CANCELLED' ? 'border-hot/20 bg-hot/10 text-hot' :
                              'border-muted/20 bg-muted/10 text-muted'
                            )}>
                              {event.status === 'LIVE' ? 'Live' :
                               event.status === 'SCHEDULED' ? 'Scheduled' :
                               event.status === 'DRAFT' ? 'Draft' :
                               event.status === 'CANCELLED' ? 'Cancelled' : 'Unknown'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted font-mono">
                            <span>{totalSold}/{totalCap} sold</span>
                            <span>${gross.toFixed(2)}</span>
                          </div>
                          {totalCap > 0 && (
                            <div className="mt-2">
                              <SellThroughBar sold={totalSold} capacity={totalCap} />
                            </div>
                          )}
                          {/* Mobile actions */}
                          <div className="flex items-center gap-2 mt-3">
                            {isCancelled ? (
                              <>
                                <Link href={`/dashboard/events/${event.id}`} className="text-[11px] font-medium text-muted hover:text-text transition-colors font-sans">View</Link>
                              </>
                            ) : (
                              <>
                                <button onClick={handleShare} className="text-[11px] font-medium text-acid hover:underline font-sans">{COPY.shareDrop}</button>
                                <Link href={`/dashboard/events/${event.id}`} className="text-[11px] font-medium text-muted hover:text-text transition-colors font-sans">Manage</Link>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden lg:grid lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 items-center">
                      <div className="flex items-center gap-4 min-w-0">
                        <Link href={`/dashboard/events/${event.id}`} className="relative h-14 w-14 shrink-0 overflow-hidden rounded-drop bg-panel-2">
                          <EventPoster src={event.posterUrl} title={event.title} />
                        </Link>
                        <div className="min-w-0">
                          <Link href={`/dashboard/events/${event.id}`} className="text-sm font-semibold font-sans truncate hover:text-acid transition-colors">{event.title}</Link>
                          <p className="text-xs text-muted font-sans truncate">{event.venueName} · {event.city}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted font-mono">{format(new Date(event.startsAt), 'MMM d, yyyy')}</p>
                      <div>
                        <p className="text-xs text-muted font-mono mb-1">{totalSold}/{totalCap}</p>
                        {totalCap > 0 && <SellThroughBar sold={totalSold} capacity={totalCap} />}
                      </div>
                      <p className="font-mono text-sm text-text">${gross.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-sans',
                          event.status === 'LIVE' ? 'border-success/40 bg-success/10 text-success' :
                          event.status === 'SCHEDULED' ? 'border-acid/30 bg-acid/10 text-acid' :
                          event.status === 'CANCELLED' ? 'border-hot/20 bg-hot/10 text-hot' :
                          'border-muted/20 bg-muted/10 text-muted'
                        )}>
                          {event.status === 'LIVE' ? 'Live' :
                           event.status === 'SCHEDULED' ? 'Scheduled' :
                           event.status === 'DRAFT' ? 'Draft' :
                           event.status}
                        </span>
                        {isCancelled ? (
                          <Link href={`/dashboard/events/${event.id}`} className="pointer-events-auto text-[11px] font-medium text-muted hover:text-text transition-colors font-sans">View</Link>
                        ) : (
                          <button onClick={handleShare} className="pointer-events-auto text-[12px] font-medium text-acid hover:underline font-sans">{nextAction}</button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
