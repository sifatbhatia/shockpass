import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BRAND } from '@/lib/brand'

const PRIMARY_LINKS = [
  { label: 'Drops', href: '/events' },
  { label: 'Organizers', href: '/organizers' },
  { label: 'Wallet', href: '/wallet' },
  { label: 'Scanner', href: '/scan' },
] as const

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com' },
  { label: 'X (Twitter)', href: 'https://x.com' },
] as const

const LEGAL_LINKS = [
  { label: 'Privacy policy', href: '/' },
  { label: 'Terms of service', href: '/' },
] as const

export function SiteFooter() {
  return (
    <footer className="relative isolate min-h-screen overflow-hidden bg-nav-accent text-bg">
      <div
        className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(5,5,5,0.08)_0,rgba(5,5,5,0.08)_1px,transparent_1px,transparent_calc(100%/12))]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_34%,rgba(5,5,5,0.05))]" aria-hidden />

      <div className="relative mx-auto grid min-h-screen max-w-[1650px] grid-rows-[1fr_auto] px-4 pt-24 sm:px-6 md:pt-28 lg:pt-20">
        <div className="relative z-10 grid gap-y-14 pb-40 md:grid-cols-12 md:gap-x-8 md:pb-48 lg:gap-x-6 lg:pb-52">
          <section className="md:col-span-8 lg:col-span-7">
            <h2 className="max-w-[18ch] font-mono text-[clamp(3rem,4.6vw,6rem)] font-semibold uppercase leading-[1.02] tracking-normal text-bg">
              Ticket drops need momentum. Let&apos;s launch yours.
            </h2>

            <Link
              href="/dashboard/events/new"
              className="mt-10 inline-flex items-center gap-3 border-b-2 border-bg pb-1 font-mono text-xl font-semibold uppercase tracking-normal transition-opacity hover:opacity-70 focus-ring md:text-2xl"
            >
              Launch a drop
              <ArrowRight className="h-6 w-6" strokeWidth={2.25} />
            </Link>
          </section>

          <div className="grid content-start gap-6 font-mono text-base font-semibold uppercase leading-tight md:col-span-4 md:pt-2 lg:col-span-4 lg:col-start-9 lg:grid-cols-2">
            <a className="group inline-flex items-start gap-2 transition-opacity hover:opacity-70" href={`mailto:${BRAND.demoEmail}`}>
              <span aria-hidden>•</span>
              <span>{BRAND.demoEmail}</span>
            </a>
            <p className="inline-flex items-start gap-2">
              <span aria-hidden>•</span>
              <span>Los Angeles, CA</span>
            </p>
          </div>

          <nav
            aria-label="Footer primary"
            className="self-start font-mono text-[2rem] font-semibold uppercase leading-[1.18] tracking-normal md:col-span-3 md:row-start-2 md:text-[2.35rem]"
          >
            {PRIMARY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="block w-fit transition-opacity hover:opacity-65 focus-ring">
                {link.label}
              </Link>
            ))}
          </nav>

          <nav
            aria-label="Social"
            className="self-start font-mono text-xl font-semibold uppercase leading-[1.55] tracking-normal md:col-span-3 md:col-start-7 md:row-start-2 md:text-2xl"
          >
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="block w-fit transition-opacity hover:opacity-65 focus-ring">
                {link.label}
              </a>
            ))}
          </nav>

          <nav
            aria-label="Legal"
            className="self-start font-mono text-xl font-semibold uppercase leading-[1.35] tracking-normal md:col-span-3 md:col-start-10 md:row-start-2 md:text-2xl"
          >
            {LEGAL_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="block w-fit transition-opacity hover:opacity-65 focus-ring">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p
          className="pointer-events-none absolute bottom-[0.03em] left-1/2 z-0 hidden w-max -translate-x-1/2 select-none font-display text-[clamp(12rem,22vw,30rem)] font-medium leading-none tracking-normal text-bg md:block"
          aria-hidden
        >
          {BRAND.name}
        </p>

        <div className="relative z-10 -mx-4 grid min-h-12 items-center gap-3 bg-bg px-4 py-3 font-mono text-sm font-semibold uppercase leading-tight tracking-normal text-text sm:-mx-6 sm:px-6 md:grid-cols-3">
          <p>© 2026 · All rights reserved.</p>
          <a
            href="https://sifat.tech"
            target="_blank"
            rel="noreferrer"
            className="w-fit transition-colors hover:text-nav-accent focus-ring md:mx-auto"
          >
            Site by Sift Design
          </a>
          <Link href="#" className="w-fit transition-colors hover:text-nav-accent focus-ring md:ml-auto">
            Back to top
          </Link>
        </div>
      </div>
    </footer>
  )
}
