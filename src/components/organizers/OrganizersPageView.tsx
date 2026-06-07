'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, Check, Shield, Sparkles, Ticket, Users } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { Button } from '@/components/ui/Button'
import { COPY } from '@/lib/copy'

gsap.registerPlugin(ScrollTrigger)

const ORGANIZER_VALUES = [
  {
    title: 'Drop pages that sell',
    body: 'Poster, room story, pricing, urgency, and ticket tiers all live on one page designed for conversion.',
  },
  {
    title: 'Checkout without drag',
    body: 'Guest checkout, short holds, clear fees, and wallet passes keep buyers moving while demand is hot.',
  },
  {
    title: 'Door-ready operations',
    body: 'Rotating QR, search, VIP states, and scan history give staff a calmer door without extra software.',
  },
] as const

const ORGANIZER_ROWS = [
  {
    feature: 'Launch',
    detail: 'Publish a polished drop with poster art, venue details, city, capacity, and tiered releases.',
    result: 'A public page that feels finished before the first buyer lands.',
  },
  {
    feature: 'Sell',
    detail: 'Open and close tiers, run promo codes, hold tickets briefly, and collect Stripe payments.',
    result: 'Less checkout friction, fewer abandoned buyers.',
  },
  {
    feature: 'Operate',
    detail: 'See fill rate, revenue, attendee lists, and scan results from the organizer hub.',
    result: 'One source of truth for the room.',
  },
] as const

const OPERATING_STACK = [
  { icon: Sparkles, title: 'Launch', body: 'Build the drop page, set tiers, choose a poster, then publish when the room is ready.' },
  { icon: Ticket, title: 'Sell', body: 'Guest checkout, holds, promos, Stripe payments, and wallet-ready tickets.' },
  { icon: Users, title: 'Read', body: 'Track capacity, paid orders, tier fill, and waitlist pressure from the hub.' },
  { icon: Shield, title: 'Scan', body: 'Validate rotating QR passes, search guests, and handle the door without switching systems.' },
] as const

export function OrganizersPageView() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { status } = useSession()
  const launchHref =
    status === 'unauthenticated'
      ? '/auth?tab=signup&callbackUrl=/dashboard/events/new'
      : '/dashboard/events/new'

  useGSAP(
    () => {
      gsap.from('[data-org-hero]', {
        autoAlpha: 0,
        y: 18,
        duration: 0.72,
        stagger: 0.08,
        ease: 'power3.out',
      })

      gsap.utils.toArray<HTMLElement>('[data-org-animate]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 84%', once: true },
          }
        )
      })
    },
    { scope: rootRef }
  )

  return (
    <AppShell heroUnderNav>
      <div ref={rootRef} className="bg-bg">
        <section className="relative -mt-[var(--nav-bar-height,4.5rem)] min-h-[min(92vh,820px)] overflow-hidden grain-overlay stage-vignette">
          <Image
            src="/assets/scan-success-moment.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover opacity-56 saturate-110"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,0.86)_34%,rgba(5,5,5,0.48)_68%,#050505_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.62)_0%,rgba(5,5,5,0.2)_30%,#050505_100%)]" />

          <div className="relative mx-auto flex min-h-[min(92vh,820px)] max-w-[1650px] flex-col justify-end px-4 pb-10 pt-[calc(var(--nav-bar-height,4.5rem)+2rem)] sm:px-6 sm:pb-16">
            <div className="max-w-5xl">
              <p data-org-hero className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">
                For organizers
              </p>
              <h1 data-org-hero className="mt-5 max-w-4xl font-display text-balance text-6xl leading-[0.9] tracking-tight sm:text-7xl md:text-8xl">
                Launch the drop.
                <span className="block text-acid">Run the room.</span>
              </h1>
              <p data-org-hero className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
                Willcall gives promoters and venues a premium ticketing flow: sharp event pages, fast checkout, wallet passes, live capacity, and scanner-ready entry.
              </p>
              <div data-org-hero className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button href={launchHref}>{COPY.launchADrop}</Button>
                <Button href="/events" variant="ghost">
                  See buyer side
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1650px] px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div data-org-animate className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">Why organizers use it</p>
              <h2 className="mt-5 max-w-lg font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
                More than a checkout link.
              </h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {ORGANIZER_VALUES.map((item) => (
                <article key={item.title} className="rounded-pass border border-white/10 bg-white/[0.035] p-5">
                  <Check className="mb-8 h-5 w-5 text-nav-accent" strokeWidth={1.7} />
                  <h3 className="font-sans text-xl font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div data-org-animate className="mt-14 overflow-hidden rounded-pass border border-white/10 bg-panel/36">
            <div className="grid border-b border-white/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted md:grid-cols-[0.7fr_1.15fr_1fr]">
              <span>Workflow</span>
              <span className="hidden md:block">What you control</span>
              <span className="hidden md:block">What improves</span>
            </div>
            {ORGANIZER_ROWS.map((row) => (
              <div key={row.feature} className="grid gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[0.7fr_1.15fr_1fr] md:gap-8">
                <h3 className="font-sans text-xl font-semibold tracking-tight text-text">{row.feature}</h3>
                <p className="text-sm leading-relaxed text-text">{row.detail}</p>
                <p className="text-sm leading-relaxed text-muted">{row.result}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-panel/24">
          <div className="mx-auto grid max-w-[1650px] gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div data-org-animate>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-electric">
                Operating system
              </p>
              <h2 className="mt-5 max-w-xl font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
                Launch, sell, read, scan.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
                The public page and the organizer hub share the same truth: capacity, orders, tiers, wallet passes, and door state.
              </p>
            </div>
            <div data-org-animate className="grid gap-3 sm:grid-cols-2">
              {OPERATING_STACK.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-pass border border-white/10 bg-bg/72 p-5">
                  <Icon className="mb-8 h-5 w-5 text-acid" strokeWidth={1.6} />
                  <h3 className="font-sans text-2xl font-semibold tracking-tight">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1650px] px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div data-org-animate className="grid gap-8 rounded-pass border border-white/10 bg-[radial-gradient(ellipse_at_16%_0%,rgba(248,214,247,0.13),transparent_38%),rgba(255,255,255,0.035)] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">
                Ready to show it
              </p>
              <h2 className="mt-5 max-w-4xl font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
                Open a polished sales room in minutes.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
                Start with a poster and the first tier. Willcall handles the buyer flow, pass delivery, and the door.
              </p>
            </div>
            <Link
              href={launchHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-nav-accent px-6 py-3 text-sm font-medium text-bg transition-[background,transform] hover:bg-acid active:scale-[0.98] focus-ring"
            >
              Launch a drop
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
