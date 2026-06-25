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
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(5,5,5,0.06)_0,rgba(5,5,5,0.06)_1px,transparent_1px,transparent_calc(100%/12))]" aria-hidden />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent_30%,rgba(5,5,5,0.04))]" aria-hidden />

      {/* Wordmark — subtle watermark at bottom */}
      <p
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none font-display font-medium leading-none tracking-[-0.06em] text-bg/10"
        style={{ bottom: 'clamp(8px, 1.5vw, 32px)', fontSize: 'clamp(140px, 24vw, 420px)', lineHeight: '0.72' }}
        aria-hidden
      >
        {BRAND.name}
      </p>

      {/* Content layer */}
      <div className="relative z-10 mx-auto max-w-[1480px] px-4 pt-20 pb-20 sm:px-6 md:px-8 md:pt-28 md:pb-28">
        {/* Top row: CTA + contact */}
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:gap-16">
          <section>
            <h2 className="max-w-[16ch] font-mono text-[clamp(2rem,3.6vw,4.8rem)] font-semibold uppercase leading-[1.02] tracking-normal text-bg">
              Ticket drops need momentum. Let&apos;s launch yours.
            </h2>
            <Link
              href="/dashboard/events/new"
              className="mt-8 inline-flex items-center gap-3 border-b-2 border-bg pb-1 font-mono text-base font-semibold uppercase tracking-normal transition-opacity hover:opacity-70 focus-ring md:text-lg"
            >
              Launch a drop
              <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
            </Link>
          </section>

          <div className="grid content-start gap-4 font-mono text-sm font-semibold uppercase leading-tight md:text-base">
            <a className="group inline-flex items-start gap-2 transition-opacity hover:opacity-70" href={`mailto:${BRAND.demoEmail}`}>
              <span aria-hidden>·</span>
              <span>{BRAND.demoEmail}</span>
            </a>
            <p className="inline-flex items-start gap-2">
              <span aria-hidden>·</span>
              <span>Los Angeles, CA</span>
            </p>
          </div>
        </div>

        {/* Link groups — below CTA with breathing room */}
        <div className="mt-20 grid gap-10 md:mt-28 md:grid-cols-3 md:gap-16 max-w-[900px]">
          <nav aria-label="Product">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bg/50 mb-3">Product</p>
            {PRIMARY_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="block w-fit font-mono text-xl font-semibold uppercase leading-[1.3] tracking-normal transition-opacity hover:opacity-65 focus-ring md:text-2xl">
                {link.label}
              </Link>
            ))}
          </nav>

          <nav aria-label="Social">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bg/50 mb-3">Social</p>
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="block w-fit font-mono text-lg font-semibold uppercase leading-[1.5] tracking-normal transition-opacity hover:opacity-65 focus-ring md:text-xl">
                {link.label}
              </a>
            ))}
          </nav>

          <nav aria-label="Legal">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bg/50 mb-3">Legal</p>
            {LEGAL_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="block w-fit font-mono text-lg font-semibold uppercase leading-[1.5] tracking-normal transition-opacity hover:opacity-65 focus-ring md:text-xl">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 mx-3 mb-3 flex min-h-7 items-center justify-between gap-2 rounded-[4px] bg-bg px-3 font-mono text-[11px] font-semibold uppercase leading-tight tracking-normal text-nav-accent sm:mx-4">
        <p>© 2026 · All rights reserved.</p>
        <a href="https://sifat.tech" target="_blank" rel="noreferrer" className="transition-colors hover:text-acid focus-ring">
          Site by Sift Design
        </a>
        <Link href="#" className="transition-colors hover:text-acid focus-ring">
          Back to top
        </Link>
      </div>
    </footer>
  )
}
