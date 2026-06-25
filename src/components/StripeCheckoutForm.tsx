'use client'

import { useEffect, useState } from 'react'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

type StripePaymentFormProps = {
  walletAccessToken: string
  onSuccess: (walletAccessToken: string, paymentIntentId: string) => void
  buttonLabel?: string
  disabled?: boolean
}

export function StripePaymentForm({
  walletAccessToken,
  onSuccess,
  buttonLabel = 'Pay now',
  disabled,
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
        disabled={!stripe || loading || disabled}
        className="w-full h-14 rounded-[999px] bg-acid text-bg font-semibold text-sm hover:bg-[#ff6f3d] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:text-muted disabled:hover:bg-acid disabled:hover:translate-y-0 transition-all duration-200"
      >
        {loading ? 'Processing...' : buttonLabel}
      </button>
      <p className="text-xs text-muted text-center">Apple Pay / Google Pay available where supported</p>
    </div>
  )
}

export function HoldTimer({ expiresAt }: { expiresAt: Date | string }) {
  const [remaining, setRemaining] = useState('')
  const [state, setState] = useState<'normal' | 'warm' | 'urgent' | 'expired'>('normal')

  useEffect(() => {
    const target = new Date(expiresAt).getTime()
    const tick = () => {
      const diff = target - Date.now()
      if (diff <= 0) {
        setRemaining('0:00')
        setState('expired')
        return
      }
      const totalSeconds = Math.floor(diff / 1000)
      const m = Math.floor(totalSeconds / 60)
      const s = totalSeconds % 60
      setRemaining(`${m}:${s.toString().padStart(2, '0')}`)

      if (totalSeconds <= 30) setState('urgent')
      else if (totalSeconds <= 120) setState('warm')
      else setState('normal')
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  const stateStyles = {
    normal: 'text-acid',
    warm: 'text-[#ff9f66]',
    urgent: 'text-danger',
    expired: 'text-muted line-through',
  }

  return (
    <p className="text-sm text-muted text-pretty font-sans">
      Your ticket is held for{' '}
      <span className={`font-mono font-semibold tabular-nums ${stateStyles[state]}`}>
        {remaining}
      </span>
      . Complete checkout before the timer runs out.
    </p>
  )
}
