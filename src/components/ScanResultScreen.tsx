import Image from 'next/image'
import { Button } from '@/components/ui/Button'
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

const RESULT_COPY: Record<string, { label: string; tone: string; bg: string }> = {
  VALID: { label: 'VALID', tone: 'text-success', bg: 'bg-success/10' },
  ALREADY_SCANNED: { label: 'ALREADY SCANNED', tone: 'text-danger', bg: 'bg-danger/10' },
  WRONG_EVENT: { label: 'WRONG EVENT', tone: 'text-muted', bg: 'bg-panel' },
  REFUNDED: { label: 'REFUNDED', tone: 'text-danger', bg: 'bg-danger/10' },
  VIP: { label: 'VIP', tone: 'text-electric', bg: 'bg-electric/10' },
  GUESTLIST: { label: 'GUESTLIST', tone: 'text-electric', bg: 'bg-electric/10' },
}

export function ScanResultScreen({ result, ticket, onDismiss, flash }: ScanResultScreenProps) {
  const meta = RESULT_COPY[result] || {
    label: result.replace('_', ' '),
    tone: 'text-muted',
    bg: 'bg-panel',
  }

  const isSuccess = result === 'VALID' || result === 'VIP' || result === 'GUESTLIST'

  return (
    <div
      className={cn(
        'fixed inset-0 z-[var(--z-modal)] flex flex-col items-center justify-center px-6 backdrop-blur-sm',
        meta.bg,
        flash && isSuccess && 'animate-scan-flash'
      )}
      role="dialog"
      aria-modal
      aria-labelledby="scan-result-label"
    >
      {isSuccess && (
        <div className="relative mb-5 aspect-video w-full max-w-xl overflow-hidden rounded-pass border border-success/25 shadow-panel">
          <Image
            src="/assets/scan-success-moment.png"
            alt=""
            fill
            sizes="(min-width: 768px) 560px, 90vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/45 via-transparent to-transparent" />
        </div>
      )}
      <p
        id="scan-result-label"
        className={cn('mb-4 text-center font-display text-6xl uppercase tracking-wider md:text-8xl', meta.tone)}
      >
        {meta.label}
      </p>
      {ticket && (
        <p className="font-mono text-lg text-text">
          {ticket.attendeeName || 'Guest'} · {ticket.tierName}
        </p>
      )}
      {result === 'ALREADY_SCANNED' && ticket?.checkedInAt && (
        <p className="mt-3 font-mono text-sm text-muted">
          First scan {new Date(ticket.checkedInAt).toLocaleTimeString()}
        </p>
      )}
      <Button variant="ghost" onClick={onDismiss} className="mt-12">
        Scan next
      </Button>
    </div>
  )
}
