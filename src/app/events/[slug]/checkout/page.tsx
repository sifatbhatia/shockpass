'use client'

import { useState, useMemo } from 'react'
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
    <ul className="grid gap-3 text-xs text-muted font-sans grid-cols-2 sm:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-3 rounded-[14px] border border-border/60 bg-panel/30 px-3 h-14"
        >
          <span
            className={`trust-icon-sheet ${item.icon} h-8 w-8 shrink-0 rounded-full bg-bg`}
            aria-hidden
          />
          <span className="leading-tight">{item.label}</span>
        </li>
      ))}
    </ul>
  )
}

function OrderStub({
  tierName,
  eventTitle,
  venueName,
  eventDate,
  posterUrl,
  qty,
  subtotal,
  fees,
  discount,
  total,
}: {
  tierName: string
  eventTitle?: string
  venueName?: string
  eventDate?: string
  posterUrl?: string | null
  qty: number
  subtotal: number
  fees: number
  discount: number
  total: number
}) {
  return (
    <div className="rounded-[24px] border border-border/60 bg-gradient-to-b from-panel/90 to-panel-2/60 shadow-panel overflow-hidden">
      {(eventTitle || posterUrl) && (
        <div className="relative h-28 w-full">
          {posterUrl ? (
            <Image src={posterUrl} alt="" fill unoptimized className="object-cover" />
          ) : (
            <div className="absolute inset-0 skeleton-shimmer" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-panel/90 via-panel/60 to-transparent" />
          {eventTitle && (
            <div className="absolute bottom-3 left-6 right-6">
              <SectionLabel>Your hold</SectionLabel>
              <p className="font-display text-xl leading-tight tracking-tight line-clamp-1">{eventTitle}</p>
            </div>
          )}
        </div>
      )}
      <div className="relative p-6">
        <span className="pass-notch-left" aria-hidden />
        <span className="pass-notch-right" aria-hidden />
        {venueName && (
          <p className="text-xs text-muted font-sans mb-1">{venueName}</p>
        )}
        {eventDate && (
          <p className="text-xs text-muted font-sans mb-3">{eventDate}</p>
        )}
        <p className="font-semibold font-sans">{tierName}</p>
        <p className="mt-0.5 text-xs text-muted font-sans">
          {qty} ticket{qty > 1 ? 's' : ''}
        </p>
        <div className="my-4 border-t border-dashed border-border/60" />
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
    </div>
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
  const [promoInput, setPromoInput] = useState('')
  const [promoCode, setPromoCode] = useState('')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [orderMeta, setOrderMeta] = useState<{
    orderId: string
    paymentIntentId: string
    walletAccessToken: string
    holdExpiresAt: Date | null
  } | null>(null)
  const [errors, setErrors] = useState<{ email?: string; name?: string }>({})

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

  const subtotal = (pricing.data?.subtotalCents ?? 0) / 100
  const fees = (pricing.data?.feesCents ?? 0) / 100
  const total = (pricing.data?.totalCents ?? 0) / 100
  const discount = (pricing.data?.discountCents ?? 0) / 100
  const step = clientSecret ? 'pay' : 'hold'

  const promoStatus = useMemo(() => {
    if (!promoCode) return 'idle'
    if (pricing.isFetching) return 'applying'
    if (pricing.data?.discountCents && pricing.data.discountCents > 0) return 'applied'
    if (pricing.data?.promoError) return 'invalid'
    return 'applying'
  }, [promoCode, pricing.isFetching, pricing.data?.discountCents, pricing.data?.promoError])

  const validate = () => {
    const newErrors: { email?: string; name?: string } = {}
    if (!email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email format'
    if (!name) newErrors.name = 'Name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStartCheckout = () => {
    if (!tierId || !tier) return
    if (!validate()) return
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

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return
    setPromoCode(promoInput.trim())
  }

  const handleRemovePromo = () => {
    setPromoCode('')
    setPromoInput('')
  }

  const formattedDate = event?.startsAt
    ? new Date(event.startsAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : undefined

  const ctaLabel =
    step === 'hold'
      ? `Continue to payment · $${total.toFixed(2)}`
      : `Pay $${total.toFixed(2)}`

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
      <div className="mx-auto max-w-[1120px]">
        {/* Mobile bottom bar — step 1 only */}
        {step === 'hold' && (
          <div className="fixed bottom-0 left-0 right-0 z-90 bg-bg/86 backdrop-blur-lg border-t border-border/60 px-4 py-3 pb-[env(safe-area-inset-bottom,16px)] lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-lg font-sans tabular-nums">${total.toFixed(2)}</span>
              <Button
                className="flex-1 h-14 rounded-[999px] bg-acid text-bg hover:bg-[#ff6f3d] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-acid/60 disabled:text-muted disabled:hover:bg-acid/60 disabled:hover:translate-y-0 shadow-glow-acid text-sm font-semibold"
                onClick={handleStartCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? 'Holding…' : ctaLabel}
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          {/* Form column */}
          <div className="animate-fade-up order-2 lg:order-1">
            {/* Step indicator */}
            <StepIndicator
              steps={CHECKOUT_STEPS}
              current={step}
              className="mb-6"
            />

            {step === 'hold' ? (
              <>
                <h1 className="font-display text-4xl tracking-tight md:text-5xl">{COPY.lockTickets}</h1>
                <p className="mt-2 text-sm text-muted text-pretty font-sans">
                  Enter your details to lock your tickets.
                </p>

                <div className="mt-8 space-y-5">
                  <div>
                    <Label className="text-[11px] font-mono uppercase tracking-wider text-muted">
                      Email <span className="text-danger">*</span>
                    </Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })) }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-[52px] rounded-[13px]"
                      error={!!errors.email}
                    />
                    {errors.email && <FieldHint error>{errors.email}</FieldHint>}
                  </div>
                  <div>
                    <Label className="text-[11px] font-mono uppercase tracking-wider text-muted">
                      Name <span className="text-danger">*</span>
                    </Label>
                    <Input
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })) }}
                      placeholder="Your name"
                      autoComplete="name"
                      className="h-[52px] rounded-[13px]"
                      error={!!errors.name}
                    />
                    {errors.name && <FieldHint error>{errors.name}</FieldHint>}
                  </div>
                  <div>
                    <Label className="text-[11px] font-mono uppercase tracking-wider text-muted">
                      Phone <span className="text-muted-deep">(optional)</span>
                    </Label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      className="h-[52px] rounded-[13px]"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-mono uppercase tracking-wider text-muted">
                      Promo code
                    </Label>
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <Input
                        mono
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="MAYA20"
                        className="h-[52px] rounded-[13px]"
                        disabled={promoStatus === 'applied'}
                      />
                      {promoStatus === 'applied' ? (
                        <button
                          onClick={handleRemovePromo}
                          className="h-[52px] px-5 rounded-[13px] text-sm font-medium text-danger border border-danger/30 hover:bg-danger/10 transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          onClick={handleApplyPromo}
                          disabled={!promoInput.trim() || promoStatus === 'applying'}
                          className="h-[52px] px-5 rounded-[13px] text-sm font-medium bg-acid/10 text-acid border border-acid/30 hover:bg-acid/20 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                        >
                          {promoStatus === 'applying' ? (
                            <span className="inline-block w-4 h-4 border-2 border-acid/30 border-t-acid rounded-full animate-spin" />
                          ) : (
                            'Apply'
                          )}
                        </button>
                      )}
                    </div>
                    {promoStatus === 'applied' && (
                      <FieldHint>{promoCode} applied</FieldHint>
                    )}
                    {promoStatus === 'invalid' && pricing.data?.promoError && (
                      <FieldHint error>{pricing.data.promoError}</FieldHint>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-display text-4xl tracking-tight md:text-5xl">Pay securely</h1>
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
                        buttonLabel={`Pay $${total.toFixed(2)}`}
                        disabled={createOrder.isPending}
                      />
                    </Elements>
                  )}
                </Panel>
              </>
            )}
          </div>

          {/* Summary column */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-[112px] lg:self-start animate-fade-up">
            <OrderStub
              tierName={tier.name}
              eventTitle={event?.title}
              venueName={event?.venueName}
              eventDate={formattedDate}
              posterUrl={event?.posterUrl}
              qty={qty}
              subtotal={subtotal}
              fees={fees}
              discount={discount}
              total={total}
            />
            {step === 'hold' && (
              <>
                <Button
                  className="mt-4 hidden lg:flex w-full h-14 rounded-[999px] bg-acid text-bg hover:bg-[#ff6f3d] hover:-translate-y-0.5 active:translate-y-0 disabled:bg-acid/60 disabled:text-muted disabled:hover:bg-acid/60 disabled:hover:translate-y-0 shadow-glow-acid text-sm font-semibold"
                  onClick={handleStartCheckout}
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? 'Holding…' : ctaLabel}
                </Button>
                <p className="hidden lg:block text-xs text-center text-muted mt-3 leading-relaxed">
                  No account required. Your pass lands in your wallet after payment.
                </p>
              </>
            )}
          </aside>
        </div>

        {/* Trust badges */}
        <div className="mt-12 border-t border-border/40 pt-8">
          <TrustStrip />
        </div>
      </div>
    </AppShell>
  )
}
