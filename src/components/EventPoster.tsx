'use client'

import { useState } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { BRAND } from '@/lib/brand'
import { normalizePosterUrl } from '@/lib/poster-assets'

type EventPosterProps = {
  src?: string | null
  title: string
  className?: string
  priority?: boolean
}

export function EventPoster({ src, title, className, priority = false }: EventPosterProps) {
  const posterSrc = normalizePosterUrl(src)
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showPoster = Boolean(posterSrc && failedSrc !== posterSrc)

  return (
    <div className={clsx('relative h-full w-full overflow-hidden bg-panel-2', className)}>
      {showPoster && posterSrc ? (
        <Image
          src={posterSrc}
          alt={`${title} event poster`}
          fill
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setFailedSrc(posterSrc)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(215,255,63,0.16),transparent_30%),linear-gradient(135deg,#16161a,#050505_60%,#1f1230)]">
          <div className="px-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-acid/25 bg-acid/10">
              <span className="text-xl font-black text-acid">{BRAND.monogram}</span>
            </div>
            <p className="text-sm font-semibold text-text">{title}</p>
            <p className="mt-1 text-xs text-muted">Poster drop pending</p>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/70 to-transparent" />
    </div>
  )
}
