import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata.events()

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return children
}
