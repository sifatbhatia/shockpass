'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { Activity, CalendarDays, DollarSign, Users } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { DashboardShellSkeleton } from '@/components/ui/Skeleton'
import { EventPoster } from '@/components/EventPoster'
import { SellThroughBar } from '@/components/SellThroughBar'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'

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
  const fillRate = totals.capacity > 0 ? Math.round((totals.sold / totals.capacity) * 100) : 0
  const metrics = [
    { label: 'Gross', value: `$${Math.round(totals.gross / 100).toLocaleString()}`, icon: DollarSign },
    { label: 'Tickets out', value: `${totals.sold}/${totals.capacity}`, icon: Users },
    { label: 'Live drops', value: totals.live.toString(), icon: Activity },
    { label: 'Fill rate', value: `${fillRate}%`, icon: CalendarDays },
  ] as const

  return (
    <AppShell>
      <div className="mx-auto max-w-[1650px] px-4 py-8 sm:px-6 md:py-12">
        <section className="mb-8 overflow-hidden rounded-pass border border-white/10 bg-[radial-gradient(ellipse_at_12%_0%,rgba(212,255,82,0.12),transparent_32%),rgba(255,255,255,0.035)] p-5 sm:p-7 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">Organizer hub</p>
              <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.92] tracking-tight sm:text-6xl md:text-7xl">
                Command center for every room you run.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                Track demand, revenue, capacity, and launch state without digging through scattered tools.
              </p>
            </div>
            <Button href="/dashboard/events/new" className="w-full lg:w-auto">{COPY.launchDrop}</Button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-drop border border-white/10 bg-bg/64 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{label}</p>
                  <Icon className="h-4 w-4 text-acid" strokeWidth={1.6} />
                </div>
                <p className="mt-5 font-mono text-2xl font-semibold text-text">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {events.length === 0 ? (
          <EmptyState
            title="No drops yet"
            description={COPY.firstDropHint}
            actionLabel={COPY.openNewDrop}
            actionHref="/dashboard/events/new"
          />
        ) : (
          <div className="overflow-hidden rounded-pass border border-white/10 bg-panel/40">
            <div className="hidden grid-cols-[minmax(0,1.3fr)_0.8fr_0.7fr_0.7fr_0.8fr] gap-5 border-b border-white/10 px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted lg:grid">
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

              const nextAction =
                event.status === 'DRAFT'
                  ? 'Publish'
                  : event.status === 'SCHEDULED'
                    ? 'Go live'
                    : totalSold / Math.max(1, totalCap) >= 0.8
                      ? 'Almost full'
                      : 'Share drop'

              return (
                <Link
                  key={event.id}
                  href={`/dashboard/events/${event.id}`}
                  className="focus-ring grid gap-4 border-b border-white/10 p-4 transition-colors last:border-b-0 hover:bg-white/[0.035] sm:p-5 lg:grid-cols-[minmax(0,1.3fr)_0.8fr_0.7fr_0.7fr_0.8fr] lg:items-center lg:gap-5"
                >
                  <div className="flex min-w-0 gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-drop bg-panel-2">
                      <EventPoster src={event.posterUrl} title={event.title} />
                    </div>
                    <div className="min-w-0 self-center">
                      <h3 className="truncate text-base font-semibold font-sans">{event.title}</h3>
                      <p className="mt-1 truncate text-sm text-muted">
                        {event.venueName} · {event.city}
                      </p>
                      <span className="mt-3 inline-flex rounded-full border border-acid/30 px-2 py-0.5 text-xs text-acid lg:hidden">{nextAction}</span>
                    </div>
                  </div>

                  <p className="font-mono text-sm text-muted lg:text-text">
                    {format(new Date(event.startsAt), 'MMM d, yyyy')}
                  </p>

                  <div>
                    <p className="mb-2 font-mono text-xs text-muted">{totalSold}/{totalCap}</p>
                    {totalCap > 0 && <SellThroughBar sold={totalSold} capacity={totalCap} />}
                  </div>

                  <div>
                    <p className="font-mono text-base font-bold">${gross.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-muted lg:hidden">gross</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 lg:justify-between">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        event.status === 'LIVE' ? 'bg-success/10 text-success' :
                        event.status === 'SCHEDULED' ? 'bg-acid/10 text-acid' :
                        'bg-muted/10 text-muted'
                      }`}>
                      {event.status}
                    </span>
                    <span className="hidden text-xs rounded-full border border-acid/30 text-acid px-2 py-0.5 lg:inline-flex">{nextAction}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </AppShell>
  )
}
