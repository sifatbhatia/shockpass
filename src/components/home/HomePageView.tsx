'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRef } from 'react'
import { format } from 'date-fns'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, CheckCircle2, ShieldCheck, Ticket, Zap } from 'lucide-react'
import { trpc } from '@/trpc/client'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LiveTicker } from '@/components/ui/LiveTicker'
import { SellThroughBar } from '@/components/SellThroughBar'
import { DropStatePill } from '@/components/drop/DropStatePill'
import { EventPoster } from '@/components/EventPoster'
import { HomeLiveRow, HomeLiveRowSkeleton } from '@/components/home/HomeLiveRow'
import { COPY, HOME_BUYER_FEATURES } from '@/lib/copy'
import { useSession } from 'next-auth/react'
import { MOCK_HOME_EVENTS } from '@/lib/mock-data'

const FALLBACK_HERO = '/assets/willcall-grid-hero.png'

gsap.registerPlugin(ScrollTrigger)

const PLATFORM_LANES = [
  {
    title: 'Discovery',
    body: 'A live board, not a dead listing grid. Rank drops by demand, sell-through, and urgency so buyers know what is moving.',
    href: '/events',
  },
  {
    title: 'Checkout',
    body: 'Checkout stays short on purpose. Guest checkout, ticket hold, clear fees, wallet pass. The account can come later.',
    href: '/events',
  },
  {
    title: 'Operations',
    body: 'The door is part of the product. Rotating QR, scanner mode, guest lookup, organizer health metrics live in the same loop.',
    href: '/scan',
  },
] as const

const SUPPORT_ITEMS = [
  { icon: ShieldCheck, label: 'Payments', body: 'Apple Pay, Google Pay, cards, and clean payout-ready records.' },
  { icon: Zap, label: 'Buying', body: 'Guest checkout by default. No account required to grab tickets.' },
  { icon: Ticket, label: 'Drops', body: 'Public drop pages with tiers, limits, status, and urgency.' },
  { icon: CheckCircle2, label: 'Door', body: 'Rotating QR, scanner mode, check-in status, and guest lookup.' },
] as const

function getFeaturedDropState(sold: number, capacity: number, status: string) {
  if (capacity > 0 && sold >= capacity) return 'sold_out' as const
  if (status === 'LIVE') {
    if (capacity > 0 && sold / capacity >= 0.9) return 'almost_sold_out' as const
    return 'on_sale' as const
  }
  return 'before_sale' as const
}

