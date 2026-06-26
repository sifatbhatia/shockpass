import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono, DM_Serif_Display, Afacad } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import { Providers } from '@/components/Providers'
import { TRPCProvider } from '@/components/TRPCProvider'
import { BRAND, brandTitle } from '@/lib/brand'
import { siteConfig } from '@/lib/seo'
import { GlimmProvider, InterceptLinks } from 'glimm/next'

const sans = DM_Sans({
  variable: '--font-inter',
  subsets: ['latin'],
})

const afacad = Afacad({
  variable: '--font-afacad',
  subsets: ['latin'],
})

const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

const display = DM_Serif_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: brandTitle(),
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  applicationName: BRAND.name,
  creator: 'Sift Design',
  publisher: BRAND.name,
  category: 'event ticketing',
  keywords: ['Willcall', 'ticket drops', 'event ticketing', 'wallet passes', 'door scanning'],
  alternates: {
    canonical: siteConfig.url,
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/brand/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/brand/icon-180x180.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: brandTitle(),
    description: BRAND.tagline,
    url: siteConfig.url,
    siteName: BRAND.name,
    locale: 'en_US',
    type: 'website',
    images: [{ url: siteConfig.ogImage, width: 512, height: 512, alt: `${BRAND.name} ticket logo` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: brandTitle(),
    description: BRAND.tagline,
    images: [siteConfig.ogImage],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${afacad.variable} ${mono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="h-full bg-bg text-text font-sans">
        <TRPCProvider>
          <Providers>
            <GlimmProvider palette="prism">
              <InterceptLinks />
              {children}
            </GlimmProvider>
          </Providers>
        </TRPCProvider>
      </body>
    </html>
  )
}
