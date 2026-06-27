'use client'

import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <AppShell>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-4xl tracking-tight text-text sm:text-5xl">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted font-sans">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button onClick={() => reset()}>
            Try again
          </Button>
          <Link
            href="/"
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-text hover:underline font-sans focus-ring rounded"
          >
            Back to home
          </Link>
        </div>
      </div>
    </AppShell>
  )
}
