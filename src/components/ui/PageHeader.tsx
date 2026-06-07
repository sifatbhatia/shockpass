import { cn } from '@/lib/cn'

type PageHeaderProps = {
  title: string
  description?: string
  action?: React.ReactNode
  display?: boolean
  className?: string
}

export function PageHeader({ title, description, action, display = true, className }: PageHeaderProps) {
  return (
    <header className={cn('mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="max-w-2xl">
        <h1
          className={cn(
            'text-balance leading-tight',
            display
              ? 'font-display text-4xl md:text-5xl tracking-tight'
              : 'text-2xl font-semibold font-sans tracking-tight'
          )}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-muted text-pretty max-w-prose font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}
