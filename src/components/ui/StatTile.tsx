import { cn } from '@/lib/cn'
import { SectionLabel } from './SectionLabel'

type StatTileProps = {
  label: string
  value: string | number
  className?: string
  hot?: boolean
}

export function StatTile({ label, value, className, hot }: StatTileProps) {
  return (
    <div className={cn('rounded-pass border border-border bg-panel p-4', className)}>
      <SectionLabel>{label}</SectionLabel>
      <p className={cn('mt-1 font-mono text-2xl font-bold', hot && 'text-hot')}>{value}</p>
    </div>
  )
}
