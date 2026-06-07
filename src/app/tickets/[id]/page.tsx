'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PassSkeleton } from '@/components/ui/Skeleton'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { EventPoster } from '@/components/EventPoster'
import { BRAND } from '@/lib/brand'
import { COPY } from '@/lib/copy'
import { trpc } from '@/trpc/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/cn'

function TicketDetailContent() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('access')
  const { status } = useSession()
  const router = useRouter()

  const authTicket = trpc.wallet.getTicket.useQuery({ id }, { enabled: !!id && !accessToken && status === 'authenticated' })
  const guestTicket = trpc.wallet.getTicketGuest.useQuery(
    { id, accessToken: accessToken || '' },
    { enabled: !!id && !!accessToken }
  )

  const ticket = accessToken ? guestTicket.data : authTicket.data
  const isLoading = accessToken ? guestTicket.isLoading : authTicket.isLoading

  const authQr = trpc.wallet.getRotatingQR.useQuery(
    { ticketId: id },
    { enabled: !!id && !accessToken && status === 'authenticated', refetchInterval: 25_000 }
  )
  const guestQr = trpc.wallet.getRotatingQRGuest.useQuery(
    { ticketId: id, accessToken: accessToken || '' },
    { enabled: !!id && !!accessToken, refetchInterval: 25_000 }
  )
  const qr = accessToken ? guestQr.data : authQr.data

  const [showTransfer, setShowTransfer] = useState(false)
  const [transferEmail, setTransferEmail] = useState('')

  const initiateTransfer = trpc.wallet.initiateTransfer.useMutation({
    onSuccess: () => { toast.success('Transfer started'); setShowTransfer(false) },
    onError: (e) => toast.error(e.message),
  })

  useEffect(() => {
    if (!accessToken && status === 'unauthenticated') router.push('/auth')
  }, [status, router, accessToken])

  if (isLoading || (!accessToken && status === 'loading')) {
    return (
      <div className="min-h-screen bg-bg px-6 py-10">
        <div className="mx-auto max-w-md">
          <PassSkeleton />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <p className="text-muted font-sans">Pass not found</p>
      </div>
    )
  }

  const isValid = ticket.status === 'VALID'
  const isCheckedIn = ticket.status === 'CHECKED_IN'

  return (
    <div className="min-h-screen bg-bg">
      <div className="relative min-h-[36vh] grain-overlay stage-vignette">
        <EventPoster src={ticket.event.posterUrl} title={ticket.event.title} priority className="absolute inset-0 h-full scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/20 via-bg/70 to-bg" />
        <div className="relative px-6 pt-6">
          <Button
            variant="ghost"
            href={accessToken ? `/wallet?access=${accessToken}` : '/wallet'}
            className="!min-h-9 !px-4 text-xs"
          >
            ← {COPY.myWallet}
          </Button>
        </div>
        <div className="relative px-6 pb-6 pt-2 animate-fade-up">
          <SectionLabel>Door pass</SectionLabel>
          <h1 className="font-display text-5xl tracking-tight md:text-6xl">{ticket.event.title}</h1>
          <p className="mt-2 font-mono text-sm text-muted">
            {format(new Date(ticket.event.startsAt), 'EEE MMM d · h:mm a')}
          </p>
        </div>
      </div>

      <div className="relative -mt-6 mx-auto max-w-md px-6 pb-12 animate-fade-up">
        <div
          className={cn(
            'pass-texture relative overflow-hidden rounded-pass border border-border bg-panel shadow-panel',
            isValid && 'animate-pass-glow',
            isCheckedIn && 'border-electric/50'
          )}
        >
          {isCheckedIn && (
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
              <span className="rotate-[-12deg] rounded-pass border-4 border-electric/40 px-6 py-2 font-display text-5xl uppercase text-electric/30">
                Checked in
              </span>
            </div>
          )}

          <div className="relative flex flex-col items-center bg-white px-6 py-8">
            <span className="pass-notch-left !bg-bg" aria-hidden />
            <span className="pass-notch-right !bg-bg" aria-hidden />
            <div className="flex h-56 w-56 items-center justify-center rounded-pass border-4 border-bg/10 bg-white p-2">
              {qr?.token ? (
                <QRCodeSVG value={qr.token} size={208} bgColor="#ffffff" fgColor="#050505" level="M" />
              ) : (
                <div className="flex h-40 w-40 items-center justify-center rounded bg-black/5">
                  <span className="font-mono text-2xl font-bold text-black">{BRAND.monogram}</span>
                </div>
              )}
            </div>
            <p className="mt-3 font-mono text-[10px] text-black/45">{COPY.qrRefresh}</p>
          </div>

          <div className="relative border-t border-dashed border-border bg-bg/35 p-6 backdrop-blur-sm">
            <span className="pass-notch-left" aria-hidden />
            <span className="pass-notch-right" aria-hidden />
            <p className="font-display text-2xl tracking-tight">{ticket.ticketTier.name}</p>
            <p className="mt-1 text-sm text-muted font-sans">{ticket.event.venueName}</p>
            <span
              className={cn(
                'mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase font-sans',
                isCheckedIn ? 'bg-electric/15 text-electric' : 'bg-success/10 text-success'
              )}
            >
              {ticket.status.replace('_', ' ')}
            </span>

            {!accessToken && ticket.status === 'VALID' && (
              <Button variant="ghost" className="mt-5 w-full" onClick={() => setShowTransfer(!showTransfer)}>
                Transfer pass
              </Button>
            )}

            {showTransfer && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <Input
                  value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="Recipient email"
                  type="email"
                />
                <Button
                  className="w-full"
                  onClick={() => initiateTransfer.mutate({ ticketId: id, recipientEmail: transferEmail })}
                >
                  Send transfer
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TicketDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg px-6 py-10">
          <div className="mx-auto max-w-md">
            <PassSkeleton />
          </div>
        </div>
      }
    >
      <TicketDetailContent />
    </Suspense>
  )
}
