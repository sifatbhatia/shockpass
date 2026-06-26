'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TransitionLink as GlimmLink } from 'glimm/next'
import { ArrowRight, ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { COPY, NAV_QUICK_LINKS } from '@/lib/copy'
import { cn } from '@/lib/cn'

type DropNavProps = {
  className?: string
  showLivePulse?: boolean
  sticky?: boolean
  heroUnderNav?: boolean
}

function ExternalIcon({ className }: { className?: string }) {
  return <ArrowUpRight className={cn('h-4 w-4 shrink-0 opacity-70', className)} strokeWidth={1.5} />
}

export function DropNav({ className, showLivePulse, sticky = true }: DropNavProps) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const isOrganizer = session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'
  const [megaOpen, setMegaOpen] = useState(false)
  const [megaRendered, setMegaRendered] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileRendered, setMobileRendered] = useState(false)
  const [navBarHeight, setNavBarHeight] = useState(72)
  const [overBrightSurface, setOverBrightSurface] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const scrimRef = useRef<HTMLDivElement>(null)
  const megaPanelRef = useRef<HTMLDivElement>(null)
  const mobileScrimRef = useRef<HTMLDivElement>(null)
  const mobileDrawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const syncHeight = () => {
      const height = bar.offsetHeight
      setNavBarHeight(height)
      document.documentElement.style.setProperty('--nav-bar-height', `${height}px`)
    }

    syncHeight()
    const ro = new ResizeObserver(syncHeight)
    ro.observe(bar)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const syncSurface = () => {
      const footer = document.querySelector('footer')
      const footerRect = footer?.getBoundingClientRect()
      setOverBrightSurface(Boolean(footerRect && footerRect.top <= navBarHeight && footerRect.bottom > 0))
    }

    const frame = window.requestAnimationFrame(syncSurface)
    window.addEventListener('scroll', syncSurface, { passive: true })
    window.addEventListener('resize', syncSurface)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', syncSurface)
      window.removeEventListener('resize', syncSurface)
    }
  }, [navBarHeight])

  useEffect(() => {
    if (megaOpen) queueMicrotask(() => setMegaRendered(true))
  }, [megaOpen])

  useEffect(() => {
    if (mobileOpen) queueMicrotask(() => setMobileRendered(true))
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = megaOpen || mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [megaOpen, mobileOpen])

  useEffect(() => {
    if (!megaOpen && !mobileOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMegaOpen(false)
        setMobileOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [megaOpen, mobileOpen])

  const closeAll = useCallback(() => {
    setMegaOpen(false)
    setMobileOpen(false)
  }, [])

  // Mega menu open/close (no gsap)
  useEffect(() => {
    if (!megaRendered) return
    const scrim = scrimRef.current
    const panel = megaPanelRef.current
    if (!panel) return
    const links = panel.querySelectorAll('[data-nav-animate]')
    if (megaOpen) {
      if (scrim) scrim.style.opacity = '1'
      panel.style.opacity = '1'
      panel.style.transform = 'translateY(0)'
      links.forEach((l) => { (l as HTMLElement).style.opacity = '1'; (l as HTMLElement).style.transform = 'translateY(0)' })
    } else {
      if (scrim) scrim.style.opacity = '0'
      panel.style.opacity = '0'
      panel.style.transform = 'translateY(-12px)'
      links.forEach((l) => { (l as HTMLElement).style.opacity = '0'; (l as HTMLElement).style.transform = 'translateY(6px)' })
      setTimeout(() => setMegaRendered(false), 200)
    }
  }, [megaOpen, megaRendered])

  useEffect(() => {
    if (!mobileRendered) return
    const drawer = mobileDrawerRef.current
    const scrim = mobileScrimRef.current
    if (!drawer) return
    const links = drawer.querySelectorAll('[data-nav-animate]')
    if (mobileOpen) {
      if (scrim) scrim.style.opacity = '1'
      drawer.style.opacity = '1'
      drawer.style.transform = 'translateY(0) scale(1)'
      links.forEach((l) => { (l as HTMLElement).style.opacity = '1'; (l as HTMLElement).style.transform = 'translateY(0)' })
    } else {
      if (scrim) scrim.style.opacity = '0'
      drawer.style.opacity = '0'
      drawer.style.transform = 'translateY(-8px) scale(0.985)'
      links.forEach((l) => { (l as HTMLElement).style.opacity = '0'; (l as HTMLElement).style.transform = 'translateY(-4px)' })
      setTimeout(() => setMobileRendered(false), 200)
    }
  }, [mobileOpen, mobileRendered])

  const pillLinks = session
    ? [
        { label: COPY.organizers, href: '/organizers' },
        { label: COPY.myWallet, href: '/wallet' },
        ...(isOrganizer ? [{ label: COPY.commandCenter, href: '/dashboard' }] : []),
      ]
    : [
        { label: COPY.organizers, href: '/organizers' },
        { label: COPY.signIn, href: '/auth' },
        { label: COPY.joinTheRoom, href: '/auth?tab=signup' },
      ]

  const organizerLinks = isOrganizer
    ? [
        { label: 'Why Willcall', href: '/organizers' },
        { label: COPY.launchDrop, href: '/dashboard/events/new' },
        { label: COPY.manageDrops, href: '/dashboard' },
        { label: COPY.doorScanner, href: '/scan' },
      ]
    : [
        { label: 'Why Willcall', href: '/organizers' },
        { label: COPY.launchADrop, href: '/auth?tab=signup' },
      ]

  const mobileLinks = [
    { label: COPY.dropsNav, href: '/events' },
    { label: COPY.organizers, href: '/organizers' },
    ...(session ? [{ label: COPY.myWallet, href: '/wallet' }] : []),
    ...(session && isOrganizer
      ? [{ label: COPY.commandCenter, href: '/dashboard' }]
      : !session
        ? [
            { label: COPY.signIn, href: '/auth' },
            { label: COPY.joinTheRoom, href: '/auth?tab=signup' },
          ]
        : []),
  ]
  const darkNav = overBrightSurface && !megaOpen && !mobileOpen

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          sticky && 'sticky top-0 z-[51]',
          'w-full',
          className
        )}
      >
        {/* Full-width effect layer */}
        <div
          className={cn(
            'absolute inset-0 w-screen left-1/2 -translate-x-1/2 pointer-events-none transition-[background,backdrop-filter] duration-500 ease-out',
            !megaOpen && !mobileOpen && (
              darkNav
                ? 'bg-gradient-to-b from-nav-accent/42 via-nav-accent/14 to-transparent backdrop-blur-[1px]'
                : 'bg-gradient-to-b from-bg/34 via-bg/12 to-transparent backdrop-blur-[1px]'
            ),
            (megaOpen || mobileOpen) && 'bg-bg/96 backdrop-blur-xl'
          )}
          style={{ maskImage: 'linear-gradient(to bottom, black 0%, black 68%, transparent 100%)' }}
        />
        <div
          ref={barRef}
          className={cn(
            'relative z-[2] mx-auto flex max-w-[1650px] items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4',
            !megaOpen && !mobileOpen && 'bg-transparent',
            (megaOpen || mobileOpen) && 'bg-transparent'
          )}
        >
          <BrandMark
            variant="nav"
            size="md"
            className={cn(darkNav && '[&_img]:brightness-0')}
          />

          <div className="ml-auto hidden items-center lg:flex">
            <div
              className={cn(
                'inline-flex items-center gap-0.5 rounded-full border border-white/12 px-1.5 py-1.5 transition-[background,border-color,box-shadow,backdrop-filter] duration-700 ease-out',
                megaOpen
                  ? 'bg-panel/90'
                  : darkNav
                    ? 'border-bg/20 bg-nav-accent/10 shadow-none backdrop-blur-xl'
                    : 'bg-bg/16 shadow-none backdrop-blur-xl'
              )}
            >
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-haspopup="true"
                onClick={() => setMegaOpen((open) => !open)}
                className={cn(
                  'inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium font-sans transition-colors duration-500 ease-out focus-ring',
                  megaOpen
                    ? 'border-2 border-nav-accent bg-nav-accent text-bg'
                    : darkNav
                      ? 'border-2 border-transparent text-bg/82 hover:text-bg'
                      : 'border-2 border-transparent text-muted hover:text-text'
                )}
              >
                {COPY.dropsNav}
                <ChevronDown
                  className={cn('h-3.5 w-3.5 transition-transform', megaOpen && 'rotate-180')}
                  strokeWidth={2}
                />
              </button>

              {pillLinks.map((link) => (
                <GlimmLink
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setMegaOpen(false)}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-full border-2 border-transparent px-4 py-2 text-sm font-medium font-sans transition-colors focus-ring',
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                      ? darkNav
                        ? 'border-bg/40 bg-bg/15 text-bg'
                        : 'border-nav-accent/40 bg-nav-accent/10 text-nav-accent'
                      : darkNav
                        ? 'text-bg/82 duration-500 ease-out hover:text-bg'
                        : 'text-muted duration-500 ease-out hover:text-text'
                  )}
                >
                  {link.label}
                </GlimmLink>
              ))}
            </div>
          </div>

          <div className="ml-auto flex items-center lg:hidden">
            <button
              type="button"
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((open) => !open)}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-full border backdrop-blur-xl transition-[background,border-color,color] duration-700 ease-out focus-ring',
                darkNav ? 'border-bg/20 bg-nav-accent/10 text-bg' : 'border-white/10 bg-bg/18 text-text'
              )}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>
      </header>

      {megaRendered && (
        <>
          <div
            ref={scrimRef}
            role="presentation"
            aria-hidden
            className="fixed left-0 right-0 bottom-0 z-[var(--z-nav)] hidden bg-bg/24 backdrop-blur-sm lg:block"
            style={{ top: navBarHeight, opacity: 0 }}
            onClick={closeAll}
          />
          <div
            ref={megaPanelRef}
            className="fixed left-1/2 z-[var(--z-dropdown)] hidden max-h-[calc(100dvh-var(--nav-bar-height)-1rem)] w-[min(calc(100vw-2rem),1650px)] -translate-x-1/2 overflow-hidden rounded-b-pass border-x border-b border-white/10 bg-bg/94 shadow-sheet backdrop-blur-md lg:block"
            style={{ top: navBarHeight, opacity: 0 }}
          >
            <div className="relative grid gap-8 px-6 py-6 md:grid-cols-3 md:px-8 md:py-8">
              {/* Left — Discover */}
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Discover</p>
                <ul className="space-y-3">
                  <li data-nav-animate>
                    <Link href="/events" onClick={closeAll} className="group inline-flex items-center gap-2 font-sans text-lg font-medium text-text transition-colors hover:text-nav-accent focus-ring rounded-sm">
                      {COPY.seeWhatsLive}
                      <ExternalIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                  {session && (
                    <li data-nav-animate>
                      <Link href="/wallet" onClick={closeAll} className="group inline-flex items-center gap-2 font-sans text-lg font-medium text-text transition-colors hover:text-nav-accent focus-ring rounded-sm">
                        {COPY.myWallet}
                        <ExternalIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Middle — Organize */}
              <div>
                <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Organize</p>
                <ul className="divide-y divide-white/10">
                  {organizerLinks.map((link) => (
                    <li key={link.href + link.label} data-nav-animate>
                      <Link href={link.href} onClick={closeAll} className="group flex items-center justify-between py-3 font-sans text-sm font-medium text-text transition-colors hover:text-nav-accent focus-ring">
                        {link.label}
                        <ExternalIcon />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — Quick links */}
              <div>
                <Link href="/organizers" onClick={closeAll} data-nav-animate className="mb-3 inline-flex items-center gap-2 font-sans text-sm font-medium text-muted transition-colors hover:text-text focus-ring rounded-sm">
                  {COPY.organizers}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>

                <ul className="space-y-2">
                  {NAV_QUICK_LINKS.map((link) => (
                    <li key={link.href} data-nav-animate>
                      <Link href={link.href} onClick={closeAll} className="group inline-flex items-center gap-2 font-sans text-sm text-muted transition-colors hover:text-text focus-ring">
                        {link.label}
                        <ExternalIcon className="h-3.5 w-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {mobileRendered && (
        <>
          <div
            ref={mobileScrimRef}
            role="presentation"
            aria-hidden
            className="fixed inset-x-0 bottom-0 z-[var(--z-nav)] bg-bg/40 backdrop-blur-sm lg:hidden"
            style={{ top: navBarHeight, opacity: 0 }}
            onClick={closeAll}
          />
          <div
            ref={mobileDrawerRef}
            className="fixed inset-x-3 z-[var(--z-modal)] flex max-h-[calc(100dvh-var(--nav-bar-height)-1rem)] origin-top flex-col overflow-hidden rounded-pass border border-white/10 bg-bg/96 shadow-sheet backdrop-blur-xl sm:inset-x-4 lg:hidden"
            style={{ top: navBarHeight + 8, opacity: 0 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(248,214,247,0.1),transparent_42%),radial-gradient(ellipse_at_100%_75%,rgba(212,255,82,0.045),transparent_34%)]" aria-hidden />
            <nav className="relative flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
              <ul className="space-y-1">
                {mobileLinks.map((link, index) => (
                  <li key={`${link.href}-${link.label}-${index}`} data-nav-animate>
                    <Link
                      href={link.href}
                      onClick={closeAll}
                      className={cn(
                        'flex min-h-12 items-center justify-between rounded-drop px-3 py-3 font-sans text-2xl font-medium transition-colors focus-ring sm:text-3xl',
                        pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                          ? 'text-nav-accent'
                          : 'text-text/90 hover:bg-white/[0.05] hover:text-nav-accent'
                      )}
                    >
                      {link.label}
                      <ArrowRight className="h-5 w-5 shrink-0 opacity-70 sm:h-6 sm:w-6" strokeWidth={1.5} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="relative border-t border-white/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-5">
              <ul className="divide-y divide-white/10">
                {NAV_QUICK_LINKS.map((link) => (
                  <li key={link.href} data-nav-animate>
                    <Link
                      href={link.href}
                      onClick={closeAll}
                      className="flex min-h-11 items-center justify-between py-3 font-sans text-sm text-muted transition-colors hover:text-text focus-ring sm:text-base"
                    >
                      {link.label}
                      <ExternalIcon />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  )
}
