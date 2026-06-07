import { COPY } from '@/lib/copy'
import { SellThroughBar } from '@/components/SellThroughBar'

type HypeMeterProps = {
  sold: number
  capacity: number
  className?: string
}

export function HypeMeter({ sold, capacity, className }: HypeMeterProps) {
  const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0
  const sellingFast = percent >= 50 && percent < 95

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted">Demand</span>
        {sellingFast && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-hot">
            <span className="h-1.5 w-1.5 rounded-full bg-hot animate-live-pulse" />
            {COPY.sellingFast}
          </span>
        )}
      </div>
      <SellThroughBar sold={sold} capacity={capacity} />
    </div>
  )
}
