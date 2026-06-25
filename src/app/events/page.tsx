'use client'

import { useState } from 'react'
import { trpc } from '@/trpc/client'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { EventCardSkeleton } from '@/components/ui/Skeleton'
import { EventDropCard } from '@/components/EventDropCard'
import { COPY } from '@/lib/copy'

export default function EventsPage() {
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('')
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    trpc.event.list.useInfiniteQuery(
      { limit: 20, search: search || undefined, city: city || undefined },
      { getNextPageParam: (lastPage) => lastPage.nextCursor }
    )

  const allEvents = data?.pages.flatMap((p) => p.events) ?? []

  return (
    <AppShell showLivePulse={allEvents.some((e) => e.status === 'LIVE')}>
      <section className="mx-auto min-h-[calc(100vh-var(--nav-bar-height,4.5rem))] max-w-[1280px] px-4 py-8 sm:px-6 md:py-14 pb-20">
        <PageHeader
          title={COPY.findTheDrop}
          description={COPY.eventsPageDesc}
          className="mb-6 sm:mb-10"
        />

        <div className="sticky top-[calc(var(--nav-bar-height,4.5rem)+env(safe-area-inset-top))] z-[var(--z-dropdown)] mb-8 border-y border-white/10 bg-bg/92 px-4 py-3 backdrop-blur-md sm:mb-10 sm:px-6 sm:py-4 -mx-4 sm:-mx-6">
          <div className="mx-auto grid max-w-[1280px] min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative min-w-0">
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={COPY.searchDrops}
                aria-label="Search events"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted transition-colors hover:text-text focus-ring rounded font-sans"
                >
                  Clear
                </button>
              )}
            </div>
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              className="min-w-0"
              aria-label="Filter by city"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title={COPY.loadDropsFailed}
            description={COPY.loadDropsFailedHint}
            actionLabel={COPY.tryAgain}
            onAction={() => refetch()}
            illustration="drops"
          />
        ) : allEvents.length === 0 ? (
          <EmptyState
            title="No drops found"
            description="Try a different search or city"
            illustration="drops"
          />
        ) : (
          <>
            <div className="grid min-w-0 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {allEvents.map((event) => (
                <EventDropCard key={event.id} event={event} />
              ))}
            </div>

            {hasNextPage && (
              <div className="mt-12 text-center">
                <Button
                  variant="ghost"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading…' : 'Load more'}
                </Button>
              </div>
            )}
          </>
        )}
      </section>

    </AppShell>
  )
}
