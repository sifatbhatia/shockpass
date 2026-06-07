'use client'

import { useEffect, useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { COPY } from '@/lib/copy'

type StripePaymentFormProps = {
  walletAccessToken: string
  onSuccess: (walletAccessToken: string, paymentIntentId: string) => void
}

export function StripePaymentForm({
  walletAccessToken,
  onSuccess,
}: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handlePay = async () => {
    if (!stripe || !elements) return
    setLoading(true)
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })
      if (error) {
        toast.error(error.message || 'Payment failed')
        return
      }
      if (paymentIntent?.status === 'succeeded') {
        onSuccess(walletAccessToken, paymentIntent.id)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      <button
        type="button"
        onClick={handlePay}
        disabled={!stripe || loading}
        className="w-full bg-acid text-bg py-3.5 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50"
      >
        {loading ? 'Processing...' : COPY.payNow}
      </button>
      <p className="text-xs text-muted text-center">Apple Pay / Google Pay available where supported</p>
    </div>
  )
}

export function HoldTimer({ expiresAt }: { expiresAt: Date | string }) {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const target = new Date(expiresAt).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) {
        setRemaining('Expired')
        return
      }
      const m = Math.floor(diff / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return (
    <div className="rounded-pass border border-hot/40 bg-hot/10 px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-muted mb-1">Hold expires</p>
      <span className="font-display text-3xl text-hot tabular-nums">{remaining}</span>
    </div>
  )
}
