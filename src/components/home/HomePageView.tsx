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

const FALLBACK_HERO =
  '/assets/willcall-grid-hero.png'

gsap.registerPlugin(ScrollTrigger)

const PLATFORM_LANES = [
  {
    kicker: 'Discovery',
    title: 'A live board, not a dead listing grid.',
    body: 'Rank drops by demand, city, fill rate, and urgency so buyers know what is moving before they open a page.',
    href: '/events',
  },
  {
    kicker: 'Conversion',
    title: 'Checkout stays short on purpose.',
    body: 'Guest email, ticket hold, clear fees, wallet pass. The account can come later; the ticket comes first.',
    href: '/events',
  },
  {
    kicker: 'Operations',
    title: 'The door is part of the product.',
    body: 'Rotating QR, camera scan, manual lookup, VIP/guestlist states, and organizer health metrics live in the same loop.',
    href: '/scan',
  },
] as const

const MARKET_PROOF = [
  { value: '10 sec', label: 'target checkout' },
  { value: '0', label: 'signup walls' },
  { value: 'live', label: 'demand read' },
] as const

const SUPPORT_ITEMS = [
  { icon: ShieldCheck, label: COPY.homeAcceptsPayments, body: COPY.homeAcceptsPaymentsBody },
  { icon: Zap, label: COPY.homeAcceptsBuying, body: COPY.homeAcceptsBuyingBody },
  { icon: Ticket, label: COPY.homeAcceptsEvents, body: COPY.homeAcceptsEventsBody },
  { icon: CheckCircle2, label: COPY.homeAcceptsTrust, body: COPY.homeAcceptsTrustBody },
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

  const featuredSold = featured
    ? featured.ticketTiers.reduce((s, t) => s + t.quantitySold, 0)
    : 0
  const featuredCap = featured
    ? featured.ticketTiers.reduce((s, t) => s + t.quantityTotal, 0)
    : 0
  const featuredMin =
    featured && featured.ticketTiers.length > 0
      ? Math.min(...featured.ticketTiers.map((t) => t.priceCents))
      : null
  const featuredState = featured
    ? getFeaturedDropState(featuredSold, featuredCap, featured.status)
    : null
  const heroImage = FALLBACK_HERO

  useGSAP(
    () => {
      gsap.from('[data-hero-animate]', {
        autoAlpha: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      })

      gsap.utils.toArray<HTMLElement>('[data-home-animate]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 84%',
              once: true,
            },
          }
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-home-rule]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              once: true,
            },
          }
        )
      })
    },
    { scope: rootRef }
  )

  return (
    <AppShell showLivePulse={liveEvents.length > 0} heroUnderNav>
      <div ref={rootRef}>
      {/* Attendee-first hero — full bleed under transparent nav */}
      <section
        className="relative -mt-[var(--nav-bar-height,4.5rem)] min-h-[min(92vh,820px)] overflow-hidden grain-overlay"
      >
        <Image
          src={heroImage}
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          unoptimized
          sizes="100vw"
          className="object-cover opacity-82 saturate-110"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.74)_0%,rgba(5,5,5,0.36)_30%,rgba(5,5,5,0.82)_72%,#050505_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg/92 via-bg/38 to-bg/20" />
        <div className="absolute bottom-8 left-[8vw] hidden font-mono text-xs uppercase tracking-[0.24em] text-muted md:block">
          <p>Global rooms</p>
          <p>Art, culture</p>
          <p>& sound</p>
          <span className="mt-8 block h-px w-10 bg-nav-accent" />
        </div>
        <div className="absolute bottom-12 right-[12vw] hidden font-mono text-xs leading-relaxed tracking-[0.16em] text-muted lg:block">
          <p>40.7128° N</p>
          <p>74.0060° W</p>
        </div>

        <div className="relative mx-auto flex min-h-[min(92vh,820px)] max-w-[1650px] flex-col justify-end px-4 pb-12 pt-[calc(var(--nav-bar-height,4.5rem)+1.5rem)] sm:px-6 sm:pb-16 md:pb-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-end lg:gap-12">
            <div className="max-w-2xl">
              <p data-hero-animate className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-bg/50 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-muted backdrop-blur font-sans">
                <span className="h-1.5 w-1.5 rounded-full bg-nav-accent animate-live-pulse" />
                {liveEvents.length > 0
                  ? `${liveEvents.length} ${liveEvents.length === 1 ? 'drop' : 'drops'} on sale now`
                  : COPY.liveNow}
              </p>

              <h1 data-hero-animate className="font-display text-balance text-5xl leading-[0.92] tracking-tight sm:text-6xl md:text-7xl lg:text-[4.5rem]">
                Ticket drops that make the room feel alive.
              </h1>
              <p data-hero-animate className="mt-4 max-w-lg text-pretty text-sm leading-relaxed text-muted font-sans md:text-base">
                Find the room, see the price, hold the ticket, walk through the door. Willcall keeps the whole night in one fast, human-made flow.
              </p>

              <div data-hero-animate className="mt-7 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  href={featured ? `/events/${featured.slug}` : '/events'}
                  className="w-full sm:w-auto"
                >
                  {featured ? COPY.getTickets : COPY.seeWhatsLive}
                </Button>
                <Button href="/events" variant="ghost" className="w-full sm:w-auto">
                  {COPY.homeBrowseAll}
                </Button>
                {session && (
                  <Link
                    href="/wallet"
                    className="text-center text-sm font-medium text-muted transition-colors hover:text-nav-accent focus-ring font-sans sm:ml-1"
                  >
                    {COPY.myWallet} →
                  </Link>
                )}
              </div>

              <ul data-hero-animate className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted font-sans">
                {MARKET_PROOF.map((item) => (
                  <li key={item.label} className="flex items-center gap-2">
                    <span className="font-mono text-acid">{item.value}</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            <aside data-hero-animate className="min-h-[224px] overflow-hidden rounded-pass border border-white/12 bg-bg/75 backdrop-blur-md">
              {featured && featuredCap > 0 ? (
                <>
                <div className="flex gap-4 p-5">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-drop bg-panel-2">
                    <EventPoster
                      src={featured.posterUrl}
                      title={featured.title}
                      className="h-20 w-20"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted font-sans">
                        {COPY.homeSellingNow}
                      </p>
                      {featuredState && (
                        <DropStatePill state={featuredState} className="!px-2 !py-0.5 !text-[10px]" />
                      )}
                    </div>
                    <p className="font-display text-xl leading-tight tracking-tight line-clamp-2">
                      {featured.title}
                    </p>
                    <p className="mt-1 text-xs text-muted font-sans">
                      {featured.venueName ? `${featured.venueName} · ` : ''}
                      {featured.city} · {format(new Date(featured.startsAt), 'EEE, MMM d')}
                    </p>
                  </div>
                </div>
                <div className="border-t border-white/10 px-5 pb-5 pt-4">
                  <SellThroughBar sold={featuredSold} capacity={featuredCap} className="mb-4" />
                  <div className="flex items-center justify-between gap-3">
                    <Button href={`/events/${featured.slug}`} className="flex-1">
                      {COPY.getTickets}
                    </Button>
                    {featuredMin != null && (
                      <span className="font-mono text-sm text-text">
                        {COPY.fromPrice(`$${(featuredMin / 100).toFixed(0)}`)}
                      </span>
                    )}
                  </div>
                </div>
                </>
              ) : (
                <div className="flex h-full min-h-[224px] flex-col justify-between p-5">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 shrink-0 rounded-drop skeleton-shimmer" />
                    <div className="min-w-0 flex-1 space-y-3 pt-1">
                      <div className="h-3 w-20 rounded skeleton-shimmer" />
                      <div className="h-6 w-4/5 rounded skeleton-shimmer" />
                      <div className="h-3 w-2/3 rounded skeleton-shimmer" />
                    </div>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="h-2 w-full rounded skeleton-shimmer" />
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="h-11 flex-1 rounded-full skeleton-shimmer" />
                      <div className="h-4 w-12 rounded skeleton-shimmer" />
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      <LiveTicker
        items={liveEvents.map((e) => ({
          label: `${e.title} · ${e.city} · ${COPY.onSaleNow.toLowerCase()}`,
          href: `/events/${e.slug}`,
        }))}
      />

      {/* Live board — buyer discovery */}
      <section data-home-animate className="mx-auto max-w-[1650px] px-4 py-14 sm:px-6 sm:py-16 md:py-20">
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
          <Link
            href="/events"
            className="text-sm font-medium text-muted transition-colors hover:text-nav-accent focus-ring font-sans"
          >
            {COPY.findTheDrop} →
          </Link>
        </div>

        <div className="overflow-hidden rounded-pass border border-border bg-panel/40 sm:rounded-pass">
          <div className="hidden bg-panel/80 px-4 py-2 sm:grid sm:grid-cols-[56px_minmax(0,1.3fr)_minmax(0,0.9fr)_100px_90px_96px] sm:gap-4">
            {[
              { key: 'rank', label: '' },
              { key: 'drop', label: COPY.tableDrop },
              { key: 'fill', label: COPY.tableFill },
              { key: 'from', label: COPY.tableFrom },
              { key: 'status', label: COPY.tableStatus },
              { key: 'cta', label: COPY.tableAction },
            ].map(({ key, label }) => (
              <span
                key={key}
                className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted font-sans"
              >
                {label}
              </span>
            ))}
          </div>

          {isLoading ? (
            <div className="py-2 sm:py-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <HomeLiveRowSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="p-6">
              <EmptyState
                title={COPY.loadDropsFailed}
                description={COPY.loadDropsFailedHint}
                actionLabel={COPY.tryAgain}
                onAction={() => refetch()}
                illustration="drops"
                framed={false}
              />
            </div>
          ) : events.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={COPY.noDropsLive}
                description={COPY.noDropsLiveHint}
                actionLabel={COPY.seeWhatsLive}
                actionHref="/events"
                illustration="drops"
                framed={false}
              />
            </div>
          ) : (
            <div className="pb-3 sm:pb-0">
              {events.map((event, index) => (
                <HomeLiveRow
                  key={event.id}
                  event={event}
                  rank={index + 1}
                  featured={index === 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Editorial system — less dashboard, more night-out magazine */}
      <section className="relative overflow-hidden border-t border-white/10 bg-bg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-panel/42 to-transparent" />

        <div className="relative mx-auto max-w-[1650px] px-4 py-20 sm:px-6 md:py-28">
          <div data-home-animate className="grid gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(420px,1fr)] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">
                Product thesis
              </p>
              <h2 className="mt-8 max-w-3xl font-display text-6xl leading-[0.88] tracking-tight text-text sm:text-7xl md:text-8xl">
                Sell the room before checkout starts.
              </h2>
              <p className="mt-6 max-w-lg text-pretty text-sm leading-relaxed text-muted font-sans md:text-base">
                The best ticketing products do three things well: show demand, make price clear, and keep the door calm. Willcall puts all three on the first screen.
              </p>
            </div>

            <ol className="border-y border-white/10">
              {PLATFORM_LANES.map((step, index) => (
                <li key={step.title} className="border-b border-white/10 last:border-b-0">
                  <Link
                    href={step.href}
                    className="group relative grid gap-5 py-8 transition-colors hover:bg-white/[0.025] focus-ring sm:grid-cols-[86px_minmax(0,1fr)] sm:px-5"
                  >
                    <span className="font-mono text-sm text-acid">{`${index + 1}.0`}</span>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        {step.kicker}
                      </p>
                      <h3 className="mt-3 max-w-2xl font-sans text-3xl font-semibold leading-none tracking-tight text-text transition-colors group-hover:text-acid sm:text-4xl">
                        {step.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted font-sans">
                        {step.body}
                      </p>
                    </div>
                    <ArrowRight className="absolute right-0 top-8 h-5 w-5 text-nav-accent transition-transform group-hover:translate-x-1 sm:right-5" strokeWidth={1.5} />
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <div data-home-rule className="mt-24 h-px w-full bg-white/10 md:mt-32" />

          <div data-home-animate className="py-20 md:py-28">
            <div className="grid gap-6 border-b border-white/10 pb-8 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)] lg:items-end">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">
                  {COPY.homeAcceptsTitle}
                </p>
                <h2 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] tracking-tight text-text sm:text-6xl md:text-7xl">
                  Built for the sale, the pass, and the door.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-relaxed text-muted font-sans md:text-base">
                Willcall keeps the buyer path short and the organizer loop complete: payment, proof, live demand, and entry all stay connected.
              </p>
            </div>

            <div className="grid border-b border-white/10 lg:grid-cols-4">
              {SUPPORT_ITEMS.map(({ icon: Icon, label, body }, index) => (
                <article
                  key={label}
                  className="group min-h-[16rem] border-b border-white/10 py-7 transition-colors hover:bg-white/[0.025] lg:border-b-0 lg:border-r lg:px-6 lg:last:border-r-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-xs text-electric">{`${index + 1}.0`}</span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-acid transition-colors group-hover:border-nav-accent/40 group-hover:text-nav-accent">
                      <Icon className="h-5 w-5" strokeWidth={1.6} />
                    </span>
                  </div>
                  <h3 className="mt-14 font-sans text-3xl font-semibold leading-none tracking-tight text-text">
                    {label}
                  </h3>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted font-sans">
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div data-home-rule className="h-px w-full bg-white/10" />

          <div data-home-animate className="py-20 md:py-28">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(440px,1fr)] lg:gap-24">
              <div className="lg:sticky lg:top-28 lg:self-start">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                  Buyer trust
                </p>
                <h2 className="mt-8 max-w-2xl font-display text-6xl leading-[0.9] tracking-tight text-text sm:text-7xl md:text-8xl">
                  The ticket should feel held before they pay.
                </h2>
              </div>

              <div className="divide-y divide-white/10 border-y border-white/10">
                {HOME_BUYER_FEATURES.map((item, index) => (
                  <article
                    key={item.title}
                    className="group grid gap-6 py-8 transition-colors hover:bg-white/[0.025] sm:grid-cols-[72px_minmax(0,1fr)] sm:px-5 md:py-10"
                  >
                    <span className="font-mono text-sm text-acid">{`${index + 1}.0`}</span>
                    <div className="grid gap-3 md:grid-cols-[0.8fr_1fr] md:gap-8">
                      <h3 className="font-sans text-3xl font-semibold leading-none tracking-tight text-text">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted font-sans">
                        {item.body}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div data-home-animate className="relative mt-4 overflow-hidden border-y border-white/10 py-16 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,0.84fr)_minmax(420px,1fr)] lg:gap-20">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">
                  {COPY.forOrganizers}
                </p>
                <h2 className="mt-6 max-w-2xl font-display text-5xl leading-[0.95] tracking-tight text-text sm:text-6xl md:text-7xl">
                  Launch the drop.
                  <span className="block text-electric">Know when it moves.</span>
                </h2>
              </div>

              <div className="grid gap-6">
                <p className="max-w-xl text-sm leading-relaxed text-muted font-sans md:text-base">
                  Willcall gives organizers one command view for tiers, promos, live sell-through, guest lookup, and door scan. No spreadsheet handoff when the room starts filling.
                </p>

                <div className="grid border-y border-white/10 sm:grid-cols-3">
                  {[
                    ['01', 'Drop tiers', 'Timed releases and capacity checks.'],
                    ['02', 'Demand read', 'Fill rate, revenue, and buyer pace.'],
                    ['03', 'Door loop', 'Scan, lookup, and validate in one flow.'],
                  ].map(([number, title, body]) => (
                    <div key={title} className="border-b border-white/10 py-5 sm:border-b-0 sm:border-r sm:px-5 sm:last:border-r-0">
                      <p className="font-mono text-xs text-acid">{number}</p>
                      <h3 className="mt-3 font-sans text-xl font-semibold tracking-tight text-text">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted font-sans">{body}</p>
                    </div>
                  ))}
                </div>

                <Button
                  href={session && isOrganizer ? '/dashboard' : '/organizers'}
                  variant="outline"
                  className="w-full shrink-0 sm:w-max"
                >
                  {session && isOrganizer ? COPY.commandCenter : COPY.organizers}
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
