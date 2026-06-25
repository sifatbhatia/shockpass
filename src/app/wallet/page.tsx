'use client'

import { Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { PassSkeleton } from '@/components/ui/Skeleton'
import { TicketPassCard } from '@/components/TicketPassCard'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'
import { ArrowRight, Ticket } from 'lucide-react'

function WalletContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('access')

  const { data, isLoading } = trpc.wallet.getTickets.useQuery(
    { limit: 50 },
    { enabled: status === 'authenticated' && !accessToken }
  )

  const { data: guestOrder, isLoading: guestLoading } = trpc.order.getByAccessToken.useQuery(
    { token: accessToken || '' },
    { enabled: !!accessToken }
  )

  if (!accessToken && status === 'unauthenticated') {
    router.push('/auth')
    return null
  }

  if (isLoading || guestLoading || status === 'loading') {
    return (
      <AppShell footer={false}>
        <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 md:py-10">
          <PassSkeleton />
        </div>
      </AppShell>
    )
  }

  const tickets = accessToken && guestOrder
    ? guestOrder.tickets.map((t) => ({
        id: t.id,
        status: t.status,
        event: guestOrder.event,
        ticketTier: { name: guestOrder.ticketTier.name },
      }))
    : data?.tickets || []

  // Group tickets: "Ready for entry" (VALID + within 24h), "Upcoming" (VALID + beyond 24h), "Past"
  const now = new Date()
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  const readyForEntry = tickets.filter(
    (t) => t.status === 'VALID' && new Date(t.event.startsAt) <= in24Hours
  )
  const upcoming = tickets.filter(
    (t) => t.status === 'VALID' && new Date(t.event.startsAt) > in24Hours
  )
  const past = tickets.filter((t) => t.status !== 'VALID')

  const hasAnyReady = readyForEntry.length > 0 || upcoming.length > 0

  return (
    <AppShell footer={false}>
      <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 md:py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl tracking-tight sm:text-4xl" style={{ fontSize: 'clamp(32px, 4vw, 44px)', letterSpacing: '-0.04em' }}>
            {COPY.myWallet}
          </h1>
          <p className="mt-1 text-sm text-muted font-sans">
            {tickets.length} pass{tickets.length !== 1 ? 'es' : ''} ready for the door
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ticket className="h-12 w-12 text-muted-deep mb-4" strokeWidth={1.5} />
            <h2 className="font-display text-2xl tracking-tight mb-2">No passes yet</h2>
            <p className="text-sm text-muted font-sans mb-6 max-w-md">Your purchased passes will appear here when they are ready.</p>
            <a
              href="/events"
              className="inline-flex items-center justify-center min-h-11 rounded-full bg-acid text-bg px-6 py-2.5 text-sm font-medium font-sans tracking-tight transition-[background,transform] hover:bg-acid-dim active:scale-[0.98] focus-ring"
            >
              Browse drops
              <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={1.6} />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {readyForEntry.length > 0 && (
              <div>
                <h2 className="font-display text-lg tracking-tight text-text mb-3">Ready for entry</h2>
                <div className="space-y-4">
                  {readyForEntry.map((ticket) => (
                    <TicketPassCard
                      key={ticket.id}
                      id={ticket.id}
                      event={ticket.event}
                      ticketTier={ticket.ticketTier}
                      status={ticket.status}
                      href={accessToken ? `/tickets/${ticket.id}?access=${accessToken}` : `/tickets/${ticket.id}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {upcoming.length > 0 && (
              <div>
                <h2 className="font-display text-lg tracking-tight text-text mb-3">Upcoming</h2>
                <div className="space-y-4">
                  {upcoming.map((ticket) => (
                    <TicketPassCard
                      key={ticket.id}
                      id={ticket.id}
                      event={ticket.event}
                      ticketTier={ticket.ticketTier}
                      status={ticket.status}
                      href={accessToken ? `/tickets/${ticket.id}?access=${accessToken}` : `/tickets/${ticket.id}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {past.length > 0 && (
              <div>
                <h2 className="font-display text-lg tracking-tight text-muted mb-3">Past</h2>
                <div className="space-y-4">
                  {past.map((ticket) => (
                    <TicketPassCard
                      key={ticket.id}
                      id={ticket.id}
                      event={ticket.event}
                      ticketTier={ticket.ticketTier}
                      status={ticket.status}
                      href={accessToken ? `/tickets/${ticket.id}?access=${accessToken}` : `/tickets/${ticket.id}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {hasAnyReady && (
              <p className="mt-6 text-xs text-muted-deep font-sans text-center">
                Need to transfer a pass? Open a pass to manage it.
              </p>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}

export default function WalletPage() {
  return (
    <Suspense
      fallback={
        <AppShell footer={false}>
          <div className="mx-auto w-full max-w-[960px] px-4 py-8 sm:px-6 md:py-10">
            <PassSkeleton />
          </div>
        </AppShell>
      }
    >
      <WalletContent />
    </Suspense>
  )
}
