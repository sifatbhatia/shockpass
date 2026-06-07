import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { BrandMark } from '@/components/BrandMark'
import { BRAND } from '@/lib/brand'
import { COPY, NAV_QUICK_LINKS } from '@/lib/copy'

const FOOTER_LINKS = [
  { label: COPY.seeWhatsLive, href: '/events' },
  { label: COPY.organizers, href: '/organizers' },
  { label: COPY.myWallet, href: '/wallet' },
  { label: COPY.doorScanner, href: '/scan' },
] as const

const FOOTER_STATS = [
  { label: COPY.statLiveDrops, value: 'Live' },
  { label: COPY.statAvgFill, value: '82%' },
  { label: COPY.trustNoAccount, value: 'Guest' },
] as const

export function SiteFooter() {
  return (
    <footer className="relative min-h-screen overflow-hidden border-t border-white/10 bg-bg grain-overlay">
      <div className="absolute inset-0 stage-vignette" aria-hidden />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_18%,rgba(248,214,247,0.12),transparent_34%),radial-gradient(ellipse_at_82%_72%,rgba(236,223,251,0.1),transparent_36%),linear-gradient(180deg,rgba(5,5,5,0.18),#050505_72%)]"
        aria-hidden
      />
      <div className="absolute left-0 top-16 hidden h-[70vh] w-px bg-gradient-to-b from-transparent via-acid/40 to-transparent md:block" aria-hidden />
      <div className="absolute right-0 bottom-10 hidden h-[55vh] w-px bg-gradient-to-b from-transparent via-electric/30 to-transparent md:block" aria-hidden />

      <div className="relative mx-auto flex min-h-screen max-w-[1650px] flex-col px-4 py-8 sm:px-6 md:py-10">
        <div className="flex items-center justify-between gap-4">
          <BrandMark variant="nav" size="md" showPulse />
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-medium text-muted backdrop-blur-md transition-colors hover:border-nav-accent/45 hover:text-nav-accent focus-ring font-sans"
          >
            {COPY.findTheDrop}
            <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(300px,520px)] lg:gap-16">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-nav-accent/20 bg-nav-accent/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-nav-accent font-sans">
              <span className="h-1.5 w-1.5 rounded-full bg-nav-accent animate-live-pulse" />
              {BRAND.domain}
            </p>

            <h2 className="max-w-5xl font-display text-balance text-6xl leading-[0.9] tracking-tight sm:text-7xl md:text-8xl lg:text-[8.5rem]">
              Fill the room.
              <span className="block text-acid">Hold the door.</span>
            </h2>

            <p className="mt-6 max-w-xl text-pretty text-sm leading-relaxed text-muted font-sans md:text-base">
              {BRAND.tagline} Live drop pages, fast checkout, wallet passes, and scanner-ready tickets in one dark-room system.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/events"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-acid px-6 py-3 text-sm font-medium text-bg shadow-glow-acid transition-[background,transform] hover:bg-acid-dim active:scale-[0.98] focus-ring font-sans"
              >
                {COPY.seeWhatsLive}
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
              <Link
                href="/organizers"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 bg-transparent px-6 py-3 text-sm font-medium text-text transition-colors hover:border-white/25 hover:bg-panel-2 focus-ring font-sans"
              >
                {COPY.organizers}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(248,214,247,0.1),transparent_66%)] blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-pass border border-white/12 bg-panel/40 shadow-panel">
              <div className="relative aspect-[16/11]">
                <Image
                  src="/assets/scan-success-moment.png"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 520px, 92vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              </div>
              <div className="grid grid-cols-3 border-t border-white/10 bg-bg/72 backdrop-blur">
                {FOOTER_STATS.map((stat) => (
                  <div key={stat.label} className="border-r border-white/10 px-4 py-4 last:border-r-0">
                    <p className="font-mono text-lg text-text">{stat.value}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted font-sans">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 border-t border-white/10 py-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <BrandMark size="lg" />
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted font-sans">
              Drop-style ticketing for rooms that should feel alive before the doors open.
            </p>
          </div>

          <nav aria-label="Footer" className="grid gap-3 sm:grid-cols-2 md:min-w-[420px]">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex min-h-11 items-center justify-between rounded-drop border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted transition-colors hover:border-nav-accent/35 hover:text-text focus-ring font-sans"
              >
                {link.label}
                <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-4 text-xs text-muted font-sans">
          <span>© 2026 {BRAND.name}</span>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {NAV_QUICK_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors hover:text-nav-accent focus-ring rounded-sm">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
