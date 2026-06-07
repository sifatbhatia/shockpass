import { COPY } from '@/lib/copy'
import { brandTitle } from '@/lib/brand'
import { buildPageMetadata } from '@/lib/seo'

export const metadata = buildPageMetadata({
  title: brandTitle(COPY.completeOrder),
  description: COPY.secureCheckout,
  path: '/events/checkout',
  noIndex: true,
})

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
