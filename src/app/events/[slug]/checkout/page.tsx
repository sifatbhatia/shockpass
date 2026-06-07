'use client'

import { useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { AppShell } from '@/components/AppShell'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldHint } from '@/components/ui/Input'
import { StepIndicator } from '@/components/ui/StepIndicator'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { PassSkeleton } from '@/components/ui/Skeleton'
import { HoldTimer, StripePaymentForm } from '@/components/StripeCheckoutForm'
import { trpc } from '@/trpc/client'
import { COPY } from '@/lib/copy'
import toast from 'react-hot-toast'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const CHECKOUT_STEPS = [
  { id: 'hold', label: 'Hold' },
  { id: 'pay', label: 'Pay' },
]

function TrustStrip() {
  const items = [
    { label: COPY.trustSecure, icon: 'trust-icon-lock' },
    { label: COPY.trustInstant, icon: 'trust-icon-wallet' },
    { label: 'Fast checkout', icon: 'trust-icon-fast' },
    { label: COPY.trustNoAccount, icon: 'trust-icon-guest' },
  ]

  return (
    <ul className="grid gap-3 text-xs text-muted font-sans sm:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-3 rounded-drop border border-border bg-panel/45 px-3 py-2.5"
        >
          <span
            className={`trust-icon-sheet ${item.icon} h-8 w-8 shrink-0 rounded-full bg-bg`}
            aria-hidden
          />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  )
}

