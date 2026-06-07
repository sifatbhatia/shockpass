import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata.scan()

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return children
}
