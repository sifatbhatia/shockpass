import { z } from 'zod'
import { publicProcedure, protectedProcedure, organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { createStripeClient, isStripeConfigured } from '@/lib/stripe'
import { generateIdempotencyKey } from '@/utils/crypto'
import { assertRateLimit } from '@/lib/rate-limit'
import { DEMO_EVENTS, getDemoTierById } from '@/lib/demo-events'
import {
  expireStaleHolds,
  fulfillOrder,
  getReservedQuantity,
  holdExpiresAtFromNow,
} from '@/lib/order-fulfillment'

const createOrderSchema = z.object({
  eventId: z.string(),
  ticketTierId: z.string(),
  quantity: z.number().int().positive().max(10),
  buyerEmail: z.string().email(),
  buyerName: z.string().optional(),
  buyerPhone: z.string().optional(),
  promoCode: z.string().optional(),
  referralCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
})

async function resolveBuyer(email: string, name?: string) {
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        authProvider: 'EMAIL',
        role: 'ATTENDEE',
      },
    })
  }
  return user
}

async function computePricing(
  eventId: string,
  tierId: string,
  quantity: number,
  promoCodeInput?: string
) {
  let tier = null
  try {
    tier = await prisma.ticketTier.findUnique({ where: { id: tierId } })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[order.computePricing] Database unavailable, checking demo tier:', error)
    }
  }
  if (!tier) {
    tier = getDemoTierById(tierId)
  }
  if (!tier || tier.eventId !== eventId) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })
  }

  let discountCents = 0
  let promoCodeId: string | undefined
  let promoError: string | undefined

  if (promoCodeInput) {
    const promo = await prisma.promoCode.findFirst({
      where: { eventId, code: promoCodeInput.toUpperCase() },
    })
    if (!promo) {
      promoError = 'Invalid promo code'
    } else if (promo.usedCount >= (promo.usageLimit ?? 999999)) {
      promoError = 'Promo code usage limit reached'
    } else if (promo.startsAt && promo.startsAt > new Date()) {
      promoError = 'Promo code not active yet'
    } else if (promo.endsAt && promo.endsAt < new Date()) {
      promoError = 'Promo code expired'
    } else if (promo.ticketTierId && promo.ticketTierId !== tierId) {
      promoError = 'Promo code not valid for this tier'
    } else {
      if (promo.discountType === 'PERCENT') {
        discountCents = Math.floor(tier.priceCents * quantity * (promo.discountValue / 100))
      } else {
        discountCents = Math.min(tier.priceCents * quantity, promo.discountValue * quantity)
      }
      promoCodeId = promo.id
    }
  }

  const subtotalCents = tier.priceCents * quantity
  const feesCents = Math.floor(subtotalCents * 0.029) + 30 * quantity
  const totalCents = Math.max(0, subtotalCents + feesCents - discountCents)

  return { tier, subtotalCents, feesCents, totalCents, discountCents, promoCodeId, promoError }
}

