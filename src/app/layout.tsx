import type { Metadata } from 'next'
import { DM_Sans, JetBrains_Mono, Fraunces, Afacad } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import { Providers } from '@/components/Providers'
import { TRPCProvider } from '@/components/TRPCProvider'
import { BRAND, brandTitle } from '@/lib/brand'
import { siteConfig } from '@/lib/seo'

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

const display = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  axes: ['opsz', 'SOFT', 'WONK'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: brandTitle(),
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.tagline,
  applicationName: BRAND.name,
  icons: {
    icon: [
      { url: '/brand/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/brand/icon-180x180.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    siteName: BRAND.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
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
          <Providers>{children}</Providers>
        </TRPCProvider>
      </body>
    </html>
  )
}
