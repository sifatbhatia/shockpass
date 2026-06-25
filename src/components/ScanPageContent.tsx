'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { ScanCamera, type CameraState, type ScanCameraHandle } from '@/components/ScanCamera'
import { ScanResultScreen } from '@/components/ScanResultScreen'
import { COPY } from '@/lib/copy'
import { trpc } from '@/trpc/client'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PassSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'
import { format } from 'date-fns'

type ScanPageContentProps = {
  eventId: string
}

type LastResult = {
  result: string
  ticket: {
    id: string
    attendeeName: string | null
    attendeeEmail: string | null
    tierName: string
    checkedInAt: Date | null
  } | null
} | null

export function ScanPageContent({ eventId }: ScanPageContentProps) {
  const cameraRef = useRef<ScanCameraHandle>(null)
  const [manualQuery, setManualQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [lastResult, setLastResult] = useState<LastResult>(null)
  const [flash, setFlash] = useState(false)
  const [cameraState, setCameraState] = useState<CameraState>('loading')
  const [paused, setPaused] = useState(false)
  const [torchOn, setTorchOn] = useState(false)
  const [torchSupported, setTorchSupported] = useState(false)

  // --- Event data ---
  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
  } = trpc.event.getById.useQuery({ id: eventId }, { enabled: !!eventId })

  // --- Scan logs (recent scans) ---
  const {
    data: scanLogsData,
    isLoading: logsLoading,
  } = trpc.scan.getScanLogs.useQuery(
    { eventId, limit: 20 },
    { enabled: !!eventId }
  )

  // --- Validate mutation ---
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

  // --- Manual check-in mutation ---
  const manualCheckIn = trpc.scan.manualCheckIn.useMutation({
    onSuccess: (data) => {
      toast.success('Checked in')
      setLastResult(null)
      setManualQuery('')
      // Set a synthetic result so the panel shows
      setLastResult({
        result: 'VALID',
        ticket: {
          id: data.ticket.id,
          attendeeName: data.ticket.attendeeName,
          attendeeEmail: data.ticket.attendeeEmail,
          tierName: data.ticket.ticketTier.name,
          checkedInAt: new Date(),
        },
      })
    },
    onError: (e) => toast.error(e.message),
  })

  // --- Search ---
  const { data: searchResults } = trpc.scan.search.useQuery(
    { eventId, query: manualQuery },
    { enabled: manualQuery.length >= 2 && !!eventId && showSearch }
  )

  // --- Scan submission ---
  const submitScan = useCallback(
    (value: string) => {
      const token = value.trim()
      if (!eventId || token.length < 5) return
      validate.mutate({ eventId, qrToken: token })
    },
    [eventId, validate]
  )

  // --- Camera controls ---
  const handleTogglePause = () => setPaused((p) => !p)
  const handleSwitchCamera = () => cameraRef.current?.switchCamera()
  const handleRetryCamera = () => {
    setPaused(false)
    cameraRef.current?.retry()
  }
  const handleToggleTorch = async () => {
    const next = await cameraRef.current?.toggleTorch()
    if (next !== undefined) setTorchOn(next)
  }

  // --- No event selected ---
  if (!eventId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
        <p className="mb-4 max-w-sm text-center font-display text-3xl tracking-tight text-muted">
          {COPY.scanNoEvent}
        </p>
        <Link
          href="/dashboard"
          className="focus-ring text-sm text-[#ff581a] hover:underline font-sans"
        >
          {COPY.commandCenter}
        </Link>
      </div>
    )
  }

  // --- Event loading / error ---
  if (eventLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <PassSkeleton />
      </div>
    )
  }

  if (eventError || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
        <p className="mb-2 text-center font-display text-2xl tracking-tight text-[#ef4444]">
          Could not load event
        </p>
        <p className="mb-6 max-w-sm text-center text-sm text-muted font-sans">
          Make sure you are signed in as the organizer of this event.
        </p>
        <Link
          href="/dashboard"
          className="focus-ring text-sm text-[#ff581a] hover:underline font-sans"
        >
          {COPY.commandCenter}
        </Link>
      </div>
    )
  }

  // --- Status colors from spec ---
  const cameraStatusColor = cameraState === 'ready' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
  const cameraStatusText =
    cameraState === 'ready'
      ? 'Camera ready'
      : cameraState === 'denied'
        ? 'Camera denied'
        : cameraState === 'unavailable'
          ? 'Camera unavailable'
          : 'Starting…'

  const recentScans = scanLogsData?.logs ?? []

  // --- Camera denied message ---
  const showManualFallback = cameraState === 'denied' || cameraState === 'unavailable'

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-bg">
      {/* ===== Event Header ===== */}
      <header className="sticky top-0 z-10 border-b border-border bg-bg/90 px-4 pb-3 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className="focus-ring rounded-drop text-xs text-muted transition-colors hover:text-text font-sans"
          >
            &larr; {COPY.commandCenter}
          </Link>
          <Link
            href="/scan"
            className="font-display text-xs uppercase tracking-wider text-[#ff581a]"
          >
            {COPY.doorScanner}
          </Link>
        </div>

        <div className="mt-2">
          <h1 className="text-lg font-semibold text-text font-sans">{event.title}</h1>
          <p className="mt-0.5 text-sm text-muted font-sans">
            {event.venueName}
            {event.startsAt && (
              <>
                <span className="mx-1.5 text-muted-deep">&middot;</span>
                {format(new Date(event.startsAt), 'MMM d · h:mm a')}
              </>
            )}
          </p>
        </div>

        {/* Camera status pill */}
        <div className="mt-2 flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${cameraStatusColor} ${cameraState === 'ready' ? 'animate-pulse' : ''}`} />
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted font-sans">
            {cameraStatusText}
          </span>
        </div>
      </header>

      {/* ===== Scanner + Controls ===== */}
      <div className="space-y-3 p-4">
        {/* Camera viewport with scan frame */}
        <ScanCamera
          ref={cameraRef}
          onScan={submitScan}
          active
          paused={paused}
          onStateChange={setCameraState}
          onTorchSupported={setTorchSupported}
        />

        {/* Manual fallback message */}
        {showManualFallback && (
          <div className="rounded-drop border border-[#ef4444]/20 bg-[#ef4444]/5 px-4 py-3">
            <p className="text-sm font-medium text-[#ef4444] font-sans">Camera unavailable</p>
            <p className="mt-0.5 text-xs text-muted font-sans">
              Search for guests by name, email, order, or QR token below.
            </p>
          </div>
        )}

        {/* Search input */}
        <div className="flex gap-2">
          <Input
            value={manualQuery}
            placeholder="Search guest, email, order, or token."
            onChange={(e) => setManualQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            className="flex-1"
            aria-label="Search guest"
          />
          <Button
            variant="hot"
            onClick={() => submitScan(manualQuery)}
            disabled={validate.isPending || manualQuery.length < 5}
            className="!min-h-11 shrink-0"
          >
            Scan
          </Button>
        </div>

        {/* Camera controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleRetryCamera}
            disabled={cameraState === 'loading'}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel-2 text-muted transition-colors hover:text-text disabled:opacity-40"
            title="Retry camera"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleSwitchCamera}
            disabled={cameraState !== 'ready'}
            className="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-border bg-panel-2 text-muted transition-colors hover:text-text disabled:opacity-40"
            title="Switch camera"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4.5 7 8l4 3.5" />
              <path d="M20 12a6 6 0 0 1-6 6H8" />
              <path d="M13 19.5 17 16l-4-3.5" />
              <path d="M4 12a6 6 0 0 1 6-6h6" />
            </svg>
          </button>

          {torchSupported && (
            <button
              type="button"
              onClick={handleToggleTorch}
              disabled={cameraState !== 'ready'}
              className={cn(
                'focus-ring flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:opacity-40',
                torchOn
                  ? 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]'
                  : 'border-border bg-panel-2 text-muted hover:text-text'
              )}
              title={torchOn ? 'Flashlight on' : 'Flashlight off'}
            >
              {torchOn ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                  <path d="M13 2v2" />
                  <path d="M18.4 5.6l1.4-1.4" />
                  <path d="M22 11h-2" />
                  <path d="M4 11H2" />
                  <path d="M5.6 5.6L4.2 4.2" />
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2v2" />
                  <path d="M18.4 5.6l1.4-1.4" />
                  <path d="M22 11h-2" />
                  <path d="M3 11H1" />
                  <path d="M5.6 5.6L4.2 4.2" />
                  <circle cx="12" cy="16" r="5" />
                  <path d="M12 21v2" />
                </svg>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleTogglePause}
            disabled={cameraState !== 'ready'}
            className={cn(
              'focus-ring flex h-10 w-10 items-center justify-center rounded-full border transition-colors disabled:opacity-40',
              paused
                ? 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]'
                : 'border-border bg-panel-2 text-muted hover:text-text'
            )}
            title={paused ? 'Resume scanning' : 'Pause scanning'}
          >
            {paused ? (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            )}
          </button>
        </div>

        {/* Manual search results */}
        {showSearch && searchResults && searchResults.length > 0 && (
          <div className="max-h-48 space-y-2 overflow-y-auto">
            <p className="text-xs font-medium uppercase tracking-wider text-muted font-sans">
              Guest results ({searchResults.length})
            </p>
            {searchResults.map((ticket: any) => (
              <div
                key={ticket.id}
                className="flex items-center justify-between rounded-drop border border-border bg-panel-2 p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-text font-sans">
                    {ticket.attendeeName || 'Unnamed'}
                  </p>
                  <p className="truncate text-xs text-muted font-sans">
                    {ticket.ticketTier?.name ?? '—'}
                  </p>
                </div>
                <Button
                  className="!min-h-9 !px-3 text-xs shrink-0 ml-2"
                  variant="hot"
                  onClick={() => manualCheckIn.mutate({ eventId, ticketId: ticket.id })}
                  disabled={manualCheckIn.isPending}
                >
                  Check in
                </Button>
              </div>
            ))}
          </div>
        )}

        {showSearch && searchResults && searchResults.length === 0 && manualQuery.length >= 2 && (
          <p className="py-2 text-center text-xs text-muted font-sans">No guests found</p>
        )}
      </div>

      {/* ===== Recent Scans ===== */}
      <div className="border-t border-border px-4 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted font-sans">
            Recent scans{recentScans.length > 0 ? ` (${recentScans.length})` : ''}
          </h2>
          {logsLoading && <span className="text-xs text-muted font-sans">Loading…</span>}
        </div>

        {!logsLoading && recentScans.length === 0 && (
          <p className="mt-3 text-center text-xs text-muted/50 font-sans">
            No scans yet. Point the camera at a QR code or search for a guest.
          </p>
        )}

        {recentScans.length > 0 && (
          <div className="mt-3 space-y-1.5">
            {recentScans.slice(0, 10).map((log: any) => {
              const scanColor =
                log.result === 'VALID' || log.result === 'VIP' || log.result === 'GUESTLIST'
                  ? 'text-[#22c55e]'
                  : log.result === 'ALREADY_SCANNED'
                    ? 'text-[#f59e0b]'
                    : 'text-[#ef4444]'

              const scanLabel =
                log.result === 'VALID'
                  ? 'Checked in'
                  : log.result === 'VIP'
                    ? 'VIP'
                    : log.result === 'GUESTLIST'
                      ? 'Guest list'
                      : log.result === 'ALREADY_SCANNED'
                        ? 'Already in'
                        : log.result === 'WRONG_EVENT'
                          ? 'Wrong event'
                          : log.result === 'REFUNDED'
                            ? 'Refunded'
                            : log.result

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-drop border border-border bg-panel px-3 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text font-sans">
                      {log.ticket?.attendeeName || 'Unknown'}
                    </p>
                    <p className="truncate text-xs text-muted font-sans">
                      {log.ticket?.ticketTier?.name ?? '—'}
                    </p>
                  </div>
                  <div className="ml-3 text-right shrink-0">
                    <p className={`text-xs font-medium font-sans ${scanColor}`}>{scanLabel}</p>
                    <p className="text-[11px] text-muted/50 font-sans">
                      {format(new Date(log.scannedAt), 'h:mm a')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ===== Scan Result Drawer ===== */}
      {lastResult && (
        <ScanResultScreen
          result={lastResult.result}
          ticket={
            lastResult.ticket
              ? {
                  attendeeName: lastResult.ticket.attendeeName,
                  tierName: lastResult.ticket.tierName,
                  checkedInAt: lastResult.ticket.checkedInAt,
                }
              : null
          }
          onDismiss={() => setLastResult(null)}
          flash={flash}
        />
      )}
    </div>
  )
}