export function HomePageView() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const { data, isLoading, error, refetch } = trpc.event.list.useQuery({ limit: 12 })
  const events = data?.events ?? []
  const featured = events[0]
  const isOrganizer = session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'
  const liveEvents = events.filter((e) => e.status === 'LIVE')
  const displayEvents = isLoading ? MOCK_HOME_EVENTS : error ? [] : events

  const featuredSold = featured
    ? featured.ticketTiers.reduce((s, t) => s + t.quantitySold, 0) : 0
  const featuredCap = featured
    ? featured.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0) : 0
  const featuredMin = featured && featured.ticketTiers.length > 0
    ? Math.min(...featured.ticketTiers.map((t) => t.priceCents)) : null
  const featuredState = featured ? getFeaturedDropState(featuredSold, featuredCap, featured.status) : null
  const heroImage = FALLBACK_HERO

  useGSAP(() => {
    gsap.from('[data-hero-animate]', {
      autoAlpha: 0, y: 18, duration: 0.7, stagger: 0.08, ease: 'power3.out',
    })
    gsap.utils.toArray<HTMLElement>('[data-home-animate]').forEach((el) => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 84%', once: true } }
      )
    })
    gsap.utils.toArray<HTMLElement>('[data-home-rule]').forEach((el) => {
      gsap.fromTo(el,
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
      )
    })
  }, { scope: rootRef })

  return (
    <AppShell showLivePulse={liveEvents.length > 0} heroUnderNav>
      <div ref={rootRef}>
        {/* ════════════════════════════════════════════
           HERO
        ════════════════════════════════════════════ */}
        <section className="relative min-h-[760px] overflow-hidden grain-overlay">
          <Image src={heroImage} alt="" fill loading="eager" fetchPriority="high" unoptimized sizes="100vw" className="object-cover opacity-82 saturate-110" />

          {/* Readability scrim */}
          <div className="absolute inset-0 pointer-events-none z-[1] bg-gradient-to-r from-black/86 via-black/58 via-[28%] via-black/28 to-black/72 md:to-transparent" />

          {/* Decorative metadata — behind content, never overlapping CTA */}
          <div className="absolute left-[96px] bottom-[92px] z-[1] opacity-28 pointer-events-none hidden md:block">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted">Global gathering</p>
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted mt-1">Room / culture / sound</p>
            <span className="mt-6 block h-px w-10 bg-nav-accent/60" />
          </div>
          <div className="absolute bottom-16 right-[12vw] z-[1] opacity-28 pointer-events-none hidden lg:block">
            <p className="font-mono text-xs leading-relaxed tracking-[0.16em] text-muted">40.7128° N</p>
            <p className="font-mono text-xs leading-relaxed tracking-[0.16em] text-muted">74.0060° W</p>
          </div>

          {/* Hero content */}
          <div className="relative z-[2] mx-auto w-full max-w-[1480px] px-4 py-24 pb-36 sm:px-6 md:px-8 md:py-24 min-h-[760px] flex items-center">
            <div className="grid w-full gap-10 lg:grid-cols-[minmax(0,1fr)_460px] lg:gap-[72px] items-center">
              {/* Left — Copy */}
              <div className="max-w-[760px]">
                <p data-hero-animate className="inline-flex items-center gap-2.5 h-9 rounded-full border border-white/12 bg-white/[0.035] px-4 text-[13px] uppercase tracking-[0.12em] text-muted font-mono">
                  <span className="h-2 w-2 rounded-full bg-nav-accent animate-live-pulse" />
                  {liveEvents.length > 0
                    ? `${liveEvents.length} ${liveEvents.length === 1 ? 'drop' : 'drops'} on sale now`
                    : COPY.liveNow}
                </p>

                <h1 data-hero-animate
                  className="font-display leading-[0.9] tracking-[-0.055em] text-text mt-6"
                  style={{ fontSize: 'clamp(64px, 8vw, 128px)' }}
                >
                  Ticket drops<br />
                  that make the<br />
                  room feel alive.
                </h1>

                <p data-hero-animate
                  className="mt-6 font-sans leading-relaxed"
                  style={{ maxWidth: '640px', fontSize: 'clamp(18px, 1.4vw, 22px)', color: '#b8b8c0' }}
                >
                  Find the room, see the price, hold the ticket, walk through the door. Willcall keeps the whole night in one fast, human-made flow.
                </p>

                {/* CTA row — functional actions only */}
                <div data-hero-animate className="flex flex-wrap items-center gap-3 mt-8">
                  <Button
                    href={featured ? `/events/${featured.slug}` : '/events'}
                    className="h-[52px] px-6 text-[15px] font-bold"
                  >
                    {featured ? COPY.getTickets : COPY.seeWhatsLive}
                  </Button>
                  <Button href="/events" variant="ghost" className="h-[52px] px-6 text-[15px] font-bold border border-white/14 bg-white/[0.035] text-text">
                    Browse all drops
                  </Button>
                  <Button
                    href={session && isOrganizer ? '/dashboard' : '/organizers'}
                    variant="ghost"
                    className="h-[52px] px-4 text-[15px] font-semibold text-muted hover:text-text"
                  >
                    Launch a drop →
                  </Button>
                </div>
              </div>

              {/* Right — Featured drop card */}
              <aside data-hero-animate className="overflow-hidden rounded-[24px] border border-white/12 bg-bg/75 backdrop-blur-md max-w-[460px]">
                {featured && featuredCap > 0 ? (
                  <>
                    <div className="flex gap-4 p-5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-drop bg-panel-2">
                        <EventPoster src={featured.posterUrl} title={featured.title} className="h-20 w-20" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted font-sans">{COPY.homeSellingNow}</p>
                          {featuredState && <DropStatePill state={featuredState} className="!px-2 !py-0.5 !text-[10px]" />}
                        </div>
                        <p className="font-display text-xl leading-tight tracking-tight line-clamp-2">{featured.title}</p>
                        <p className="mt-1 text-xs text-muted font-sans">
                          {featured.venueName ? `${featured.venueName} · ` : ''}{featured.city} · {format(new Date(featured.startsAt), 'EEE, MMM d')}
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-white/10 px-5 pb-5 pt-4">
                      <SellThroughBar sold={featuredSold} capacity={featuredCap} className="mb-4" />
                      <div className="flex items-center justify-between gap-3">
                        <Button href={`/events/${featured.slug}`} className="flex-1">{COPY.getTickets}</Button>
                        {featuredMin != null && <span className="font-mono text-sm text-text">{COPY.fromPrice(`$${(featuredMin / 100).toFixed(0)}`)}</span>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[224px] flex-col justify-between p-5">
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-drop bg-gradient-to-br from-acid/30 to-acid/10 flex items-center justify-center">
                        <span className="font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-acid">live</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2"><p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted font-sans">{COPY.homeSellingNow}</p></div>
                        <p className="font-display text-xl leading-tight tracking-tight">{MOCK_HOME_EVENTS[0].title}</p>
                        <p className="mt-1 text-xs text-muted font-sans">{MOCK_HOME_EVENTS[0].venueName} · {MOCK_HOME_EVENTS[0].city} · {format(new Date(MOCK_HOME_EVENTS[0].startsAt), 'EEE, MMM d')}</p>
                      </div>
                    </div>
                    <div className="border-t border-white/10 px-0 pb-0 pt-4">
                      <div className="mb-4">
                        <div className="flex items-center justify-between gap-2 text-xs text-muted font-sans mb-1"><span>Fill</span><span>225 / 250</span></div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-panel-2"><div className="h-full w-[90%] rounded-full bg-acid transition-all" /></div>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <Button href="/events" className="flex-1">{COPY.getTickets}</Button>
                        <span className="font-mono text-sm text-text">from $35</span>
                      </div>
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>

        {/* Ticker — visually separated */}
        <LiveTicker
          items={liveEvents.map((e) => ({
            label: `${e.title} · ${e.city} · ${COPY.onSaleNow.toLowerCase()}`,
            href: `/events/${e.slug}`,
          }))}
        />

        {/* ════════════════════════════════════════════
           LIVE NOW — product proof
        ════════════════════════════════════════════ */}
        <section data-home-animate className="mx-auto w-full max-w-[1280px] px-4 py-[72px] sm:px-6">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-3xl tracking-tight md:text-4xl">{COPY.liveNow}</h2>
                {liveEvents.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-nav-accent/25 bg-nav-accent/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-nav-accent font-sans">
                    <span className="h-1.5 w-1.5 rounded-full bg-nav-accent animate-live-pulse" />
                    {liveEvents.length} live
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted font-sans">{COPY.liveBoardHint}</p>
            </div>
            <Link href="/events" className="text-sm font-medium text-muted transition-colors hover:text-nav-accent focus-ring font-sans">
              {COPY.findTheDrop} →
            </Link>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-border bg-white/[0.025]">
            <div className="hidden bg-white/[0.04] px-5 py-3 sm:grid sm:grid-cols-[minmax(320px,1fr)_220px_120px_120px_140px] sm:gap-6">
              {['Drop', 'Fill', 'Price', 'Status', 'Action'].map((label) => (
                <span key={label} className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted font-sans">{label}</span>
              ))}
            </div>

            {isLoading || error || events.length === 0 ? (
              <div className="pb-3 sm:pb-0">
                {isLoading ? (
                  MOCK_HOME_EVENTS.map((event, index) => (
                    <HomeLiveRow key={event.id} event={event as any} rank={index + 1} featured={index === 0} />
                  ))
                ) : error ? (
                  <div className="p-6"><EmptyState title={COPY.loadDropsFailed} description={COPY.loadDropsFailedHint} actionLabel={COPY.tryAgain} onAction={() => refetch()} illustration="drops" framed={false} /></div>
                ) : (
                  <div className="p-6"><EmptyState title={COPY.noDropsLive} description={COPY.noDropsLiveHint} actionLabel={COPY.seeWhatsLive} actionHref="/events" illustration="drops" framed={false} /></div>
                )}
              </div>
            ) : (
              <div className="pb-3 sm:pb-0">
                {events.map((event, index) => (
                  <HomeLiveRow key={event.id} event={event} rank={index + 1} featured={index === 0} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ════════════════════════════════════════════
           PRODUCT THESIS
        ════════════════════════════════════════════ */}
        <section className="border-t border-white/10 bg-bg">
          <div className="mx-auto w-full max-w-[1280px] px-4 py-[112px] sm:px-6">
            <div data-home-animate className="grid gap-16 lg:grid-cols-[minmax(360px,0.9fr)_1.1fr] lg:gap-24 items-start">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">Product thesis</p>
                <h2 className="mt-8 max-w-3xl font-display text-6xl leading-[0.88] tracking-tight text-text sm:text-7xl md:text-8xl">
                  Sell the room before checkout starts.
                </h2>
                <p className="mt-6 max-w-lg text-pretty text-sm leading-relaxed text-muted font-sans md:text-base">
                  The best ticketing products do three things well: show demand, make price clear, and keep the door calm. Willcall puts all three on the first screen.
                </p>
              </div>

              <div className="border-y border-white/10">
                {PLATFORM_LANES.map((lane) => (
                  <Link key={lane.title} href={lane.href} className="group relative block py-8 border-b border-white/10 last:border-b-0 transition-colors hover:bg-white/[0.025] focus-ring sm:px-5">
                    <div className="flex gap-5 sm:gap-6">
                      <div className="hidden sm:block w-px min-h-full bg-white/10 group-hover:bg-acid/50 transition-colors shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{lane.title}</p>
                        <h3 className="mt-2 max-w-2xl font-sans text-3xl font-semibold leading-tight tracking-tight text-text group-hover:text-acid transition-colors sm:text-4xl">
                          {lane.body.split('.')[0]}.
                        </h3>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted font-sans">{lane.body}</p>
                      </div>
                      <ArrowRight className="mt-2 h-5 w-5 text-nav-accent shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Capabilities band */}
            <div data-home-rule className="mt-24 h-px w-full bg-white/10 md:mt-32" />

            <div data-home-animate className="py-20 md:py-28">
              <div className="grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[0.75fr_1fr] lg:items-end">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">{COPY.homeAcceptsTitle}</p>
                  <h2 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-text sm:text-6xl md:text-7xl">
                    Built for the sale, the pass, and the door.
                  </h2>
                </div>
                <p className="max-w-2xl text-sm leading-relaxed text-muted font-sans md:text-base">
                  Willcall keeps the buyer path short and the organizer loop complete: payment, proof, live demand, and entry all stay connected.
                </p>
              </div>

              <div className="grid border-b border-white/10 lg:grid-cols-4">
                {SUPPORT_ITEMS.map(({ icon: Icon, label, body }) => (
                  <article key={label} className="group min-h-[14rem] border-b border-white/10 py-8 transition-colors hover:bg-white/[0.025] lg:border-b-0 lg:border-r lg:px-6 lg:last:border-r-0">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-acid transition-colors group-hover:border-nav-accent/40 group-hover:text-nav-accent">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                    <h3 className="mt-10 font-sans text-3xl font-semibold leading-none tracking-tight text-text">{label}</h3>
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted font-sans">{body}</p>
                  </article>
                ))}
              </div>
            </div>

            {/* Buyer trust */}
            <div data-home-rule className="h-px w-full bg-white/10" />

            <div data-home-animate className="py-20 md:py-28">
              <div className="grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(440px,1fr)] lg:gap-24">
                <div className="lg:sticky lg:top-28 lg:self-start">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">Buyer trust</p>
                  <h2 className="mt-8 max-w-2xl font-display text-6xl leading-[0.9] tracking-tight text-text sm:text-7xl md:text-8xl">
                    The ticket should feel held before they pay.
                  </h2>
                </div>

                <div className="divide-y divide-white/10 border-y border-white/10">
                  {HOME_BUYER_FEATURES.map((item) => (
                    <article key={item.title} className="group grid gap-6 py-8 transition-colors hover:bg-white/[0.025] sm:grid-cols-[72px_minmax(0,1fr)] sm:px-5 md:py-10">
                      <div className="hidden sm:block w-[3px] h-8 rounded-full bg-white/10 group-hover:bg-acid/50 transition-colors" />
                      <div className="grid gap-3 md:grid-cols-[0.8fr_1fr] md:gap-8">
                        <h3 className="font-sans text-3xl font-semibold leading-none tracking-tight text-text">{item.title}</h3>
                        <p className="text-sm leading-relaxed text-muted font-sans">{item.body}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            {/* Organizer CTA */}
            <div data-home-animate className="relative mt-4 overflow-hidden border-y border-white/10 py-16 md:py-20">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(420px,1fr)] lg:gap-20">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">{COPY.forOrganizers}</p>
                  <h2 className="mt-6 max-w-2xl font-display text-5xl leading-[0.95] tracking-tight text-text sm:text-6xl md:text-7xl">
                    Launch the drop.<span className="block text-electric">Know when it moves.</span>
                  </h2>
                </div>

                <div className="grid gap-6">
                  <p className="max-w-xl text-sm leading-relaxed text-muted font-sans md:text-base">
                    Willcall gives organizers one command view for tiers, promos, live sell-through, guest lookup, and door scan. No spreadsheet handoff when the room starts filling.
                  </p>

                  <div className="grid border-y border-white/10 sm:grid-cols-3">
                    {[
                      ['Drop tiers', 'Tiered releases and capacity checks.'],
                      ['Demand read', 'Fill rate, revenue, and buyer pace.'],
                      ['Door loop', 'Scan, lookup, and validate in one flow.'],
                    ].map(([title, body]) => (
                      <div key={title} className="border-b border-white/10 py-5 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0">
                        <h3 className="font-sans text-xl font-semibold tracking-tight text-text">{title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted font-sans">{body}</p>
                      </div>
                    ))}
                  </div>

                  <Button href={session && isOrganizer ? '/dashboard' : '/organizers'} variant="outline" className="w-full shrink-0 sm:w-max">
                    {session && isOrganizer ? COPY.commandCenter : 'Launch a drop'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
