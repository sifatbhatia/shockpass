'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'
import { format } from 'date-fns'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
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

  return (
    <AppShell>
      <div className="mx-auto max-w-[1650px] px-6 py-10">
        <PageHeader
          title={COPY.commandCenter}
          description={`${COPY.trackDemand} across your live drops`}
          display={false}
          action={<Button href="/dashboard/events/new">{COPY.launchDrop}</Button>}
        />

        {events.length === 0 ? (
          <EmptyState
            title="No drops yet"
            description={COPY.firstDropHint}
            actionLabel={COPY.openNewDrop}
            actionHref="/dashboard/events/new"
          />
        ) : (
          <div className="space-y-4">
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
                  className="focus-ring flex gap-4 rounded-pass border border-border bg-panel p-4 transition-[border-color,transform] duration-150 hover:-translate-y-0.5 hover:border-acid/35 md:p-5"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-drop">
                    <EventPoster src={event.posterUrl} title={event.title} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="truncate text-base font-semibold font-sans">{event.title}</h3>
                        <p className="text-sm text-muted">
                          {event.venueName} · {format(new Date(event.startsAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-mono font-bold">${gross.toLocaleString()}</p>
                        <p className="text-[10px] text-muted uppercase">gross</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        event.status === 'LIVE' ? 'bg-success/10 text-success' :
                        event.status === 'SCHEDULED' ? 'bg-acid/10 text-acid' :
                        'bg-muted/10 text-muted'
                      }`}>
                        {event.status}
                      </span>
                      <span className="text-xs text-muted font-mono">{totalSold}/{totalCap}</span>
                      <span className="text-xs rounded-full border border-acid/30 text-acid px-2 py-0.5">{nextAction}</span>
                    </div>
                    {totalCap > 0 && (
                      <div className="mt-2 max-w-md">
                        <SellThroughBar sold={totalSold} capacity={totalCap} />
                      </div>
                    )}
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
