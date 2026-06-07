import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata.auth()

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
