import { pageMetadata } from '@/lib/seo'
import { DashboardGate } from './DashboardGate'

export const metadata = pageMetadata.dashboard()

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardGate>{children}</DashboardGate>
}
