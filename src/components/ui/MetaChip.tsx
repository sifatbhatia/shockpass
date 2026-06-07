import { cn } from '@/lib/cn'

type MetaChipProps = {
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}

export function MetaChip({ children, icon, className }: MetaChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-panel/80 px-3.5 py-1.5',
        'text-xs font-medium text-muted backdrop-blur-sm font-sans',
        className
      )}
    >
      {icon}
      {children}
    </span>
  )
}
