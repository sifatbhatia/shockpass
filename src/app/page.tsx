import { pageMetadata } from '@/lib/seo'
import { HomePageView } from '@/components/home/HomePageView'

export const metadata = pageMetadata.home()

export default function HomePage() {
  return <HomePageView />
}
