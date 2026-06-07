import { cn } from '@/lib/cn'

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn('text-xs font-medium uppercase tracking-[0.18em] text-muted', className)}>
      {children}
    </p>
  )
}
