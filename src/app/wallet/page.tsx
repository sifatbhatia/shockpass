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
        <div className="mx-auto max-w-2xl space-y-4 px-6 py-10">
          <PassSkeleton />
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

  const [first, ...rest] = tickets

  return (
    <AppShell footer={false}>
      <div className="mx-auto max-w-2xl px-6 py-10 md:py-14">
        <PageHeader
          title={COPY.myWallet}
          description={`${tickets.length} pass${tickets.length !== 1 ? 'es' : ''} ready for the door`}
          display={false}
        />

        {tickets.length === 0 ? (
          <EmptyState
            title="No passes yet"
            description="Grab a ticket from a live drop"
            actionLabel={COPY.seeWhatsLive}
            actionHref="/events"
            illustration="wallet"
          />
        ) : (
          <div className="space-y-4 animate-fade-up">
            {first && (
              <TicketPassCard
                key={first.id}
                id={first.id}
                event={first.event}
                ticketTier={first.ticketTier}
                status={first.status}
                href={accessToken ? `/tickets/${first.id}?access=${accessToken}` : `/tickets/${first.id}`}
                featured
              />
            )}
            {rest.map((ticket) => (
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
          <div className="mx-auto max-w-2xl px-6 py-10">
            <PassSkeleton />
          </div>
        </AppShell>
      }
    >
      <WalletContent />
    </Suspense>
  )
}