export const orderRouter = {
  previewPricing: publicProcedure
    .input(
      z.object({
        eventId: z.string(),
        ticketTierId: z.string(),
        quantity: z.number().int().positive().max(10),
        promoCode: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const pricing = await computePricing(
        input.eventId,
        input.ticketTierId,
        input.quantity,
        input.promoCode
      )
      return {
        subtotalCents: pricing.subtotalCents,
        feesCents: pricing.feesCents,
        totalCents: pricing.totalCents,
        discountCents: pricing.discountCents,
        promoValid: input.promoCode ? !pricing.promoError : undefined,
        promoError: pricing.promoError,
      }
    }),

  create: publicProcedure
    .input(createOrderSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        assertRateLimit(`checkout:${input.buyerEmail}`, 8, 60_000, 'Too many checkout attempts')
      } catch (e) {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: (e as Error).message })
      }

      const {
        eventId,
        ticketTierId,
        quantity,
        buyerEmail,
        buyerName,
        buyerPhone,
        promoCode: promoCodeInput,
        referralCode,
        idempotencyKey,
      } = input

      let event = null
      try {
        event = await prisma.event.findUnique({
          where: { id: eventId },
          include: { ticketTiers: true },
        })
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[order.create] Database unavailable, checking demo event:', error)
        }
      }
      const demoEvent = DEMO_EVENTS.find((item) => item.id === eventId)
      if (!event && demoEvent) {
        const pricing = await computePricing(eventId, ticketTierId, quantity, promoCodeInput)
        if (pricing.promoError && promoCodeInput) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: pricing.promoError })
        }
        const walletAccessToken = `demo_wallet_${ticketTierId}_${quantity}_${Date.now()}`
        return {
          orderId: `demo_order_${generateIdempotencyKey()}`,
          clientSecret: null,
          holdExpiresAt: null,
          walletAccessToken,
          demoCheckout: true,
        }
      }
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })

      const tier = event.ticketTiers.find((t) => t.id === ticketTierId)
      if (!tier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })

      if (tier.status !== 'ON_SALE') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Tickets not on sale' })
      }

      await expireStaleHolds(ticketTierId)
      const reserved = await getReservedQuantity(ticketTierId)
      const available = tier.quantityTotal - tier.quantitySold - reserved

      if (available < quantity) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Only ${available} tickets available` })
      }

      if (quantity > tier.maxPerOrder) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: `Max ${tier.maxPerOrder} tickets per order` })
      }

      const key = idempotencyKey || generateIdempotencyKey()
      const existingOrder = await prisma.order.findUnique({ where: { idempotencyKey: key } })
      if (existingOrder) {
        return {
          orderId: existingOrder.id,
          clientSecret: existingOrder.stripePaymentIntentId,
          holdExpiresAt: existingOrder.holdExpiresAt,
          walletAccessToken: existingOrder.walletAccessToken,
          demoCheckout: !isStripeConfigured(),
        }
      }

      const pricing = await computePricing(eventId, ticketTierId, quantity, promoCodeInput)
      if (pricing.promoError && promoCodeInput) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: pricing.promoError })
      }

      const buyer = ctx.user?.id
        ? await prisma.user.findUnique({ where: { id: ctx.user.id } }) || await resolveBuyer(buyerEmail, buyerName)
        : await resolveBuyer(buyerEmail, buyerName)

      const walletAccessToken = generateIdempotencyKey()
      const stripeReady = isStripeConfigured()

      const paymentIntent = stripeReady
        ? await createStripeClient(event.stripeAccountId || undefined).paymentIntents.create({
            amount: pricing.totalCents,
            currency: tier.currency.toLowerCase(),
            metadata: {
              orderIdempotencyKey: key,
              eventId,
              ticketTierId,
              quantity: quantity.toString(),
              buyerEmail,
            },
            automatic_payment_methods: { enabled: true },
          })
        : null

      const order = await prisma.order.create({
        data: {
          eventId,
          ticketTierId,
          buyerId: buyer.id,
          buyerEmail,
          buyerName,
          buyerPhone,
          quantity,
          holdExpiresAt: holdExpiresAtFromNow(),
          walletAccessToken,
          subtotalCents: pricing.subtotalCents,
          feesCents: pricing.feesCents,
          totalCents: pricing.totalCents,
          paymentStatus: stripeReady ? 'PENDING' : 'PENDING',
          stripePaymentIntentId: paymentIntent?.id ?? `demo_pi_${key}`,
          idempotencyKey: key,
          promoCodeId: pricing.promoCodeId,
          referralCode,
        },
      })

      if (!stripeReady) {
        await fulfillOrder(order.id)
        return {
          orderId: order.id,
          clientSecret: null,
          holdExpiresAt: null,
          walletAccessToken,
          demoCheckout: true,
        }
      }

      return {
        orderId: order.id,
        clientSecret: paymentIntent?.client_secret ?? null,
        paymentIntentId: paymentIntent?.id ?? null,
        holdExpiresAt: order.holdExpiresAt,
        walletAccessToken,
        demoCheckout: false,
      }
    }),

  confirm: publicProcedure
    .input(
      z.object({
        orderId: z.string(),
        paymentIntentId: z.string(),
        walletAccessToken: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: { event: true },
      })
      if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })

      const authorized =
        (ctx.user && (order.buyerId === ctx.user.id || ctx.user.role === 'ADMIN')) ||
        (input.walletAccessToken && input.walletAccessToken === order.walletAccessToken)

      if (!authorized) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      if (order.paymentStatus === 'PAID') {
        return { success: true, orderId: order.id, walletAccessToken: order.walletAccessToken }
      }

      const stripe = createStripeClient(order.event.stripeAccountId || undefined)
      const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId)

      if (paymentIntent.status !== 'succeeded') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment not completed' })
      }

      await prisma.order.update({
        where: { id: order.id },
        data: { stripeChargeId: paymentIntent.latest_charge as string },
      })

      await fulfillOrder(order.id)
      return { success: true, orderId: order.id, walletAccessToken: order.walletAccessToken }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.id },
        include: {
          event: { select: { id: true, title: true, startsAt: true, venueName: true, posterUrl: true } },
          ticketTier: { select: { id: true, name: true, priceCents: true, currency: true } },
          tickets: { select: { id: true, status: true, qrTokenHash: true, attendeeName: true } },
          promoCode: { select: { code: true, discountType: true, discountValue: true } },
        },
      })
      if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      if (order.buyerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      return order
    }),

  getByAccessToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      if (input.token.startsWith('demo_wallet_')) {
        const [, , ...rest] = input.token.split('_')
        const timestamp = rest.pop()
        const quantityRaw = rest.pop()
        const tierId = rest.join('_')
        const quantity = Math.max(1, Number(quantityRaw) || 1)
        const tier = getDemoTierById(tierId)
        const event = DEMO_EVENTS.find((item) => item.id === tier?.eventId)
        if (tier && event && timestamp) {
          return {
            id: `demo_order_${timestamp}`,
            walletAccessToken: input.token,
            event: {
              id: event.id,
              title: event.title,
              slug: event.slug,
              startsAt: event.startsAt,
              venueName: event.venueName,
              posterUrl: event.posterUrl,
            },
            ticketTier: { name: tier.name },
            tickets: Array.from({ length: quantity }).map((_, index) => ({
              id: `demo_ticket_${tier.id}_${timestamp}_${index + 1}`,
              status: 'VALID' as const,
              attendeeName: null,
            })),
          }
        }
      }

      const order = await prisma.order.findUnique({
        where: { walletAccessToken: input.token },
        include: {
          event: { select: { id: true, title: true, slug: true, startsAt: true, venueName: true, posterUrl: true } },
          ticketTier: { select: { name: true } },
          tickets: {
            select: { id: true, status: true, attendeeName: true },
          },
        },
      })
      if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      return order
    }),

  myOrders: protectedProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input
      const orders = await prisma.order.findMany({
        where: { buyerId: ctx.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          event: { select: { id: true, title: true, startsAt: true, venueName: true, posterUrl: true, status: true } },
          ticketTier: { select: { name: true } },
          _count: { select: { tickets: true } },
        },
      })

      let nextCursor: string | undefined
      if (orders.length > limit) {
        const nextOrder = orders.pop()
        nextCursor = nextOrder!.id
      }

      return { orders, nextCursor }
    }),

  eventOrders: organizerProcedure
    .input(z.object({ eventId: z.string(), cursor: z.string().optional(), limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const { cursor, limit } = input
      const orders = await prisma.order.findMany({
        where: { eventId: input.eventId, paymentStatus: 'PAID' },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          buyer: { select: { id: true, name: true, email: true, avatarUrl: true } },
          ticketTier: { select: { name: true, priceCents: true } },
          tickets: { select: { id: true, status: true, attendeeName: true } },
        },
      })

      let nextCursor: string | undefined
      if (orders.length > limit) {
        const nextOrder = orders.pop()
        nextCursor = nextOrder!.id
      }

      return { orders, nextCursor }
    }),

  refund: organizerProcedure
    .input(z.object({ orderId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: { event: true, tickets: true },
      })
      if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Order not found' })
      if (order.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      if (order.paymentStatus !== 'PAID') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Order not paid' })
      }

      if (isStripeConfigured() && order.stripePaymentIntentId && !order.stripePaymentIntentId.startsWith('demo_')) {
        const stripe = createStripeClient(order.event.stripeAccountId || undefined)
        await stripe.refunds.create({
          payment_intent: order.stripePaymentIntentId,
          reason: 'requested_by_customer',
          metadata: { reason: input.reason || 'organizer_refund' },
        })
      }

      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'REFUNDED' },
        }),
        prisma.ticket.updateMany({
          where: { orderId: order.id },
          data: { status: 'REFUNDED' },
        }),
        prisma.ticketTier.update({
          where: { id: order.ticketTierId },
          data: { quantitySold: { decrement: order.tickets.length } },
        }),
      ])

      return { success: true }
    }),
}
