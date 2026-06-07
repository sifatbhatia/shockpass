import { cn } from '@/lib/cn'

type SellThroughBarProps = {
  sold: number
  capacity: number
  className?: string
  compact?: boolean
}

export function SellThroughBar({ sold, capacity, className, compact }: SellThroughBarProps) {
  const percent = capacity > 0 ? Math.round((sold / capacity) * 100) : 0
  const hot = percent >= 75
  const critical = percent >= 90

  return (
    <div className={className}>
      {!compact && (
        <div className="mb-1.5 flex justify-between text-xs text-muted font-sans">
          <span className="font-mono">{sold.toLocaleString()} / {capacity.toLocaleString()}</span>
          <span className={cn(hot && 'font-semibold', hot ? 'text-hot' : '')}>{percent}%</span>
        </div>
      )}
      <div className="relative h-2 overflow-hidden rounded-full bg-panel-2">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-700 ease-out',
            critical ? 'bg-gradient-to-r from-hot to-hot/80 shadow-glow-hot' : hot ? 'bg-hot' : 'bg-gradient-to-r from-acid-dim to-acid'
          )}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
        {hot && !critical && (
          <div
            className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white/20 to-transparent"
            style={{ left: `${Math.max(0, percent - 8)}%` }}
          />
        )}
      </div>
    </div>
  )
}
