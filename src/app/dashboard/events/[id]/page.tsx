'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AppShell } from '@/components/AppShell'
import { Panel } from '@/components/ui/Panel'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { SellThroughBar } from '@/components/SellThroughBar'
import { trpc } from '@/trpc/client'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { COPY } from '@/lib/copy'
import { cn } from '@/lib/cn'
import {
  ArrowRight, Copy, DollarSign, Download, Plus, Ticket, TrendingUp, Users, Percent
} from 'lucide-react'

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

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
  const [promoForm, setPromoForm] = useState({ code: '', discountType: 'PERCENT' as 'PERCENT' | 'FIXED', discountValue: 10 })

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

  const ticketsSold = analytics?.metrics.ticketsSold || 0
  const totalCapacity = event.capacity || 1
  const pctSold = Math.min((ticketsSold / totalCapacity) * 100, 100)
  const remaining = Math.max(totalCapacity - ticketsSold, 0)
  const grossSales = analytics?.metrics.grossSales || 0
  const netRevenue = analytics?.metrics.netRevenue || 0
  const checkedIn = scanStats?.checkedIn || 0
  const checkInRate = ticketsSold > 0 ? Math.round((checkedIn / ticketsSold) * 100) : 0

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 md:py-10">
        {/* ── Event Masthead ── */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl leading-[1.05]">{event.title}</h1>
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider font-sans',
                event.status === 'LIVE' ? 'border-success/40 bg-success/10 text-success' :
                event.status === 'DRAFT' ? 'border-muted/30 bg-muted/10 text-muted' :
                event.status === 'SCHEDULED' ? 'border-acid/30 bg-acid/10 text-acid' :
                'border-muted/20 bg-muted/10 text-muted-deep'
              )}>
                {event.status === 'LIVE' && <span className="h-1.5 w-1.5 rounded-full bg-success animate-live-pulse" />}
                {event.status}
              </span>
            </div>
            <p className="text-sm text-muted font-sans">
              {event.venueName} · {event.city} · {format(new Date(event.startsAt), 'MMM d, yyyy · h:mm a')}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted font-mono">
              <span>{ticketsSold} sold</span>
              <span>{checkedIn} checked in</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button variant="ghost" href={`/events/${event.slug}`} className="text-sm">
              Preview
            </Button>
            <Button variant="electric" href={`/scan?event=${event.id}`} className="text-sm">
              {COPY.doorScanner}
            </Button>
            {event.status === 'DRAFT' && (
              <Button variant="outline" onClick={() => publishEvent.mutate({ id })} className="text-sm">Publish</Button>
            )}
            {(event.status === 'DRAFT' || event.status === 'SCHEDULED') && (
              <Button onClick={() => goLive.mutate({ id })} className="text-sm">Go live</Button>
            )}
            {event.status !== 'CANCELLED' && event.status !== 'COMPLETED' && (
              <Button variant="hot" onClick={() => cancelEvent.mutate({ id })} className="text-sm">Cancel</Button>
            )}
          </div>
        </div>

        {/* ── Sell-through + Next Action ── */}
        <div className="grid gap-6 mb-8 md:grid-cols-[1fr_380px]">
          <Panel className="p-5 sm:p-6">
            <h3 className="font-sans text-sm font-semibold text-text mb-3">Sell-through</h3>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-mono text-2xl font-semibold text-text">{ticketsSold}</span>
              <span className="text-sm text-muted font-sans">of {totalCapacity} tickets sold</span>
            </div>
            <p className="text-xs text-muted font-sans mb-3">
              {pctSold.toFixed(1)}% sold through · {remaining} remaining
            </p>
            <SellThroughBar sold={ticketsSold} capacity={totalCapacity} />
            {ticketsSold === 0 && (
              <p className="text-xs text-muted font-sans mt-3 italic">
                No tickets sold yet — the bar above shows zero. Share the drop to get moving.
              </p>
            )}
          </Panel>

          <Panel className="p-5 sm:p-6">
            <h3 className="font-sans text-sm font-semibold text-text mb-3">Next action</h3>
            <p className="text-sm text-muted font-sans leading-relaxed mb-4">
              {ticketsSold === 0
                ? 'No tickets sold yet. Share the drop link or create a promo code to build momentum.'
                : ticketsSold < 10
                  ? `Only ${ticketsSold} ticket${ticketsSold === 1 ? ' has' : 's have'} sold so far. Share the drop link or create an incentive to build momentum.`
                  : 'Drops are moving. Keep sharing the link and consider opening more tiers.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/events/${event.slug}`)
                  toast.success('Link copied')
                }}
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy drop link
              </Button>
              <Button
                variant="outline"
                className="text-sm"
                onClick={() => document.getElementById('promo-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Percent className="h-3.5 w-3.5 mr-1.5" />
                Create promo code
              </Button>
            </div>
          </Panel>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Gross sales</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{formatCurrency(grossSales)}</p>
            <p className="text-[11px] text-muted font-sans mt-0.5">Total revenue</p>
          </Panel>
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Net revenue</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{formatCurrency(netRevenue)}</p>
            <p className="text-[11px] text-muted font-sans mt-0.5">After platform fees</p>
          </Panel>
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Tickets sold</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{ticketsSold}</p>
            <p className="text-[11px] text-muted font-sans mt-0.5">{remaining} remaining</p>
          </Panel>
          <Panel className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">Check-in rate</p>
            <p className="font-mono text-xl font-semibold text-text sm:text-2xl">{checkInRate}%</p>
            <p className="text-[11px] text-muted font-sans mt-0.5">{checkedIn} checked in</p>
          </Panel>
        </div>

        {/* ── Sales Velocity ── */}
        <Panel className="p-5 sm:p-6 mb-8">
          <h3 className="font-sans text-sm font-semibold text-text mb-4">Sales velocity</h3>
          {ticketsSold === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <TrendingUp className="h-8 w-8 text-muted-deep mb-3" strokeWidth={1.5} />
              <p className="text-sm text-muted font-sans">No tickets sold yet</p>
              <p className="text-xs text-muted-deep font-sans mt-1">Sales data will appear here once tickets start moving.</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-muted font-sans mb-4">
                {ticketsSold} ticket{ticketsSold !== 1 ? 's' : ''} sold in the last 14 days
              </p>
              <div className="flex items-end gap-1 h-24">
                {[...Array(14)].map((_, i) => {
                  const isLast = i === 13
                  const val = isLast && ticketsSold > 0 ? Math.min(ticketsSold, 5) : 0
                  const h = val > 0 ? Math.max(8, (val / 5) * 100) : 4
                  return (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm transition-all"
                      style={{
                        height: `${h}%`,
                        backgroundColor: isLast && val > 0 ? 'var(--color-acid)' : 'var(--color-panel-2)',
                        opacity: isLast && val > 0 ? 1 : 0.3,
                      }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-muted-deep font-mono">
                <span>14 days ago</span>
                <span>Today</span>
              </div>
            </div>
          )}
        </Panel>

        {/* ── Ticket Tiers ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-tight">{COPY.ticketTiers}</h2>
            <Button
              variant="outline"
              className="text-sm"
              onClick={() => setShowAddTier(!showAddTier)}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add tier
            </Button>
          </div>

          {showAddTier && (
            <Panel className="p-5 mb-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 mb-4">
                <div>
                  <Label>Name</Label>
                  <Input id="tier-name" value={tierForm.name} onChange={e => setTierForm({ ...tierForm, name: e.target.value })} placeholder="Early Bird" />
                </div>
                <div>
                  <Label>Price ($)</Label>
                  <Input id="tier-price" type="number" step="0.01" value={tierForm.priceDollars} onChange={e => setTierForm({ ...tierForm, priceDollars: parseFloat(e.target.value) || 0 })} mono />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input id="tier-qty" type="number" value={tierForm.quantityTotal} onChange={e => setTierForm({ ...tierForm, quantityTotal: parseInt(e.target.value) || 0 })} mono />
                </div>
                <div>
                  <Label>Max per order</Label>
                  <Input id="tier-max" type="number" value={tierForm.maxPerOrder} onChange={e => setTierForm({ ...tierForm, maxPerOrder: parseInt(e.target.value) || 0 })} mono />
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

          {/* Tier table header (desktop) */}
          <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr] gap-4 px-5 py-3 border-b border-border font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <span>Tier</span>
            <span>Price</span>
            <span>Sold</span>
            <span>Revenue</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-border">
            {event.ticketTiers.map((tier) => (
              <div key={tier.id} className="grid sm:grid-cols-[2fr_1fr_1.2fr_1.2fr_1fr] gap-3 sm:gap-4 px-0 sm:px-5 py-4 items-center">
                <div>
                  <p className="font-sans text-sm font-semibold text-text">{tier.name}</p>
                  <p className="text-xs text-muted font-sans sm:hidden">{formatCurrency(tier.priceCents)}</p>
                </div>
                <p className="hidden sm:block font-mono text-sm text-text">{formatCurrency(tier.priceCents)}</p>
                <div>
                  <p className="font-mono text-sm text-text">{tier.quantitySold} / {tier.quantityTotal}</p>
                  <div className="h-1 w-full rounded-full bg-panel-2 mt-1 max-w-[120px]">
                    <div
                      className="h-full rounded-full bg-acid transition-all"
                      style={{ width: `${tier.quantityTotal > 0 ? (tier.quantitySold / tier.quantityTotal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <p className="font-mono text-sm text-text">{formatCurrency(tier.priceCents * tier.quantitySold)}</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider font-sans',
                    tier.status === 'ON_SALE' ? 'border-success/40 bg-success/10 text-success' :
                    tier.status === 'SOLD_OUT' ? 'border-hot/30 bg-hot/10 text-hot' :
                    'border-muted/20 bg-muted/10 text-muted'
                  )}>
                    {tier.status === 'ON_SALE' ? 'On sale' : tier.status.replace('_', ' ')}
                  </span>
                  {tier.status !== 'ON_SALE' && tier.status !== 'SOLD_OUT' && (
                    <button onClick={() => openTier.mutate({ id: tier.id })} className="text-[11px] text-acid hover:underline font-sans">{COPY.openSales}</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Sales by Tier + Track Demand ── */}
        <div className="grid gap-6 mb-8 md:grid-cols-2">
          <Panel className="p-5 sm:p-6">
            <h2 className="font-display text-xl tracking-tight mb-4">{COPY.salesByTier}</h2>
            {analytics?.salesByTier && analytics.salesByTier.length > 0 ? (
              <div className="space-y-3">
                {analytics.salesByTier.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-sans text-text truncate">{tier.name}</p>
                      <p className="text-xs text-muted font-mono">{tier.count} sold</p>
                    </div>
                    <p className="font-mono text-sm text-text shrink-0">{formatCurrency(tier.revenue)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Ticket className="h-8 w-8 text-muted-deep mb-3" strokeWidth={1.5} />
                <p className="text-sm text-muted font-sans">No sales yet</p>
                <p className="text-xs text-muted-deep font-sans mt-1">Sales data will appear here once tickets start moving.</p>
              </div>
            )}
          </Panel>

          <Panel className="p-5 sm:p-6">
            <h2 className="font-display text-xl tracking-tight mb-4">Attendee management</h2>
            <p className="text-sm text-muted font-sans mb-4">Search buyers, filter by status, or export attendee data for your door team.</p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" href={`/dashboard/events/${id}/attendees`} className="text-sm">
                <Users className="h-3.5 w-3.5 mr-1.5" />
                View buyers
              </Button>
              <Button variant="outline" className="text-sm">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export CSV
              </Button>
            </div>
          </Panel>
        </div>

        {/* ── Promo Codes ── */}
        <div id="promo-section" className="mb-8">
          <h2 className="font-display text-2xl tracking-tight mb-4">{COPY.promoCodes}</h2>
          <Panel className="p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_120px_auto] items-end mb-5">
              <div>
                <Label>Code</Label>
                <Input
                  id="promo-code"
                  mono
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. EARLYBIRD"
                />
              </div>
              <div>
                <Label>Discount</Label>
                <Input
                  id="promo-discount"
                  type="number"
                  value={promoForm.discountValue}
                  onChange={(e) => setPromoForm({ ...promoForm, discountValue: parseInt(e.target.value) || 0 })}
                  placeholder="10"
                  mono
                />
              </div>
              <div>
                  <Label>Type</Label>
                  <Select
                    options={[
                      { value: 'PERCENT', label: 'Percent' },
                      { value: 'FIXED', label: 'Fixed amount' },
                    ]}
                    value={promoForm.discountType}
                    onChange={(v) => setPromoForm({ ...promoForm, discountType: v as 'PERCENT' | 'FIXED' })}
                  />
                </div>
              <Button
                onClick={() => createPromo.mutate({ eventId: id, code: promoForm.code, discountType: promoForm.discountType, discountValue: promoForm.discountValue })}
                disabled={!promoForm.code}
                className="text-sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                {COPY.createPromo}
              </Button>
            </div>

            {promos && promos.length > 0 ? (
              <div className="space-y-2">
                {promos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2.5 border-t border-border first:border-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-text">{p.code}</span>
                      <span className="text-xs text-muted font-mono">{p.discountType === 'PERCENT' ? `${p.discountValue}% off` : `$${(p.discountValue / 100).toFixed(2)} off`}</span>
                    </div>
                    <span className="text-xs text-muted font-sans">{p.usedCount} used</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Percent className="h-6 w-6 text-muted-deep mb-2" strokeWidth={1.5} />
                <p className="text-sm text-muted font-sans">No promo codes yet</p>
                <p className="text-xs text-muted-deep font-sans mt-1">Create one above to start offering discounts.</p>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  )
}
