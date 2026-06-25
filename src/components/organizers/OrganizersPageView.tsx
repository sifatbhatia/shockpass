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
        autoAlpha: 0, y: 18, duration: 0.72, stagger: 0.08, ease: 'power3.out',
      })

      gsap.utils.toArray<HTMLElement>('[data-org-animate]').forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 32 },
          {
            autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out',
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
        {/* ─── Hero ─── */}
        <section className="relative -mt-[var(--nav-bar-height,4.5rem)] min-h-[min(70vh,600px)] overflow-hidden grain-overlay">
          <Image
            src="/assets/willcall-organizers-grid.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="100vw"
            className="object-cover opacity-84 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/75 via-bg/40 to-bg/95" />

          <div className="relative mx-auto flex min-h-[min(70vh,600px)] max-w-[1650px] flex-col items-center justify-center px-4 pt-[calc(var(--nav-bar-height,4.5rem)+1rem)] sm:px-6">
            <div className="flex flex-col items-center text-center max-w-3xl">
              <p data-org-hero className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent mb-4">
                For organizers
              </p>
              <h1 data-org-hero className="font-display text-balance text-5xl leading-[0.9] tracking-tight sm:text-6xl md:text-7xl lg:text-[4.5rem]">
                Launch the drop.
                <span className="block text-acid">Run the room.</span>
              </h1>
              <p data-org-hero className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
                Built for promoters, venues, and cultural rooms that need ticketing to feel as deliberate as the night itself.
              </p>
              <div data-org-hero className="mt-6 flex items-center justify-center gap-3">
                <Button href={launchHref} className="flex-1 sm:flex-none">
                  Launch a drop
                </Button>
                <Button href="/events" variant="ghost" className="flex-1 sm:flex-none text-muted hover:text-text">
                  See buyer side →
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Why organizers — three cards ─── */}
        <section className="mx-auto max-w-[1650px] px-4 py-16 sm:px-6 md:py-24">
          <div data-org-animate className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">Why organizers use it</p>
              <h2 className="mt-5 max-w-lg font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                More than a checkout link.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
                Willcall gives organizers one command view for tiers, promos, live sell-through, guest lookup, and door scan.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {ORGANIZER_VALUES.map((item) => (
                <article key={item.title} className="rounded-[20px] border border-white/10 bg-white/[0.035] p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.055] hover:-translate-y-0.5">
                  <Check className="mb-8 h-5 w-5 text-nav-accent" strokeWidth={1.7} />
                  <h3 className="font-sans text-xl font-semibold tracking-tight text-text">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          {/* ─── Workflow table ─── */}
          <div data-org-animate className="mt-16 overflow-hidden rounded-[20px] border border-white/10 bg-panel/36">
            <div className="grid border-b border-white/10 px-5 py-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted md:grid-cols-[0.7fr_1.15fr_1fr]">
              <span>Workflow</span>
              <span className="hidden md:block">What you control</span>
              <span className="hidden md:block">What improves</span>
            </div>
            {ORGANIZER_ROWS.map((row) => (
              <div key={row.feature} className="grid gap-4 border-b border-white/10 px-5 py-5 last:border-b-0 md:grid-cols-[0.7fr_1.15fr_1fr] md:gap-8 transition-colors hover:bg-white/[0.02]">
                <h3 className="font-sans text-xl font-semibold tracking-tight text-text">{row.feature}</h3>
                <p className="text-sm leading-relaxed text-text">{row.detail}</p>
                <p className="text-sm leading-relaxed text-muted">{row.result}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Operating system ─── */}
        <section className="border-y border-white/10 bg-panel/24">
          <div className="mx-auto grid max-w-[1650px] gap-8 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
            <div data-org-animate>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-acid">
                Operating system
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                Launch, sell, read, scan.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                The public page and the organizer hub share the same truth: capacity, orders, tiers, wallet passes, and door state.
              </p>
            </div>
            <div data-org-animate className="grid gap-3 sm:grid-cols-2">
              {OPERATING_STACK.map(({ icon: Icon, title, body }) => (
                <article key={title} className="rounded-[20px] border border-white/10 bg-bg/72 p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:-translate-y-0.5">
                  <Icon className="mb-8 h-5 w-5 text-acid" strokeWidth={1.6} />
                  <h3 className="font-sans text-2xl font-semibold tracking-tight text-text">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="mx-auto max-w-[1650px] px-4 py-16 sm:px-6 md:py-24">
          <div data-org-animate className="flex flex-col items-center text-center gap-6 rounded-[24px] border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-8 sm:p-12 md:p-16">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-nav-accent">
              Ready to show it
            </p>
            <h2 className="max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
              Open a polished sales room in minutes.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              Start with a poster and the first tier. Willcall handles the buyer flow, pass delivery, and the door.
            </p>
            <Button href={launchHref} className="mt-2">
              Launch a drop
              <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={2} />
            </Button>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
