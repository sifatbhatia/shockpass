import { cn } from '@/lib/cn'

type PanelProps = {
  children: React.ReactNode
  className?: string
  glow?: 'acid' | 'hot' | 'none'
  inset?: boolean
}

export function Panel({ children, className, glow = 'none', inset }: PanelProps) {
  return (
    <div
      className={cn(
        'rounded-pass border border-border bg-panel',
        inset && 'bg-panel-2/50',
        glow === 'acid' && 'shadow-glow-acid',
        glow === 'hot' && 'shadow-glow-hot',
        className
      )}
    >
      {children}
    </div>
  )
}
