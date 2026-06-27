import type { inferRouterOutputs } from '@trpc/server'
import type { AppRouter } from '@/trpc/routers/_app'
import { pageMetadata } from '@/lib/seo'
import { serverCaller } from '@/trpc/server'
import { HomePageView } from '@/components/home/HomePageView'

export const metadata = pageMetadata.home()
export const dynamic = 'force-dynamic'

type EventListOutput = inferRouterOutputs<AppRouter>['event']['list']
export type HomePageEventItem = EventListOutput['events'][number]

export default async function HomePage() {
  const caller = await serverCaller()
  let initialEvents: HomePageEventItem[] = []
  try {
    const result = await caller.event.list({ limit: 12 })
    initialEvents = result.events
  } catch (error) {
    console.error('[HomePage] Failed to fetch events:', error)
  }
  return <HomePageView initialEvents={initialEvents} />
}
