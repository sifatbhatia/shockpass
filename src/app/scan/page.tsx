'use client'

import { Suspense, useCallback, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ScanCamera } from '@/components/ScanCamera'
import { ScanResultScreen } from '@/components/ScanResultScreen'
import { COPY } from '@/lib/copy'
import { trpc } from '@/trpc/client'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PassSkeleton } from '@/components/ui/Skeleton'
import { SectionLabel } from '@/components/ui/SectionLabel'

function ScanContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('event')
  const [manualQuery, setManualQuery] = useState('')
  const [scanToken, setScanToken] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [flash, setFlash] = useState(false)
  const [lastResult, setLastResult] = useState<{
    result: string
    ticket: {
      id: string
      attendeeName: string | null
      attendeeEmail: string | null
      tierName: string
      checkedInAt: Date | null
    } | null
  } | null>(null)

  const validate = trpc.scan.validate.useMutation({
    onSuccess: (data) => {
      setLastResult(data)
      if (data.result === 'VALID' || data.result === 'VIP' || data.result === 'GUESTLIST') {
        setFlash(true)
        setTimeout(() => setFlash(false), 400)
      }
    },
    onError: (e) => toast.error(e.message),
  })

  const manualCheckIn = trpc.scan.manualCheckIn.useMutation({
    onSuccess: () => { toast.success('Checked in'); setLastResult(null) },
    onError: (e) => toast.error(e.message),
  })

  const { data: searchResults } = trpc.scan.search.useQuery(
    { eventId: eventId || '', query: manualQuery },
    { enabled: manualQuery.length >= 2 && !!eventId && showSearch }
  )

  const submitScan = useCallback((value: string) => {
    const token = value.trim()
    if (!eventId || token.length < 5) return
    validate.mutate({ eventId, qrToken: token })
    setScanToken('')
  }, [eventId, validate])

  if (!eventId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
        <p className="mb-4 max-w-sm text-center font-display text-3xl tracking-tight text-muted">
          {COPY.scanNoEvent}
        </p>
        <Link href="/dashboard" className="focus-ring text-sm text-acid hover:underline font-sans">
          {COPY.commandCenter}
        </Link>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <div className="relative flex-1 overflow-hidden">
        <ScanCamera onScan={submitScan} active />

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-bg/35" />
          <div className="absolute inset-x-6 top-1/2 mx-auto aspect-square max-h-[58vh] -translate-y-1/2 rounded-pass border border-acid/40 shadow-[inset_0_0_80px_rgba(0,0,0,0.65)]">
            <span className="scan-bracket scan-bracket-tl" />
            <span className="scan-bracket scan-bracket-tr" />
            <span className="scan-bracket scan-bracket-bl" />
            <span className="scan-bracket scan-bracket-br" />
          </div>
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-bg to-transparent" />
        </div>

        <div className="absolute inset-x-6 top-6 flex items-center justify-between">
          <Link href="/dashboard" className="focus-ring rounded-drop text-sm text-muted transition-colors hover:text-text font-sans">
            {COPY.commandCenter}
          </Link>
          <span className="font-display text-sm uppercase tracking-wider text-acid">{COPY.doorScanner}</span>
        </div>

        <div className="absolute inset-x-6 bottom-[38%] text-center">
          <SectionLabel>Aim at QR code</SectionLabel>
        </div>
      </div>

      <div className="shrink-0 space-y-3 border-t border-border bg-bg/95 p-4 backdrop-blur-md">
        <div className="flex gap-2">
          <Input
            mono
            value={scanToken}
            placeholder="Paste token…"
            onChange={(e) => setScanToken(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submitScan(scanToken) }}
            className="flex-1"
            aria-label="QR token"
          />
          <Button onClick={() => submitScan(scanToken)} disabled={validate.isPending} className="!min-h-11 shrink-0">
            Scan
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="focus-ring w-full rounded-drop py-2 text-xs text-muted transition-colors hover:text-text font-sans"
        >
          {showSearch ? COPY.scanHideSearch : COPY.searchGuest}
        </button>

        {showSearch && (
          <div className="max-h-40 space-y-2 overflow-y-auto">
            <Input
              value={manualQuery}
              onChange={(e) => setManualQuery(e.target.value)}
              placeholder="Name or email…"
              aria-label="Search guest"
            />
            {searchResults?.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between rounded-drop border border-border bg-panel-2 p-3">
                <div>
                  <p className="text-sm font-medium font-sans">{ticket.attendeeName || 'Unnamed'}</p>
                  <p className="text-xs text-muted">{ticket.ticketTier.name}</p>
                </div>
                <Button
                  className="!min-h-9 !px-3 text-xs"
                  onClick={() => manualCheckIn.mutate({ eventId, ticketId: ticket.id })}
                >
                  Check in
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {lastResult && (
        <ScanResultScreen
          result={lastResult.result}
          ticket={lastResult.ticket ? {
            attendeeName: lastResult.ticket.attendeeName,
            tierName: lastResult.ticket.tierName,
            checkedInAt: lastResult.ticket.checkedInAt,
          } : null}
          onDismiss={() => setLastResult(null)}
          flash={flash}
        />
      )}
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg"><PassSkeleton /></div>}>
      <ScanContent />
    </Suspense>
  )
}
