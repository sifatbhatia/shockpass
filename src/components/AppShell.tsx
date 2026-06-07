import { DropNav } from '@/components/ui/DropNav'
import { SiteFooter } from '@/components/SiteFooter'
import { cn } from '@/lib/cn'

type AppShellProps = {
  children: React.ReactNode
  className?: string
  showLivePulse?: boolean
  mainClassName?: string
  stickyNav?: boolean
  heroUnderNav?: boolean
  footer?: boolean
}

export function AppShell({
  children,
  className,
  showLivePulse,
  mainClassName,
  stickyNav = true,
  heroUnderNav = false,
  footer = true,
}: AppShellProps) {
  return (
    <div className={cn('min-h-screen bg-bg', className)}>
      <DropNav showLivePulse={showLivePulse} sticky={stickyNav} heroUnderNav={heroUnderNav} />
      <main
        className={cn(
          'mx-auto max-w-[1650px]',
          heroUnderNav && 'max-w-none',
          mainClassName
        )}
      >
        {children}
      </main>
      {footer && <SiteFooter />}
    </div>
  )
}
