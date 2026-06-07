'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { Panel } from '@/components/ui/Panel'
import { StatTile } from '@/components/ui/StatTile'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { InsightCard } from '@/components/dashboard/InsightCard'
import { SalesVelocityChart } from '@/components/dashboard/SalesVelocityChart'
import { SellThroughBar } from '@/components/SellThroughBar'
import { trpc } from '@/trpc/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { COPY } from '@/lib/copy'

export default function EventManagePage() {
  const { id } = useParams<{ id: string }>()
  const utils = trpc.useUtils()
  const { data: session } = useSession()
  const isOrganizer = session?.user?.role === 'ORGANIZER' || session?.user?.role === 'ADMIN'

  const { data: event, isLoading } = trpc.event.getById.useQuery({ id })
  const { data: analytics } = trpc.organizer.dashboard.useQuery(
    { eventId: id },
    { enabled: !!event && isOrganizer }
  )
  const { data: scanStats } = trpc.scan.stats.useQuery(
    { eventId: id },
    { enabled: !!event && isOrganizer }
  )
  const { data: promos, refetch: refetchPromos } = trpc.promo.list.useQuery(
    { eventId: id },
    { enabled: !!event && isOrganizer }
  )

  const publishEvent = trpc.event.publish.useMutation({
    onSuccess: () => { utils.event.getById.invalidate(); toast.success('Event published') },
    onError: (e) => toast.error(e.message),
  })
  const goLive = trpc.event.goLive.useMutation({
    onSuccess: () => { utils.event.getById.invalidate(); toast.success('Event is live!') },
    onError: (e) => toast.error(e.message),
  })
  const cancelEvent = trpc.event.cancel.useMutation({
    onSuccess: () => { utils.event.getById.invalidate(); toast.success('Event cancelled') },
    onError: (e) => toast.error(e.message),
  })
  const openTier = trpc.ticket.openSales.useMutation({
    onSuccess: () => { utils.event.getById.invalidate(); toast.success('Tier opened') },
    onError: (e) => toast.error(e.message),
  })

  const [showAddTier, setShowAddTier] = useState(false)
  const [tierForm, setTierForm] = useState({
    name: '', description: '', priceDollars: 35, quantityTotal: 100, maxPerOrder: 10,
  })
  const [promoForm, setPromoForm] = useState({ code: '', discountType: 'PERCENT' as const, discountValue: 10 })

  const createPromo = trpc.promo.create.useMutation({
    onSuccess: () => { refetchPromos(); toast.success('Promo created'); setPromoForm({ code: '', discountType: 'PERCENT', discountValue: 10 }) },
    onError: (e) => toast.error(e.message),
  })

  const createTier = trpc.ticket.create.useMutation({
    onSuccess: () => {
      utils.event.getById.invalidate()
      setShowAddTier(false)
      setTierForm({ name: '', description: '', priceDollars: 35, quantityTotal: 100, maxPerOrder: 10 })
      toast.success('Tier created')
    },
    onError: (e) => toast.error(e.message),
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-acid border-t-transparent rounded-full animate-spin" /></div>
  if (!event) return <div className="min-h-screen flex items-center justify-center"><p className="text-muted">Event not found</p></div>

  const tierInsights = event.ticketTiers.map((t) => ({
    name: t.name,
    count: t.quantitySold,
    quantityTotal: t.quantityTotal,
    quantitySold: t.quantitySold,
  }))

  return (
    <AppShell>
      <div className="max-w-[1650px] mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display text-4xl tracking-tight mb-1">{event.title}</h1>
            <p className="text-muted text-sm font-mono">{event.venueName} · {format(new Date(event.startsAt), 'MMM d, yyyy · h:mm a')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {event.status === 'DRAFT' && <Button variant="outline" onClick={() => publishEvent.mutate({ id })}>Publish</Button>}
            {(event.status === 'DRAFT' || event.status === 'SCHEDULED') && (
              <Button onClick={() => goLive.mutate({ id })}>Go live</Button>
            )}
            {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
              <Button variant="hot" onClick={() => cancelEvent.mutate({ id })}>Cancel</Button>
            )}
            <Button variant="ghost" href={`/events/${event.slug}`}>Preview</Button>
            <Button variant="electric" href={`/scan?event=${event.id}`}>{COPY.doorScanner}</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 space-y-6">
            <Panel className="p-5">
              <SellThroughBar sold={analytics?.metrics.ticketsSold || 0} capacity={event.capacity} />
            </Panel>
            {analytics && (
              <InsightCard tiers={tierInsights} capacityFilled={analytics.metrics.capacityFilled} />
            )}
          </div>
          <Panel className="p-5">
            {analytics?.salesChart && <SalesVelocityChart data={analytics.salesChart} />}
          </Panel>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <StatTile label="Gross sales" value={`$${((analytics?.metrics.grossSales || 0) / 100).toLocaleString()}`} />
          <StatTile label="Net revenue" value={`$${((analytics?.metrics.netRevenue || 0) / 100).toLocaleString()}`} />
          <StatTile label="Tickets sold" value={analytics?.metrics.ticketsSold || 0} hot />
          <StatTile label="Check-in rate" value={`${scanStats?.checkInRate.toFixed(0) || '0'}%`} />
        </div>

        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-tight">{COPY.ticketTiers}</h2>
            <button onClick={() => setShowAddTier(!showAddTier)} className="text-sm text-acid hover:underline">
              {showAddTier ? 'Cancel' : '+ Add tier'}
            </button>
          </div>

          {showAddTier && (
            <Panel className="p-5 mb-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Name</Label>
                  <Input value={tierForm.name} onChange={e => setTierForm({ ...tierForm, name: e.target.value })} placeholder="Early Bird" />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tierForm.priceDollars}
                    onChange={e => setTierForm({ ...tierForm, priceDollars: parseFloat(e.target.value) || 0 })}
                    mono
                  />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" value={tierForm.quantityTotal} onChange={e => setTierForm({ ...tierForm, quantityTotal: parseInt(e.target.value) || 0 })} mono />
                </div>
                <div>
                  <Label>Max per order</Label>
                  <Input type="number" value={tierForm.maxPerOrder} onChange={e => setTierForm({ ...tierForm, maxPerOrder: parseInt(e.target.value) || 0 })} mono />
                </div>
              </div>
              <Button onClick={() => createTier.mutate({
                eventId: id,
                name: tierForm.name,
                description: tierForm.description,
                priceCents: Math.round(tierForm.priceDollars * 100),
                quantityTotal: tierForm.quantityTotal,
                maxPerOrder: tierForm.maxPerOrder,
              })}>
                Create tier
              </Button>
            </Panel>
          )}

          <div className="space-y-3">
            {event.ticketTiers.map((tier) => (
              <Panel key={tier.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-display text-lg tracking-tight">{tier.name}</p>
                  <p className="text-xs text-muted font-mono">${(tier.priceCents / 100).toFixed(2)} · {tier.quantitySold}/{tier.quantityTotal} sold</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tier.status === 'ON_SALE' ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'
                  }`}>{tier.status.replace('_', ' ')}</span>
                  {tier.status !== 'ON_SALE' && tier.status !== 'SOLD_OUT' && (
                    <button onClick={() => openTier.mutate({ id: tier.id })} className="text-xs text-acid hover:underline">{COPY.openSales}</button>
                  )}
                </div>
              </Panel>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Panel className="p-5">
            <h2 className="font-display text-2xl tracking-tight mb-4">{COPY.salesByTier}</h2>
            {analytics?.salesByTier.length ? analytics.salesByTier.map((tier) => (
              <div key={tier.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm">{tier.name}</span>
                <span className="text-sm font-mono">{tier.count} · ${(tier.revenue / 100).toFixed(2)}</span>
              </div>
            )) : <p className="text-muted text-sm">No sales yet</p>}
          </Panel>

          <div className="space-y-3">
            <Link href={`/dashboard/events/${id}/attendees`} className="block">
              <Panel className="p-5 hover:border-acid/30 transition-colors">
                <p className="font-display text-lg tracking-tight mb-1">{COPY.trackDemand}</p>
                <p className="text-sm text-muted">Search buyers, filter status, {COPY.exportAttendees.toLowerCase()}</p>
              </Panel>
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-2xl tracking-tight mb-4">{COPY.promoCodes}</h2>
          <Panel className="p-5">
            <div className="grid md:grid-cols-4 gap-3 mb-3">
              <Input mono value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} placeholder="CODE" />
              <Input type="number" value={promoForm.discountValue} onChange={(e) => setPromoForm({ ...promoForm, discountValue: parseInt(e.target.value) || 0 })} placeholder="Discount" mono />
              <Button onClick={() => createPromo.mutate({ eventId: id, ...promoForm })}>{COPY.createPromo}</Button>
            </div>
            <div className="space-y-2">
              {promos?.map((p) => (
                <div key={p.id} className="flex justify-between text-sm border-t border-border pt-2">
                  <span className="font-mono">{p.code}</span>
                  <span className="text-muted">{p.discountType === 'PERCENT' ? `${p.discountValue}%` : `$${p.discountValue / 100}`} · {p.usedCount} used</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
