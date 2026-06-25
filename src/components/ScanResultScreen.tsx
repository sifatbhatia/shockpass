'use client'

import { useEffect, useCallback, useRef } from 'react'
import { cn } from '@/lib/cn'

type ScanResultScreenProps = {
  result: string
  ticket?: {
    attendeeName: string | null
    tierName: string
    checkedInAt: Date | null
  } | null
  onDismiss: () => void
  flash?: boolean
}

type ResultMeta = {
  label: string
  color: string // Tailwind arbitrary color
  bg: string
  icon: 'check' | 'warning' | 'x'
}

function getMeta(result: string): ResultMeta {
  switch (result) {
    case 'VALID':
    case 'VIP':
    case 'GUESTLIST':
      return {
        label: result === 'VIP' ? 'VIP' : result === 'GUESTLIST' ? 'Guest List' : 'Checked In',
        color: 'text-[#22c55e]',
        bg: 'bg-[#22c55e]/10',
        icon: 'check',
      }
    case 'ALREADY_SCANNED':
      return {
        label: 'Already Checked In',
        color: 'text-[#f59e0b]',
        bg: 'bg-[#f59e0b]/10',
        icon: 'warning',
      }
    case 'WRONG_EVENT':
      return {
        label: 'Wrong Event',
        color: 'text-[#ef4444]',
        bg: 'bg-[#ef4444]/10',
        icon: 'x',
      }
    case 'REFUNDED':
      return {
        label: 'Refunded / Invalid',
        color: 'text-[#ef4444]',
        bg: 'bg-[#ef4444]/10',
        icon: 'x',
      }
    default:
      return {
        label: result.replace(/_/g, ' '),
        color: 'text-[#ef4444]',
        bg: 'bg-[#ef4444]/10',
        icon: 'x',
      }
  }
}

function StatusIcon({ type, className }: { type: ResultMeta['icon']; className?: string }) {
  if (type === 'check') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }
  if (type === 'warning') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  )
}

export function ScanResultScreen({ result, ticket, onDismiss, flash }: ScanResultScreenProps) {
  const meta = getMeta(result)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSuccess = result === 'VALID' || result === 'VIP' || result === 'GUESTLIST'

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    onDismiss()
  }, [onDismiss])

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, 5000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [dismiss])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-[var(--z-modal)] animate-slide-up',
        flash && isSuccess && 'animate-scan-flash'
      )}
      role="dialog"
      aria-modal
      aria-labelledby="scan-result-label"
    >
      <div className={cn('rounded-t-2xl border border-border/60 p-5 pb-8 shadow-sheet backdrop-blur-xl', meta.bg)}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20" />

        <div className="flex items-start gap-4">
          <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', meta.bg)}>
            <StatusIcon type={meta.icon} className={cn('h-6 w-6', meta.color)} />
          </div>

          <div className="min-w-0 flex-1">
            <p id="scan-result-label" className={cn('text-lg font-semibold font-sans', meta.color)}>
              {meta.label}
            </p>

            {ticket && (
              <>
                <p className="mt-1 text-base text-text font-sans">
                  {ticket.attendeeName || 'Guest'}
                </p>
                <p className="text-sm text-muted font-sans">{ticket.tierName}</p>
              </>
            )}

            {result === 'ALREADY_SCANNED' && ticket?.checkedInAt && (
              <p className="mt-1 text-xs text-muted font-sans">
                First scanned at {new Date(ticket.checkedInAt).toLocaleTimeString()}
              </p>
            )}

            <p className="mt-1 text-xs text-muted/60 font-sans">
              {new Date().toLocaleTimeString()}
            </p>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-panel-2 text-muted transition-colors hover:text-text focus-ring"
            aria-label="Dismiss"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-3 text-center text-[11px] text-muted/40 font-sans">
          Auto-dismissing in 5s · Tap to keep
        </p>
      </div>
    </div>
  )
}