function OrderStub({
  tierName,
  eventTitle,
  posterUrl,
  qty,
  subtotal,
  fees,
  discount,
  total,
}: {
  tierName: string
  eventTitle?: string
  posterUrl?: string | null
  qty: number
  subtotal: number
  fees: number
  discount: number
  total: number
}) {
  return (
    <Panel className="relative overflow-hidden shadow-panel">
      {(eventTitle || posterUrl) && (
        <div className="relative h-28 w-full">
          {posterUrl ? (
            <Image src={posterUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/70 to-transparent" />
          {eventTitle && (
            <div className="absolute bottom-3 left-5 right-5">
              <SectionLabel>Your hold</SectionLabel>
              <p className="font-display text-xl leading-tight tracking-tight line-clamp-1">{eventTitle}</p>
            </div>
          )}
        </div>
      )}
      <div className="relative p-5">
        <span className="pass-notch-left" aria-hidden />
        <span className="pass-notch-right" aria-hidden />
        <p className="font-semibold font-sans">{tierName}</p>
        <p className="mt-0.5 text-xs text-muted font-sans">
          {qty} ticket{qty > 1 ? 's' : ''}
        </p>
        <div className="my-4 border-t border-dashed border-border" />
        <dl className="space-y-2 text-sm font-sans">
          <div className="flex justify-between text-muted">
            <dt>Subtotal</dt>
            <dd className="font-mono">${subtotal.toFixed(2)}</dd>
          </div>
          <div className="flex justify-between text-muted">
            <dt>Fees</dt>
            <dd className="font-mono">${fees.toFixed(2)}</dd>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <dt>Promo</dt>
              <dd className="font-mono">−${discount.toFixed(2)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 font-semibold text-text">
            <dt>Total</dt>
            <dd className="font-mono text-lg text-acid">${total.toFixed(2)}</dd>
          </div>
        </dl>
      </div>
    </Panel>
  )
}

export default function CheckoutPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const tierId = searchParams.get('tier')
  const qty = parseInt(searchParams.get('qty') || '1', 10)

  const { data: tier } = trpc.ticket.getTier.useQuery({ id: tierId || '' }, { enabled: !!tierId })
  const { data: event } = trpc.event.getBySlug.useQuery({ slug }, { enabled: !!slug })
  const { data: availability } = trpc.ticket.checkAvailability.useQuery(
    { tierId: tierId || '', quantity: qty },
    { enabled: !!tierId }
  )

  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderMeta, setOrderMeta] = useState<{
    orderId: string
    paymentIntentId: string
    walletAccessToken: string
    holdExpiresAt: Date | null
  } | null>(null)

  const pricing = trpc.order.previewPricing.useQuery(
    {
      eventId: tier?.eventId || '',
      ticketTierId: tierId || '',
      quantity: qty,
      promoCode: promoCode || undefined,
    },
    { enabled: !!tier?.eventId && !!tierId }
  )

  const confirmOrder = trpc.order.confirm.useMutation()

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      if (data.demoCheckout) {
        toast.success('Tickets issued')
        router.push(`/wallet?access=${data.walletAccessToken}`)
        return
      }
      setClientSecret(data.clientSecret)
      setOrderMeta({
        orderId: data.orderId,
        paymentIntentId: (data as { paymentIntentId?: string }).paymentIntentId || '',
        walletAccessToken: data.walletAccessToken || '',
        holdExpiresAt: data.holdExpiresAt ? new Date(data.holdExpiresAt) : null,
      })
      toast.success('Tickets held — complete payment')
    },
    onError: (e) => toast.error(e.message),
  })

  const handleStartCheckout = () => {
    if (!tierId || !tier) return
    createOrder.mutate({
      eventId: tier.eventId,
      ticketTierId: tierId,
      quantity: qty,
      buyerEmail: email,
      buyerName: name || undefined,
      buyerPhone: phone || undefined,
      promoCode: promoCode || undefined,
    })
  }

  const handlePaymentSuccess = async (walletAccessToken: string, paymentIntentId: string) => {
    if (!orderMeta) return
    try {
      await confirmOrder.mutateAsync({
        orderId: orderMeta.orderId,
        paymentIntentId,
        walletAccessToken,
      })
      toast.success('Payment confirmed')
      router.push(`/wallet?access=${walletAccessToken}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not confirm order')
    }
  }

  const subtotal = (pricing.data?.subtotalCents ?? 0) / 100
  const fees = (pricing.data?.feesCents ?? 0) / 100
  const total = (pricing.data?.totalCents ?? 0) / 100
  const discount = (pricing.data?.discountCents ?? 0) / 100
  const step = clientSecret ? 'pay' : 'hold'

  if (!tier || !availability) {
    return (
      <AppShell mainClassName="max-w-lg px-6 py-12" footer={false}>
        <PassSkeleton />
      </AppShell>
    )
  }

  if (!availability.canPurchase) {
    return (
      <AppShell footer={false}>
        <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
          <div className="animate-fade-up">
            <h1 className="font-display text-4xl tracking-tight mb-2">Not available</h1>
            <Link href={`/events/${slug}`} className="focus-ring text-sm text-acid hover:underline font-sans">
              {COPY.getTickets}
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell mainClassName="px-6 py-10 md:py-14" footer={false}>
      <div className="mx-auto max-w-5xl">
        <StepIndicator steps={CHECKOUT_STEPS} current={step} className="mb-10 max-w-md mx-auto md:mx-0" />

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
          <div className="animate-fade-up order-2 lg:order-1">
            {step === 'hold' ? (
              <>
                <h1 className="font-display text-4xl tracking-tight md:text-5xl">{COPY.lockTickets}</h1>
                <p className="mt-2 text-sm text-muted text-pretty font-sans">{COPY.holdWarning}</p>

                <div className="mt-8 space-y-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
                  </div>
                  <div>
                    <Label>Promo code</Label>
                    <Input
                      mono
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="MAYA20"
                    />
                    {pricing.data?.promoError && (
                      <FieldHint error>{pricing.data.promoError}</FieldHint>
                    )}
                  </div>
                </div>

                <Button
                  className="mt-8 w-full lg:hidden"
                  onClick={handleStartCheckout}
                  disabled={createOrder.isPending || !email}
                >
                  {createOrder.isPending ? 'Holding…' : `Hold · $${total.toFixed(2)}`}
                </Button>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl tracking-tight md:text-5xl">{COPY.payNow}</h1>
                {orderMeta?.holdExpiresAt && (
                  <div className="mt-3">
                    <HoldTimer expiresAt={orderMeta.holdExpiresAt} />
                  </div>
                )}

                <Panel glow="acid" className="mt-8 p-6">
                  {stripePromise && orderMeta && clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripePaymentForm
                        walletAccessToken={orderMeta.walletAccessToken}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  )}
                </Panel>
              </>
            )}
          </div>

          <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start animate-fade-up">
            <OrderStub
              tierName={tier.name}
              eventTitle={event?.title}
              posterUrl={event?.posterUrl}
              qty={qty}
              subtotal={subtotal}
              fees={fees}
              discount={discount}
              total={total}
            />
            {step === 'hold' && (
              <Button
                className="mt-4 hidden w-full lg:flex"
                onClick={handleStartCheckout}
                disabled={createOrder.isPending || !email}
              >
                {createOrder.isPending ? 'Holding…' : `Hold · $${total.toFixed(2)}`}
              </Button>
            )}
          </aside>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <TrustStrip />
        </div>
      </div>
    </AppShell>
  )
}
