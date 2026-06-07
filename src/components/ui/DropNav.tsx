'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
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

export function DropNav({ className, showLivePulse, sticky = true, heroUnderNav = false }: DropNavProps) {
  const { data: session } = useSession()
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
    if (!heroUnderNav) {
      return
    }

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
  }, [heroUnderNav, navBarHeight])

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

  useGSAP(
    () => {
      if (!megaRendered) return

      const scrim = scrimRef.current
      const panel = megaPanelRef.current
      if (!scrim || !panel) return

      const links = panel.querySelectorAll('[data-nav-animate]')
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reducedMotion) {
        gsap.set(scrim, { opacity: megaOpen ? 1 : 0 })
        gsap.set(panel, { opacity: megaOpen ? 1 : 0, y: 0 })
        gsap.set(links, { opacity: megaOpen ? 1 : 0, y: 0 })
        if (!megaOpen) setMegaRendered(false)
        return
      }

      if (megaOpen) {
        gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' })
        gsap.fromTo(
          panel,
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out' }
        )
        gsap.fromTo(
          links,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.28, stagger: 0.04, ease: 'power2.out', delay: 0.06 }
        )
      } else {
        gsap.to(links, { opacity: 0, y: 6, duration: 0.15, stagger: 0.02, ease: 'power2.in' })
        gsap.to(panel, {
          opacity: 0,
          y: -8,
          duration: 0.22,
          ease: 'power2.in',
          delay: 0.04,
        })
        gsap.to(scrim, {
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => setMegaRendered(false),
        })
      }
    },
    { dependencies: [megaOpen, megaRendered], scope: navRef }
  )

  useGSAP(
    () => {
      if (!mobileRendered) return

      const drawer = mobileDrawerRef.current
      const scrim = mobileScrimRef.current
      if (!drawer) return

      const links = drawer.querySelectorAll('[data-nav-animate]')
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reducedMotion) {
        if (scrim) gsap.set(scrim, { opacity: mobileOpen ? 1 : 0 })
        gsap.set(drawer, { opacity: mobileOpen ? 1 : 0, y: 0, scale: 1 })
        gsap.set(links, { opacity: mobileOpen ? 1 : 0, y: 0 })
        if (!mobileOpen) setMobileRendered(false)
        return
      }

      if (mobileOpen) {
        if (scrim) gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' })
        gsap.fromTo(
          drawer,
          { opacity: 0, y: -10, scale: 0.985 },
          { opacity: 1, y: 0, scale: 1, duration: 0.26, ease: 'power3.out' }
        )
        gsap.fromTo(
          links,
          { opacity: 0, y: -4 },
          { opacity: 1, y: 0, duration: 0.22, stagger: 0.035, ease: 'power2.out', delay: 0.06 }
        )
      } else {
        gsap.to(links, { opacity: 0, y: -4, duration: 0.12, stagger: 0.018, ease: 'power2.in' })
        if (scrim) gsap.to(scrim, { opacity: 0, duration: 0.18, ease: 'power2.in' })
        gsap.to(drawer, {
          opacity: 0,
          y: -8,
          scale: 0.985,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => setMobileRendered(false),
        })
      }
    },
    { dependencies: [mobileOpen, mobileRendered] }
  )

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
          heroUnderNav && 'bg-transparent',
          !heroUnderNav && 'bg-bg/82 backdrop-blur-xl',
          className
        )}
      >
        <div
          ref={barRef}
          className={cn(
            'mx-auto flex max-w-[1650px] items-center gap-3 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:py-4',
            'transition-[background,border-color,backdrop-filter] duration-500 ease-out',
            heroUnderNav && !megaOpen && !mobileOpen && (
              darkNav
                ? 'bg-gradient-to-b from-nav-accent/42 via-nav-accent/14 to-transparent backdrop-blur-[1px]'
                : 'bg-gradient-to-b from-bg/34 via-bg/12 to-transparent backdrop-blur-[1px]'
            ),
            (megaOpen || mobileOpen) && 'bg-bg/96 backdrop-blur-xl'
          )}
        >
          <BrandMark
            variant="nav"
            showPulse={showLivePulse}
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
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  onClick={() => setMegaOpen(false)}
                  className={cn(
                    'inline-flex min-h-11 items-center rounded-full border-2 border-transparent px-4 py-2 text-sm font-medium font-sans transition-colors focus-ring',
                    darkNav ? 'text-bg/82 duration-500 ease-out hover:text-bg' : 'text-muted duration-500 ease-out hover:text-text'
                  )}
                >
                  {link.label}
                </Link>
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
            className="fixed left-0 right-0 bottom-0 z-[var(--z-nav)] hidden bg-bg/32 backdrop-blur-sm lg:block"
            style={{ top: navBarHeight, opacity: 0 }}
            onClick={closeAll}
          />
          <div
            ref={megaPanelRef}
            className="fixed left-1/2 z-[var(--z-dropdown)] hidden max-h-[calc(100dvh-var(--nav-bar-height)-1rem)] w-[min(calc(100vw-2rem),1650px)] -translate-x-1/2 overflow-hidden rounded-b-pass border-x border-b border-white/10 bg-bg/94 shadow-sheet backdrop-blur-xl lg:block"
            style={{ top: navBarHeight, opacity: 0 }}
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(248,214,247,0.08),transparent_40%),radial-gradient(ellipse_at_82%_75%,rgba(236,223,251,0.055),transparent_38%)]" aria-hidden />
            <div className="relative grid gap-10 px-6 py-8 md:grid-cols-2 md:px-8 md:py-10">
              <div>
                <div className="mb-8 flex items-center gap-4" data-nav-animate>
                  <h2 className="font-sans text-3xl font-medium tracking-tight text-text md:text-4xl">
                    {COPY.seeWhatsLive}
                  </h2>
                  <Link
                    href="/events"
                    onClick={closeAll}
                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-text text-bg transition-opacity hover:opacity-90 focus-ring"
                    aria-label={COPY.findTheDrop}
                  >
                    <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
                  </Link>
                </div>

                <ul className="space-y-5">
                  <li data-nav-animate>
                    <Link
                      href="/events"
                      onClick={closeAll}
                      className="group inline-flex items-center gap-3 font-sans text-2xl font-medium text-text transition-colors hover:text-nav-accent focus-ring rounded-sm"
                    >
                      {COPY.seeWhatsLive}
                      <ExternalIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </li>
                  {session && (
                    <li data-nav-animate>
                      <Link
                        href="/wallet"
                        onClick={closeAll}
                        className="group inline-flex items-center gap-3 font-sans text-2xl font-medium text-text transition-colors hover:text-nav-accent focus-ring rounded-sm"
                      >
                        {COPY.myWallet}
                        <ExternalIcon className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <Link
                  href="/organizers"
                  onClick={closeAll}
                  data-nav-animate
                  className="mb-6 inline-flex items-center gap-2 font-sans text-sm font-medium text-muted transition-colors hover:text-text focus-ring rounded-sm"
                >
                  {COPY.organizers}
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>

                <ul className="divide-y divide-white/10">
                  {organizerLinks.map((link) => (
                    <li key={link.href + link.label} data-nav-animate>
                      <Link
                        href={link.href}
                        onClick={closeAll}
                        className="group flex items-center justify-between py-4 font-sans text-lg text-text transition-colors hover:text-nav-accent focus-ring"
                      >
                        {link.label}
                        <ExternalIcon />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 px-6 py-5 md:px-8">
              {NAV_QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeAll}
                  data-nav-animate
                  className="group inline-flex items-center gap-2 font-sans text-sm text-muted transition-colors hover:text-text focus-ring"
                >
                  {link.label}
                  <ExternalIcon className="h-3.5 w-3.5" />
                </Link>
              ))}
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
                      className="flex min-h-12 items-center justify-between rounded-drop px-3 py-3 font-sans text-2xl font-medium text-text/90 transition-colors hover:bg-white/[0.05] hover:text-nav-accent focus-ring sm:text-3xl"
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
