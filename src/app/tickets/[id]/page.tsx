'use client'

import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PassSkeleton } from '@/components/ui/Skeleton'
import { EventPoster } from '@/components/EventPoster'
import { BRAND } from '@/lib/brand'
import { COPY } from '@/lib/copy'
import { trpc } from '@/trpc/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/cn'
import { ArrowLeft, Ticket } from 'lucide-react'

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
      <div className="min-h-screen bg-[#030303] px-6 py-10">
        <div className="mx-auto max-w-[1180px]">
          <PassSkeleton />
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030303]">
        <p className="text-muted font-sans">Pass not found</p>
      </div>
    )
  }

  const isValid = ticket.status === 'VALID'
  const isCheckedIn = ticket.status === 'CHECKED_IN'

  return (
    <div
      className="min-h-screen"
      style={{
        background: `
          radial-gradient(circle at 20% 0%, rgba(132,204,22,0.10), transparent 30%),
          radial-gradient(circle at 80% 0%, rgba(168,85,247,0.10), transparent 34%),
          #030303
        `
      }}
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 py-6 pb-16 sm:px-6 sm:pb-24 sm:pt-8">
        {/* ── Back ── */}
        <a
          href={accessToken ? `/wallet?access=${accessToken}` : '/wallet'}
          className="inline-flex items-center gap-1.5 h-10 text-sm text-muted font-sans transition-colors hover:text-text focus-ring rounded-sm mb-6"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          My Wallet
        </a>

        {/* ── Two-column layout ── */}
        <div className="grid gap-10 items-start md:grid-cols-[minmax(280px,420px)_minmax(360px,520px)] md:gap-16">
          {/* ── Left: Event Summary ── */}
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-nav-accent mb-2">
              Door pass
            </p>
            <h1
              className="font-display leading-[0.9] tracking-tight text-text"
              style={{ fontSize: 'clamp(48px, 7vw, 84px)', letterSpacing: '-0.05em' }}
            >
              {ticket.event.title}
            </h1>
            <p className="mt-3 font-mono text-sm text-muted">
              {format(new Date(ticket.event.startsAt), 'EEE MMM d · h:mm a')}
            </p>
            <p className="mt-1 text-sm text-muted font-sans">
              {ticket.event.venueName || 'Venue TBD'}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span
                className={cn(
                  'inline-flex items-center h-7 rounded-full px-3 text-[11px] font-bold uppercase tracking-wider font-sans border',
                  isCheckedIn
                    ? 'border-electric/30 bg-electric/15 text-electric'
                    : isValid
                      ? 'border-success/30 bg-success/12 text-success'
                      : 'border-border bg-panel-2 text-muted'
                )}
              >
                {(() => {
                  const s = ticket.status
                  if (s === 'VALID') return 'Valid'
                  if (s === 'CHECKED_IN') return 'Checked in'
                  return s.replace('_', ' ')
                })()}
              </span>
              <span className="text-sm text-muted font-sans">{ticket.ticketTier.name}</span>
            </div>

            {/* Mobile: poster badge */}
            <div className="mt-6 md:hidden">
              <div className="relative h-32 w-full overflow-hidden rounded-pass border border-border bg-panel-2">
                {ticket.event.posterUrl ? (
                  <EventPoster src={ticket.event.posterUrl} title={ticket.event.title} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-acid/20 to-acid/5">
                    <Ticket className="h-10 w-10 text-acid/40" strokeWidth={1.5} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: QR Pass Card ── */}
          <div
            className="w-full overflow-hidden rounded-[28px] border border-border"
            style={{
              maxWidth: 'min(100%, 460px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.55), 0 0 80px rgba(255,122,61,0.08)',
            }}
          >
            {/* QR section */}
            <div className="bg-[#f5f5f5] px-6 py-8 sm:px-8 sm:py-10 grid place-items-center text-center">
              {isCheckedIn ? (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex h-56 w-56 items-center justify-center rounded-[18px] bg-black/5 border border-black/10">
                    <span className="font-display text-4xl text-black/30">✓</span>
                  </div>
                  <p className="text-sm font-sans text-black/60">Checked in — QR no longer active</p>
                </div>
              ) : (
                <>
                  <div className="flex h-56 w-56 items-center justify-center rounded-[18px] border-8 border-black/8 bg-white p-2 sm:h-60 sm:w-60">
                    {qr?.token ? (
                      <QRCodeSVG value={qr.token} size={200} bgColor="#ffffff" fgColor="#050505" level="M" />
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded bg-black/5">
                        <span className="font-mono text-3xl font-bold text-black/50">{BRAND.monogram}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-xs text-black/60 font-mono">
                    Rotating QR — refreshes every 25 seconds
                  </p>
                </>
              )}
            </div>

            {/* Pass info section */}
            <div
              className="px-6 py-6 sm:px-8 sm:py-6"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0)), #070707',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-display text-2xl tracking-tight">{ticket.ticketTier.name}</span>
                <span
                  className={cn(
                    'inline-flex items-center h-7 rounded-full px-3 text-[11px] font-bold uppercase tracking-wider font-sans border',
                    isCheckedIn
                      ? 'border-electric/30 bg-electric/15 text-electric'
                      : isValid
                        ? 'border-success/30 bg-success/12 text-success'
                        : 'border-border bg-panel-2 text-muted'
                  )}
                >
                  {isValid ? 'Valid' :
                   isCheckedIn ? 'Used' :
                   ticket.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-muted font-sans">{ticket.event.venueName || 'Venue TBD'}</p>
              <p className="mt-1 text-xs text-muted-deep font-mono">
                {format(new Date(ticket.event.startsAt), 'EEE MMM d · h:mm a')}
              </p>

              {/* Transfer */}
              {!accessToken && isValid && (
                <div className="mt-6">
                  <button
                    onClick={() => setShowTransfer(!showTransfer)}
                    className="w-full inline-flex items-center justify-center h-11 rounded-full border border-border bg-transparent text-sm font-medium font-sans text-text transition-colors hover:bg-white/[0.05] hover:border-white/20 focus-ring"
                  >
                    Transfer pass
                  </button>
                  {showTransfer && (
                    <div className="mt-3 space-y-2">
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
              )}

              {/* Entry details */}
              <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-deep font-sans space-y-1">
                {(ticket as any).id && (
                  <p>Ticket ID: {(ticket as any).id.slice(0, 12).toUpperCase()}</p>
                )}
                <p className="mt-3 text-muted">Have this ready at the door.</p>
              </div>
            </div>
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
        <div className="min-h-screen bg-[#030303] px-6 py-10">
          <div className="mx-auto max-w-[1180px]">
            <PassSkeleton />
          </div>
        </div>
      }
    >
      <TicketDetailContent />
    </Suspense>
  )
}
