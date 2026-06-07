'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { COPY } from '@/lib/copy'
import { Button } from '@/components/ui/Button'
import { DashboardShellSkeleton } from '@/components/ui/Skeleton'

export function useIsOrganizer() {
  const { data: session } = useSession()
  return session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'
}

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const hasOrganizerRole =
    session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth?tab=signup&callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [pathname, status, router])

  if (status === 'loading') {
    return <DashboardShellSkeleton />
  }

  if (status === 'unauthenticated') return null

  if (!hasOrganizerRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
        <div className="max-w-md w-full rounded-pass border border-border bg-panel p-6 text-center">
          <h1 className="font-display text-3xl tracking-tight mb-2">{COPY.commandCenterAccess}</h1>
          <p className="text-sm text-muted mb-6">
            Organizer tools are approval-based. Request access when you are ready to launch drops.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              href="/organizers"
            >
              See organizer plans
            </Button>
            <Button variant="ghost" href="/">
              {COPY.backHome}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
