import { z } from 'zod'
import { organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { createStripeConnectClient } from '@/lib/stripe'
import { eachDayOfInterval, format, subDays, startOfDay, endOfDay } from 'date-fns'

export const organizerRouter = {
  dashboard: organizerProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({
        where: { id: input.eventId },
        include: {
          ticketTiers: true,
          _count: { select: { orders: true, tickets: true, waitlist: true } },
        },
      })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const paidOrders = await prisma.order.findMany({
        where: { eventId: event.id, paymentStatus: 'PAID' },
        select: { id: true, totalCents: true, feesCents: true, createdAt: true, ticketTierId: true, referralCode: true },
      })

      const grossSales = paidOrders.reduce((sum, o) => sum + o.totalCents, 0)
      const fees = paidOrders.reduce((sum, o) => sum + o.feesCents, 0)
      const netRevenue = grossSales - fees
      const ticketsSold = paidOrders.length > 0 ? await prisma.ticket.count({ where: { orderId: { in: paidOrders.map(o => o.id) } } }) : 0

      const salesByDay: Record<string, number> = {}
      const salesByTier: Record<string, { name: string; count: number; revenue: number }> = {}
      const salesByChannel: Record<string, number> = {}

      for (const order of paidOrders) {
        const day = format(order.createdAt, 'yyyy-MM-dd')
        salesByDay[day] = (salesByDay[day] || 0) + 1

        const tier = event.ticketTiers.find(t => t.id === order.ticketTierId)
        if (tier) {
          if (!salesByTier[tier.id]) salesByTier[tier.id] = { name: tier.name, count: 0, revenue: 0 }
          salesByTier[tier.id].count++
          salesByTier[tier.id].revenue += order.totalCents
        }

        const channel = order.referralCode ? 'referral' : 'direct'
        salesByChannel[channel] = (salesByChannel[channel] || 0) + 1
      }

      const last30Days = eachDayOfInterval({
        start: startOfDay(subDays(new Date(), 30)),
        end: endOfDay(new Date()),
      })
      const salesChart = last30Days.map(d => ({
        date: format(d, 'yyyy-MM-dd'),
        sales: salesByDay[format(d, 'yyyy-MM-dd')] || 0,
      }))

      const waitlistCount = await prisma.waitlistEntry.count({ where: { eventId: event.id, status: 'ACTIVE' } })

      const projectedSellout = event.ticketTiers.reduce((sum, t) => sum + t.quantityTotal, 0) > 0
        ? Math.round(
            (event.ticketTiers.reduce((sum, t) => sum + t.quantityTotal, 0) /
              (ticketsSold / Math.max(1, (Date.now() - event.createdAt.getTime()) / (1000 * 60 * 60)))) *
              24
          )
        : null

      return {
        event,
        metrics: {
          grossSales,
          netRevenue,
          fees,
          ticketsSold,
          capacity: event.capacity,
          capacityFilled: event.capacity > 0 ? (ticketsSold / event.capacity) * 100 : 0,
          waitlistCount,
          projectedSelloutHours: projectedSellout,
          conversionRate: 0,
        },
        salesChart,
        salesByTier: Object.values(salesByTier),
        salesByChannel,
        topReferralCodes: await prisma.referral.findMany({
          where: { eventId: event.id },
          orderBy: { conversions: 'desc' },
          take: 5,
          select: { code: true, conversions: true, revenueCents: true },
        }),
      }
    }),

  payouts: organizerProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input

      const payouts = await prisma.organizerPayout.findMany({
        where: { organizerId: ctx.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
      })

      let nextCursor: string | undefined
      if (payouts.length > limit) {
        const next = payouts.pop()
        nextCursor = next!.id
      }

      return { payouts, nextCursor }
    }),

  connectStripe: organizerProcedure
    .mutation(async ({ ctx }) => {
      const stripe = createStripeConnectClient()

      const account = await stripe.accounts.create({
        type: 'express',
        email: ctx.user.email || undefined,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
      })

      return { accountId: account.id, onboardingUrl: (await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        type: 'account_onboarding',
      })).url }
    }),

  stripeOnboarding: organizerProcedure
    .input(z.object({ accountId: z.string() }))
    .mutation(async ({ input }) => {
      const stripe = createStripeConnectClient()
      const link = await stripe.accountLinks.create({
        account: input.accountId,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        type: 'account_onboarding',
      })
      return { url: link.url }
    }),

  attendees: organizerProcedure
    .input(z.object({ eventId: z.string(), cursor: z.string().optional(), limit: z.number().min(1).max(100).default(50), search: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const { cursor, limit, search } = input

      const where = {
        eventId: event.id,
        ...(search && {
          OR: [
            { attendeeName: { contains: search, mode: 'insensitive' as const } },
            { attendeeEmail: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
      }

      const tickets = await prisma.ticket.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          ticketTier: { select: { name: true } },
          order: { select: { id: true, buyerEmail: true, createdAt: true } },
        },
      })

      let nextCursor: string | undefined
      if (tickets.length > limit) {
        const next = tickets.pop()
        nextCursor = next!.id
      }

      return { tickets, nextCursor }
    }),

  exportAttendees: organizerProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const tickets = await prisma.ticket.findMany({
        where: { eventId: event.id },
        include: {
          ticketTier: { select: { name: true, priceCents: true } },
          order: { select: { id: true, buyerEmail: true, createdAt: true, referralCode: true } },
        },
      })

      return tickets.map(t => ({
        ticketId: t.id,
        attendeeName: t.attendeeName || '',
        attendeeEmail: t.attendeeEmail || '',
        tierName: t.ticketTier.name,
        tierPrice: t.ticketTier.priceCents / 100,
        status: t.status,
        checkedInAt: t.checkedInAt?.toISOString() || '',
        orderId: t.order.id,
        buyerEmail: t.order.buyerEmail,
        purchasedAt: t.order.createdAt.toISOString(),
        referralCode: t.order.referralCode || '',
      }))
    }),

  updateProfile: organizerProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100).optional(),
        organizerSlug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/).optional(),
        organizerCity: z.string().max(100).optional(),
        organizerLogoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.organizerSlug) {
        const taken = await prisma.user.findFirst({
          where: { organizerSlug: input.organizerSlug, NOT: { id: ctx.user.id } },
        })
        if (taken) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Slug already taken' })
      }

      return prisma.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          organizerSlug: input.organizerSlug,
          organizerCity: input.organizerCity,
          organizerLogoUrl: input.organizerLogoUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          organizerSlug: true,
          organizerCity: true,
          organizerLogoUrl: true,
        },
      })
    }),

  getProfile: organizerProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        organizerSlug: true,
        organizerCity: true,
        organizerLogoUrl: true,
        stripeAccountId: true,
      },
    })
    if (!user) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
    return user
  }),
}
