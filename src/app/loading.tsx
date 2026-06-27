import { AppShell } from '@/components/AppShell'
import { cn } from '@/lib/cn'

function Pulse({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-panel/60',
        className
      )}
    />
  )
}

export default function Loading() {
  return (
    <AppShell>
      <div className="min-h-[70vh]">
        {/* Hero skeleton */}
        <div className="relative -mt-[var(--nav-bar-height,4.5rem)] flex min-h-[min(70vh,600px)] items-center justify-center overflow-hidden bg-panel">
          <div className="flex flex-col items-center gap-4">
            <Pulse className="h-5 w-48 rounded-full" />
            <Pulse className="h-20 w-[500px] max-w-[80vw]" />
            <Pulse className="h-5 w-72" />
            <div className="mt-2 flex gap-3">
              <Pulse className="h-12 w-36 rounded-full" />
              <Pulse className="h-12 w-40 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* Events board skeleton */}
        <div className="mx-auto max-w-[1650px] px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <Pulse className="h-8 w-40" />
            <Pulse className="h-4 w-24" />
          </div>
          <div className="space-y-1 rounded-pass border border-border bg-panel/40 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Pulse className="h-10 w-10 rounded-full" />
                <Pulse className="h-4 flex-1" />
                <Pulse className="h-4 w-20" />
                <Pulse className="h-4 w-16" />
                <Pulse className="h-4 w-16" />
                <Pulse className="h-8 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
