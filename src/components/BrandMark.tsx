import Link from 'next/link'
import Image from 'next/image'
import { BRAND } from '@/lib/brand'
import { cn } from '@/lib/cn'

type BrandMarkProps = {
  href?: string
  className?: string
  showPulse?: boolean
  /** Icon-only mark for pill nav */
  variant?: 'default' | 'nav'
  size?: 'sm' | 'md' | 'lg'
}

const SIZE = {
  sm: { className: 'h-9 w-9', px: 36, src: BRAND.logo.nav },
  md: { className: 'h-10 w-10', px: 40, src: BRAND.logo.nav },
  lg: { className: 'h-11 w-11', px: 44, src: BRAND.logo.mark },
} as const

export function BrandMark({
  href = '/',
  className,
  showPulse,
  variant = 'default',
  size = 'md',
}: BrandMarkProps) {
  const spec = SIZE[size]
  const src = variant === 'nav' ? BRAND.logo.nav : BRAND.logo.mark

  const logo = (
    <span className={cn('relative inline-flex shrink-0', spec.className, className)}>
      <Image
        src={src}
        alt=""
        width={spec.px}
        height={spec.px}
        unoptimized
        loading={variant === 'nav' ? 'eager' : 'lazy'}
        fetchPriority={variant === 'nav' ? 'high' : 'auto'}
        className={cn('h-full w-full object-contain', spec.className)}
      />
      {showPulse && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-nav-accent animate-live-pulse ring-2 ring-bg" />
      )}
    </span>
  )

  if (variant === 'nav') {
    return (
      <Link href={href} className="inline-flex focus-ring rounded-full" aria-label={BRAND.name}>
        {logo}
      </Link>
    )
  }

  return (
    <Link
      href={href}
      className={cn('inline-flex items-center gap-2.5 group focus-ring rounded-full min-h-11', className)}
    >
      {logo}
      <span className="font-display text-xl tracking-tight text-text group-hover:text-acid transition-colors sm:text-2xl">
        {BRAND.name}
      </span>
    </Link>
  )
}
