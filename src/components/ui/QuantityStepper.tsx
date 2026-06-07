import { cn } from '@/lib/cn'

type QuantityStepperProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  className?: string
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 10,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-pass border border-border bg-panel-2 p-2',
        className
      )}
      role="group"
      aria-label="Ticket quantity"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-drop border border-border text-lg font-sans transition-colors hover:bg-panel disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="min-w-[2ch] text-center font-mono text-lg font-semibold" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-drop border border-border text-lg font-sans transition-colors hover:bg-panel disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
