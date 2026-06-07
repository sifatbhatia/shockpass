import { cn } from '@/lib/cn'
import { COPY } from '@/lib/copy'

type DropState = 'before_sale' | 'on_sale' | 'almost_sold_out' | 'sold_out' | 'locked' | 'ended'

const STATE_STYLES: Record<DropState, string> = {
  before_sale: 'border-electric/40 bg-electric/10 text-electric',
  on_sale: 'border-success/40 bg-success/10 text-success',
  almost_sold_out: 'border-hot/50 bg-hot/10 text-hot',
  sold_out: 'border-hot/40 bg-hot/5 text-hot',
  locked: 'border-border bg-panel-2 text-muted',
  ended: 'border-border bg-panel-2 text-muted',
}

const STATE_LABELS: Record<DropState, string> = {
  before_sale: COPY.beforeSale,
  on_sale: COPY.onSaleNow,
  almost_sold_out: COPY.almostGone,
  sold_out: COPY.soldOut,
  locked: 'Locked',
  ended: COPY.saleEnded,
}

export function DropStatePill({ state, className }: { state: DropState; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider font-sans',
        STATE_STYLES[state],
        className
      )}
    >
      {(state === 'on_sale' || state === 'almost_sold_out') && (
        <span className="h-1.5 w-1.5 rounded-full bg-current animate-live-pulse" />
      )}
      {STATE_LABELS[state]}
    </span>
  )
}

export type { DropState }
