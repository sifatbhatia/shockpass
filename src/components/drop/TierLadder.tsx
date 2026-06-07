'use client'

import { format } from 'date-fns'
import { cn } from '@/lib/cn'
import { COPY } from '@/lib/copy'
import { DropStatePill, type DropState } from './DropStatePill'

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

function tierSaleState(tier: Tier, available: number): DropState {
  const now = new Date()
  if (tier.status === 'SOLD_OUT' || available <= 0) return 'sold_out'
  if (tier.status === 'LOCKED') return 'locked'
  if (tier.salesEndAt && tier.salesEndAt < now) return 'ended'
  if (tier.salesStartAt && tier.salesStartAt > now) return 'before_sale'
  if (available <= Math.max(3, Math.floor(tier.quantityTotal * 0.05))) return 'almost_sold_out'
  if (tier.status === 'ON_SALE') return 'on_sale'
  return 'before_sale'
}

type TierLadderProps = {
  tiers: Tier[]
  selectedTier: string | null
  onSelect: (tierId: string | null) => void
  className?: string
}

const RAIL_COLOR: Record<DropState, string> = {
  on_sale: 'bg-acid',
  almost_sold_out: 'bg-hot',
  sold_out: 'bg-hot/40',
  before_sale: 'bg-electric/50',
  locked: 'bg-border',
  ended: 'bg-border',
}

export function TierLadder({ tiers, selectedTier, onSelect, className }: TierLadderProps) {
  return (
    <div className={cn('space-y-3', className)} role="listbox" aria-label="Ticket tiers">
      {tiers.map((tier, index) => {
        const available = tier.quantityTotal - tier.quantitySold
        const state = tierSaleState(tier, available)
        const selectable = state === 'on_sale' || state === 'almost_sold_out'
        const isSelected = selectedTier === tier.id
        const isLast = index === tiers.length - 1

        return (
          <div key={tier.id} className="relative flex gap-3">
            <div className="flex flex-col items-center pt-5">
              <div
                className={cn(
                  'h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-offset-2 ring-offset-panel',
                  state === 'on_sale' || state === 'almost_sold_out'
                    ? 'bg-acid ring-acid/30'
                    : state === 'sold_out'
                      ? 'bg-hot ring-hot/30'
                      : 'bg-panel-2 ring-border'
                )}
              />
              {!isLast && (
                <div className={cn('mt-1 w-0.5 flex-1 min-h-[16px] rounded-full', RAIL_COLOR[state])} />
              )}
            </div>

            <button
              type="button"
              role="option"
              aria-selected={isSelected}
              disabled={!selectable}
              onClick={() => onSelect(isSelected ? null : tier.id)}
              className={cn(
                'focus-ring mb-0 flex-1 rounded-pass border p-4 text-left transition-[border-color,transform,box-shadow] duration-150',
                !selectable && 'cursor-not-allowed opacity-55',
                selectable && !isSelected && 'hover:border-white/20 hover:-translate-y-px',
                isSelected
                  ? 'border-acid bg-acid/5 shadow-glow-acid'
                  : 'border-border bg-panel-2/50'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold font-sans text-sm">{tier.name}</p>
                  {tier.description && (
                    <p className="mt-0.5 text-xs leading-relaxed text-muted font-sans">{tier.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-base font-bold">${(tier.priceCents / 100).toFixed(0)}</p>
                  <DropStatePill state={state} className="mt-1.5 scale-[0.85] origin-top-right" />
                </div>
              </div>

              {state === 'before_sale' && tier.salesStartAt && (
                <p className="mt-2 text-xs text-electric font-sans">
                  {COPY.ticketsUnlock} {format(new Date(tier.salesStartAt), 'MMM d · h:mm a')}
                </p>
              )}
              {(state === 'on_sale' || state === 'almost_sold_out') && (
                <div className="mt-3">
                  <div className="h-1 overflow-hidden rounded-full bg-bg/80">
                    <div
                      className={cn('h-full rounded-full', state === 'almost_sold_out' ? 'bg-hot' : 'bg-acid')}
                      style={{
                        width: `${Math.min(100, (tier.quantitySold / tier.quantityTotal) * 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 font-mono text-[10px] text-muted">
                    {available} left · {tier.quantitySold}/{tier.quantityTotal}
                  </p>
                </div>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}

export { tierSaleState }
