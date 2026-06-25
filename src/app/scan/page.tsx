'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ScanPageContent } from '@/components/ScanPageContent'
import { PassSkeleton } from '@/components/ui/Skeleton'

function ScanContent() {
  const searchParams = useSearchParams()
  const eventId = searchParams.get('event') ?? ''

  return <ScanPageContent eventId={eventId} />
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-bg"><PassSkeleton /></div>}>
      <ScanContent />
    </Suspense>
  )
}
