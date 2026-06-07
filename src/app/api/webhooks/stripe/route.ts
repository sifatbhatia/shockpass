import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { fulfillOrder } from '@/lib/order-fulfillment'
import { isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook signature or secret' }, { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-05-27.dahlia',
  })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    const order = await prisma.order.findFirst({
      where: { stripePaymentIntentId: paymentIntent.id },
    })
    if (order && order.paymentStatus !== 'PAID') {
      await prisma.order.update({
        where: { id: order.id },
        data: { stripeChargeId: paymentIntent.latest_charge as string },
      })
      await fulfillOrder(order.id)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: paymentIntent.id, paymentStatus: 'PENDING' },
      data: { paymentStatus: 'FAILED' },
    })
  }

  return NextResponse.json({ received: true })
}
