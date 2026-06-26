import Image from 'next/image'
import { BRAND } from '@/lib/brand'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg">
      <div className="relative h-12 w-40 animate-pulse">
        <Image
          src="/brand/willcall-nav.png"
          alt={BRAND.name}
          fill
          className="object-contain"
          priority
          unoptimized
        />
      </div>
      <div className="mt-6 flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-nav-accent animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-nav-accent animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-nav-accent animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}
