'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'
import { Button } from '@/components/ui/Button'
import { DashboardShellSkeleton } from '@/components/ui/Skeleton'

export function useIsOrganizer() {
  const { data: session } = useSession()
  return session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'
}

export function DashboardGate({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const ensureOrganizer = trpc.user.ensureOrganizer.useMutation()
  const [promoteError, setPromoteError] = useState<string | null>(null)
  const [promoting, setPromoting] = useState(false)
  const [promoted, setPromoted] = useState(false)
  const hasOrganizerRole =
    session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth?tab=signup&callbackUrl=${encodeURIComponent(pathname)}`)
    }
  }, [pathname, status, router])

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) return
    if (hasOrganizerRole) return
    if (promoted) return

    let cancelled = false
    queueMicrotask(() => {
      setPromoting(true)
      setPromoteError(null)
    })

    ensureOrganizer
      .mutateAsync()
      .then(async () => {
        if (cancelled) return
        await update()
        setPromoted(true)
      })
      .catch((err) => {
        if (cancelled) return
        setPromoteError(err instanceof Error ? err.message : COPY.organizerAccessFailed)
      })
      .finally(() => {
        if (!cancelled) setPromoting(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.user?.id, hasOrganizerRole, promoted])

  if (status === 'loading' || promoting) {
    return <DashboardShellSkeleton />
  }

  if (status === 'unauthenticated') return null

  const isOrganizer =
    promoted ||
    hasOrganizerRole

  if (promoteError || !isOrganizer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-bg">
        <div className="max-w-md w-full rounded-pass border border-border bg-panel p-6 text-center">
          <h1 className="font-display text-3xl tracking-tight mb-2">{COPY.commandCenterAccess}</h1>
          <p className="text-sm text-muted mb-6">{promoteError || COPY.organizerAccessFailed}</p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => {
                setPromoteError(null)
                setPromoting(true)
                ensureOrganizer
                  .mutateAsync()
                  .then(() => update())
                  .catch((err) => setPromoteError(err instanceof Error ? err.message : COPY.organizerAccessFailed))
                  .finally(() => setPromoting(false))
              }}
            >
              {COPY.tryAgain}
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
