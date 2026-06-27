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
  sm: { className: 'h-9 w-9', px: 36 },
  md: { className: 'h-10 w-10', px: 40 },
  lg: { className: 'h-11 w-11', px: 44 },
} as const

const NAV_SIZE = {
  sm: { className: 'h-9 w-[10.25rem]', width: 164, height: 36 },
  md: { className: 'h-10 w-[11.375rem]', width: 182, height: 40 },
  lg: { className: 'h-11 w-[12.5rem]', width: 200, height: 44 },
} as const

export function BrandMark({
  href = '/',
  className,
  showPulse,
  variant = 'default',
  size = 'md',
}: BrandMarkProps) {
  const spec = SIZE[size]
  const navSpec = NAV_SIZE[size]
  const src = variant === 'nav' ? BRAND.logo.nav : BRAND.logo.mark

  const logo = (
    <span
      className={cn(
        'relative inline-flex shrink-0 overflow-hidden',
        variant === 'nav' ? navSpec.className : spec.className,
        className
      )}
    >
      <Image
        src={src}
        alt=""
        width={variant === 'nav' ? navSpec.width : spec.px}
        height={variant === 'nav' ? navSpec.height : spec.px}
        loading={variant === 'nav' ? 'eager' : 'lazy'}
        fetchPriority={variant === 'nav' ? 'high' : 'auto'}
        className={cn(
          'h-full w-full object-contain',
          variant === 'nav' ? '' : spec.className
        )}
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
      className={cn('inline-flex items-center group focus-ring rounded-full min-h-11', className)}
    >
      <Image
        src={BRAND.logo.wordmark}
        alt={BRAND.name}
        width={186}
        height={58}
        className="h-9 w-auto object-contain transition-opacity group-hover:opacity-85 sm:h-10"
      />
    </Link>
  )
}
