import { cn } from '@/lib/cn'

type Step = {
  id: string
  label: string
}

type StepIndicatorProps = {
  steps: Step[]
  current: string
  className?: string
}

export function StepIndicator({ steps, current, className }: StepIndicatorProps) {
  const currentIndex = steps.findIndex((s) => s.id === current)

  return (
    <ol className={cn('flex items-center gap-0', className)} aria-label="Checkout progress">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex
        const isCurrent = step.id === current

        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold font-sans transition-colors',
                  isCurrent && 'bg-acid text-bg shadow-glow-acid',
                  isComplete && 'bg-acid/20 text-acid border border-acid/40',
                  !isCurrent && !isComplete && 'bg-panel-2 text-muted border border-border'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isComplete ? '✓' : index + 1}
              </span>
              <span
                className={cn(
                  'hidden text-[10px] font-medium uppercase tracking-wider sm:block font-sans',
                  isCurrent ? 'text-text' : 'text-muted'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-px flex-1 min-w-[24px] transition-colors',
                  index < currentIndex ? 'bg-acid/50' : 'bg-border'
                )}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
