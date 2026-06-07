import { cn } from '@/lib/cn'

export function PassSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex overflow-hidden rounded-pass border border-border bg-panel', className)}>
      <div className="aspect-[3/4] w-24 shrink-0 skeleton-shimmer md:w-32" />
      <div className="flex-1 space-y-3 p-5">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-3 w-1/2 rounded skeleton-shimmer" />
        <div className="h-3 w-1/3 rounded skeleton-shimmer" />
      </div>
    </div>
  )
}

export function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-pass border border-border', className)}>
      <div className="aspect-[4/3] skeleton-shimmer" />
      <div className="space-y-3 bg-panel p-5">
        <div className="h-5 w-3/4 rounded skeleton-shimmer" />
        <div className="h-4 w-1/2 rounded skeleton-shimmer" />
        <div className="h-1.5 w-full rounded-full skeleton-shimmer" />
      </div>
    </div>
  )
}

export function EventPageSkeleton() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="relative min-h-[65vh] skeleton-shimmer">
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg to-transparent p-6 pt-32">
          <div className="mx-auto max-w-[1650px] space-y-4">
            <div className="h-6 w-24 rounded-full skeleton-shimmer bg-panel-2/50" />
            <div className="h-16 w-2/3 max-w-xl rounded skeleton-shimmer bg-panel-2/50" />
            <div className="h-4 w-1/2 rounded skeleton-shimmer bg-panel-2/50" />
          </div>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1650px] gap-10 px-6 py-12 md:grid-cols-5">
        <div className="space-y-6 md:col-span-3">
          <div className="h-8 w-32 rounded skeleton-shimmer" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded skeleton-shimmer" style={{ width: `${90 - i * 12}%` }} />
            ))}
          </div>
        </div>
        <div className="h-96 rounded-pass border border-border skeleton-shimmer md:col-span-2" />
      </div>
    </div>
  )
}

export function DashboardShellSkeleton() {
  return (
    <div className="min-h-screen bg-bg px-6 py-10">
      <div className="mx-auto max-w-[1650px] space-y-8">
        <div className="space-y-3">
          <div className="h-10 w-64 rounded skeleton-shimmer" />
          <div className="h-4 w-96 max-w-full rounded skeleton-shimmer" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-pass border border-border skeleton-shimmer" />
          ))}
        </div>
        <div className="h-64 rounded-pass border border-border skeleton-shimmer" />
      </div>
    </div>
  )
}
