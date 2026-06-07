import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/events'],
        disallow: ['/dashboard', '/wallet', '/scan', '/auth', '/tickets', '/api'],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  }
}
