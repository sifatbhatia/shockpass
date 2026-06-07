import Image from 'next/image'
import { Button } from './Button'
import { Panel } from './Panel'
import { cn } from '@/lib/cn'

type EmptyStateProps = {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  illustration?: 'drops' | 'wallet'
  framed?: boolean
}

const illustrations = {
  drops: {
    src: '/assets/empty-drops-gallery.png',
    alt: '',
    className: 'aspect-[4/3]',
  },
  wallet: {
    src: '/assets/empty-wallet-rope.png',
    alt: '',
    className: 'aspect-square',
  },
} as const

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  illustration,
  framed = true,
}: EmptyStateProps) {
  const content = (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      {illustration && (
        <div
          className={cn(
            'relative mb-6 w-full max-w-[280px] overflow-hidden rounded-pass border border-white/10 bg-bg/60',
            illustrations[illustration].className
          )}
        >
          <Image
            src={illustrations[illustration].src}
            alt={illustrations[illustration].alt}
            fill
            sizes="280px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/45 via-transparent to-transparent" />
        </div>
      )}
      <h3 className="font-display text-2xl tracking-tight">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted font-sans text-pretty">{description}</p>}
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-6">
          {actionHref ? (
            <Button href={actionHref}>{actionLabel}</Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      )}
    </div>
  )

  if (!framed) {
    return <div className="px-4 py-10">{content}</div>
  }

  return (
    <Panel className="px-6 py-12">
      {content}
    </Panel>
  )
}
