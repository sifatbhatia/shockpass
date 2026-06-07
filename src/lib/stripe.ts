import Stripe from 'stripe'

const STRIPE_API_VERSION = '2026-05-27.dahlia'

export function isStripeConfigured(): boolean {
  const key = process.env.STRIPE_SECRET_KEY
  return Boolean(key && key.startsWith('sk_') && !key.includes('your_stripe_secret_key'))
}

export function createStripeClient(connectedAccountId?: string): Stripe {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE_API_VERSION,
    stripeAccount: connectedAccountId,
  })
}

export function createStripeConnectClient(): Stripe {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: STRIPE_API_VERSION,
  })
}
