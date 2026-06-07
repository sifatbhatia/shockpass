import { OrganizersPageView } from '@/components/organizers/OrganizersPageView'
import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata.organizers()

export default function OrganizersPage() {
  return <OrganizersPageView />
}
