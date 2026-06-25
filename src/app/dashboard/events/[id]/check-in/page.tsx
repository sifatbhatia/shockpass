'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ScanPageContent } from '@/components/ScanPageContent'

export default function CheckInPage() {
  const params = useParams()
  const eventId = params?.id as string

  if (!eventId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6">
        <p className="mb-4 max-w-sm text-center font-display text-3xl tracking-tight text-muted">
          Event not found
        </p>
        <Link
          href="/dashboard"
          className="focus-ring text-sm text-[#ff581a] hover:underline font-sans"
        >
          Organizer hub
        </Link>
      </div>
    )
  }

  return <ScanPageContent eventId={eventId} />
}
