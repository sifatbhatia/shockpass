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
  { label: 'Terms of services', href: '/' },
] as const

export function SiteFooter() {
  return (
    <footer className="relative isolate min-h-screen overflow-hidden bg-nav-accent text-bg">
      <div
        className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(5,5,5,0.08)_0,rgba(5,5,5,0.08)_1px,transparent_1px,transparent_calc(100%/12))]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_34%,rgba(5,5,5,0.05))]" aria-hidden />

      <div className="relative mx-auto grid min-h-screen max-w-[1920px] grid-rows-[1fr_auto] px-5 pt-28 sm:px-8 md:px-12 md:pt-32 lg:pt-24">
        <div className="relative z-10 grid gap-12 pb-40 md:grid-cols-12 md:gap-8 md:pb-48 lg:gap-6 lg:pb-56">
          <section className="md:col-span-10 lg:col-span-7">
            <h2 className="max-w-[20ch] font-mono text-[clamp(3rem,4.5vw,5.8rem)] font-semibold uppercase leading-[1.02] tracking-normal text-bg lg:max-w-[21ch]">
              Good rooms take good partners. Let&apos;s talk
            </h2>

            <Link
              href="/organizers"
              className="mt-10 inline-flex items-center gap-3 border-b-2 border-bg pb-1 font-mono text-xl font-semibold uppercase tracking-normal transition-opacity hover:opacity-70 focus-ring md:text-2xl"
            >
              Partner with us
              <ArrowRight className="h-6 w-6" strokeWidth={2.25} />
            </Link>
          </section>

          <div className="hidden lg:block" />

          <div className="hidden content-start gap-10 font-mono text-lg font-semibold uppercase leading-tight lg:col-span-6 lg:grid lg:grid-cols-3 lg:pt-3">
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
            className="self-end font-mono text-[2rem] font-semibold uppercase leading-[1.18] tracking-normal md:col-span-4 md:text-[2.5rem] lg:col-span-3"
          >
            {PRIMARY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="block w-fit transition-opacity hover:opacity-65 focus-ring">
                {link.label}
              </Link>
            ))}
          </nav>

          <nav
            aria-label="Social"
            className="self-end font-mono text-xl font-semibold uppercase leading-[1.55] tracking-normal md:col-span-4 md:col-start-7 md:text-2xl lg:col-span-3 lg:col-start-8"
          >
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="block w-fit transition-opacity hover:opacity-65 focus-ring">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="grid content-end gap-10 font-mono text-xl font-semibold uppercase leading-[1.35] tracking-normal md:col-span-4 md:col-start-1 md:row-start-3 md:text-2xl lg:hidden">
            <a href={`mailto:${BRAND.demoEmail}`} className="w-fit transition-opacity hover:opacity-65 focus-ring">
              {BRAND.demoEmail}
            </a>
            <p>
              Los Angeles
              <br />
              California, USA
            </p>
          </div>

          <nav
            aria-label="Legal"
            className="self-end font-mono text-xl font-semibold uppercase leading-[1.35] tracking-normal md:col-span-4 md:col-start-7 md:text-2xl lg:col-span-3 lg:col-start-11 lg:row-start-2"
          >
            {LEGAL_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="block w-fit transition-opacity hover:opacity-65 focus-ring">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <p
          className="pointer-events-none absolute -bottom-[0.24em] left-5 right-5 z-0 select-none font-display text-[clamp(10rem,30vw,40rem)] font-medium leading-none tracking-normal text-bg sm:left-8 sm:right-8 md:left-12 md:right-12"
          aria-hidden
        >
          {BRAND.name}
        </p>

        <div className="relative z-10 -mx-5 grid min-h-12 items-center gap-3 bg-bg px-5 py-3 font-mono text-sm font-semibold uppercase leading-tight tracking-normal text-text sm:-mx-8 sm:px-8 md:-mx-12 md:grid-cols-3 md:px-12">
          <p>© 2026 · All rights reserved.</p>
          <p className="md:text-center">Site by {BRAND.name}</p>
          <Link href="#" className="w-fit transition-colors hover:text-nav-accent focus-ring md:ml-auto">
            Back to top
          </Link>
        </div>
      </div>
    </footer>
  )
}
