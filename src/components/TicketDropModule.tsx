'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { QuantityStepper } from '@/components/ui/QuantityStepper'
import { HypeMeter } from '@/components/drop/HypeMeter'
import { CountdownTimer } from '@/components/drop/CountdownTimer'
import { TierLadder } from '@/components/drop/TierLadder'
import { DropStatePill } from '@/components/drop/DropStatePill'

type Tier = {
  id: string
  name: string
  description: string | null
  priceCents: number
  quantityTotal: number
  quantitySold: number
  status: string
  salesStartAt: Date | null
  salesEndAt: Date | null
}

type TicketDropModuleProps = {
  eventId: string
  eventSlug: string
  eventTitle: string
  tiers: Tier[]
  totalCapacity: number
  totalSold: number
}

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

export function TicketDropModule({
  eventId,
  eventSlug,
  eventTitle,
  tiers,
  totalCapacity,
  totalSold,
}: TicketDropModuleProps) {
  const defaultTierId = tiers.find((t) => t.status === 'ON_SALE')?.id ?? null
  const [selectedTier, setSelectedTier] = useState<string | null>(defaultTierId)
  const [quantity, setQuantity] = useState(1)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [copied, setCopied] = useState(false)

  const joinWaitlist = trpc.waitlist.join.useMutation({
    onSuccess: (data) => {
      toast.success(data.alreadyJoined ? 'Already on waitlist' : `Waitlist spot #${data.entry.position}`)
    },
    onError: (e) => toast.error(e.message),
  })

  const shareDrop = useCallback(async () => {
    const url = `${window.location.origin}/events/${eventSlug}`
    const title = COPY.shareDropTitle(eventTitle)
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Copy blocked by this browser. Use the address bar link.')
    }
  }, [eventSlug, eventTitle])

  const isOnSale = tiers.some((t) => t.status === 'ON_SALE')
  const nextSaleStart = tiers
    .map((t) => t.salesStartAt)
    .filter(Boolean)
    .sort((a, b) => new Date(a!).getTime() - new Date(b!).getTime())[0]

  const overallState =
    totalSold >= totalCapacity
      ? 'sold_out'
      : totalSold / Math.max(1, totalCapacity) >= 0.9
        ? 'almost_sold_out'
        : isOnSale
          ? 'on_sale'
          : 'before_sale'

  const selectedTierData = tiers.find((t) => t.id === selectedTier)
  const selectedAvailable = selectedTierData
    ? selectedTierData.quantityTotal - selectedTierData.quantitySold
    : 0
  const maxQty = Math.min(10, selectedAvailable > 0 ? selectedAvailable : 1)

  // Reset quantity to 1 when tier changes
  const handleTierSelect = useCallback((tierId: string | null) => {
    setSelectedTier(tierId)
    setQuantity(1)
  }, [])

  const isCheckoutDisabled =
    !selectedTier || !selectedTierData || selectedTierData.status === 'SOLD_OUT' || selectedAvailable <= 0

  const dropContent = (
    <>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <SectionLabel>Tickets</SectionLabel>
          <p className="font-display text-3xl tracking-tight leading-none mt-1">The drop</p>
        </div>
        <DropStatePill state={overallState} />
      </div>

      {overallState === 'sold_out' && (
        <div className="mb-6 rounded-pass border border-hot/30 bg-hot/5 p-4 text-center">
          <p className="font-display text-lg text-hot tracking-tight">Sold out</p>
          <p className="mt-1 text-xs text-muted font-sans">All tickets have been claimed for this drop.</p>
        </div>
      )}

      {overallState === 'before_sale' && !isOnSale && nextSaleStart && (
        <div className="mb-6 rounded-pass border border-electric/25 bg-electric/5 p-4">
          <SectionLabel className="mb-2">{COPY.ticketsUnlock}</SectionLabel>
          <CountdownTimer target={nextSaleStart} />
        </div>
      )}

      {totalCapacity > 0 && <HypeMeter sold={totalSold} capacity={totalCapacity} className="mb-6" />}

      <TierLadder tiers={tiers} selectedTier={selectedTier} onSelect={handleTierSelect} />

      {tiers.some((t) => t.status === 'SOLD_OUT' || (t.salesStartAt && new Date(t.salesStartAt) > new Date())) && (
        <div className="mt-5 flex gap-2">
          <Input
            type="email"
            value={waitlistEmail}
            onChange={(e) => setWaitlistEmail(e.target.value)}
            placeholder={COPY.waitlistEmail}
            className="flex-1 text-xs"
            aria-label="Waitlist email"
          />
          <Button
            variant="outline"
            className="shrink-0 !min-h-10 !px-3 text-xs"
            onClick={() => joinWaitlist.mutate({ eventId, email: waitlistEmail })}
            disabled={!waitlistEmail || joinWaitlist.isPending}
          >
            {COPY.joinWaitlist}
          </Button>
        </div>
      )}

      {selectedTier && selectedTierData && (
        <div className="mt-6 space-y-4 animate-fade-up">
          <div className="flex items-center justify-between rounded-pass border border-acid/30 bg-acid/5 px-4 py-3">
            <div className="min-w-0">
              <span className="text-sm font-semibold font-sans">{selectedTierData.name}</span>
              {selectedTierData.description && (
                <p className="mt-0.5 text-xs text-muted font-sans truncate">{selectedTierData.description}</p>
              )}
            </div>
            <span className="font-mono text-lg font-bold text-acid shrink-0 ml-3">
              {formatPrice(selectedTierData.priceCents * quantity)}
            </span>
          </div>

          <QuantityStepper
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={maxQty}
          />

          {isCheckoutDisabled ? (
            <Button disabled className="w-full">
              {selectedTierData.status === 'SOLD_OUT' || selectedAvailable <= 0
                ? COPY.soldOut
                : COPY.getTickets}
            </Button>
          ) : (
            <Button
              href={`/events/${eventSlug}/checkout?tier=${selectedTier}&qty=${quantity}`}
              className="w-full"
            >
              {COPY.getTickets}
            </Button>
          )}
        </div>
      )}

      <Button
        variant="ghost"
        className="mt-5 w-full"
        onClick={shareDrop}
      >
        {copied ? 'Copied!' : COPY.shareDrop}
      </Button>

      <p className="mt-4 border-t border-border pt-4 text-xs text-muted font-sans">{COPY.secureCheckout}</p>
    </>
  )

  return (
    <>
      <Panel glow={isOnSale ? 'acid' : 'none'} className="sticky top-[72px] hidden p-6 shadow-panel md:block">
        {dropContent}
      </Panel>

      <Panel glow={isOnSale ? 'acid' : 'none'} className="p-5 shadow-panel md:hidden">
        {dropContent}
      </Panel>
    </>
  )
}
