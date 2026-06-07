import { z } from 'zod'
import { publicProcedure, organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { getDemoTierById, DEMO_EVENTS } from '@/lib/demo-events'

const createTicketTierSchema = z.object({
  eventId: z.string(),
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().default('USD'),
  quantityTotal: z.number().int().positive(),
  maxPerOrder: z.number().int().positive().default(10),
  salesStartAt: z.date().optional(),
  salesEndAt: z.date().optional(),
  unlockRule: z.any().optional(),
  sortOrder: z.number().int().default(0),
})

const updateTicketTierSchema = createTicketTierSchema.partial().extend({
  id: z.string(),
})

export const ticketRouter = {
  getTiers: publicProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input }) => {
      try {
        const tiers = await prisma.ticketTier.findMany({
          where: {
            eventId: input.eventId,
            status: { in: ['ON_SALE', 'SOLD_OUT', 'LOCKED'] },
          },
          orderBy: { sortOrder: 'asc' },
        })
        return tiers
      } catch (error) {
        const event = DEMO_EVENTS.find((item) => item.id === input.eventId)
        if (event) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[ticket.getTiers] Serving demo tiers:', input.eventId, error)
          }
          return event.ticketTiers
        }
        throw error
      }
    }),

  getTier: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const tier = await prisma.ticketTier.findUnique({
          where: { id: input.id },
          include: { event: { select: { id: true, title: true, startsAt: true, status: true } } },
        })
        if (!tier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })
        return tier
      } catch (error) {
        const tier = getDemoTierById(input.id)
        const event = DEMO_EVENTS.find((item) => item.id === tier?.eventId)
        if (tier && event) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[ticket.getTier] Serving demo tier:', input.id, error)
          }
          return {
            ...tier,
            event: { id: event.id, title: event.title, startsAt: event.startsAt, status: event.status },
          }
        }
        throw error
      }
    }),

  create: organizerProcedure
    .input(createTicketTierSchema)
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.ticketTier.create({
        data: {
          ...input,
          salesStartAt: input.salesStartAt ? new Date(input.salesStartAt) : null,
          salesEndAt: input.salesEndAt ? new Date(input.salesEndAt) : null,
        },
      })
    }),

  update: organizerProcedure
    .input(updateTicketTierSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      const tier = await prisma.ticketTier.findUnique({
        where: { id },
        include: { event: true },
      })
      if (!tier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })
      if (tier.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.ticketTier.update({
        where: { id },
        data: {
          ...data,
          salesStartAt: data.salesStartAt ? new Date(data.salesStartAt) : null,
          salesEndAt: data.salesEndAt ? new Date(data.salesEndAt) : null,
        },
      })
    }),

  delete: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tier = await prisma.ticketTier.findUnique({
        where: { id: input.id },
        include: { event: true },
      })
      if (!tier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })
      if (tier.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.ticketTier.delete({ where: { id: input.id } })
    }),

  openSales: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tier = await prisma.ticketTier.findUnique({
        where: { id: input.id },
        include: { event: true },
      })
      if (!tier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })
      if (tier.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.ticketTier.update({
        where: { id: input.id },
        data: { status: 'ON_SALE' },
      })
    }),

  closeSales: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const tier = await prisma.ticketTier.findUnique({
        where: { id: input.id },
        include: { event: true },
      })
      if (!tier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })
      if (tier.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.ticketTier.update({
        where: { id: input.id },
        data: { status: 'ENDED' },
      })
    }),

  reorder: organizerProcedure
    .input(z.object({ tiers: z.array(z.object({ id: z.string(), sortOrder: z.number() })) }))
    .mutation(async ({ input, ctx }) => {
      const tierIds = input.tiers.map(t => t.id)
      const tiers = await prisma.ticketTier.findMany({
        where: { id: { in: tierIds } },
        include: { event: true },
      })

      for (const tier of tiers) {
        if (tier.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
        }
      }

      await prisma.$transaction(
        input.tiers.map(t =>
          prisma.ticketTier.update({ where: { id: t.id }, data: { sortOrder: t.sortOrder } })
        )
      )

      return { success: true }
    }),

  checkAvailability: publicProcedure
    .input(z.object({ tierId: z.string(), quantity: z.number().int().positive() }))
    .query(async ({ input }) => {
      const { expireStaleHolds, getReservedQuantity } = await import('@/lib/order-fulfillment')
      let reserved = 0
      let tier
      try {
        await expireStaleHolds(input.tierId)
        tier = await prisma.ticketTier.findUnique({ where: { id: input.tierId } })
        reserved = await getReservedQuantity(input.tierId)
      } catch (error) {
        tier = getDemoTierById(input.tierId)
        if (tier && process.env.NODE_ENV !== 'production') {
          console.warn('[ticket.checkAvailability] Serving demo availability:', input.tierId, error)
        }
      }
      if (!tier) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket tier not found' })

      const available = tier.quantityTotal - tier.quantitySold - reserved
      const now = new Date()
      const withinWindow =
        (!tier.salesStartAt || tier.salesStartAt <= now) &&
        (!tier.salesEndAt || tier.salesEndAt >= now)
      const canPurchase =
        tier.status === 'ON_SALE' && available >= input.quantity && withinWindow

      return {
        available,
        reserved,
        canPurchase,
        maxPerOrder: tier.maxPerOrder,
        priceCents: tier.priceCents,
        currency: tier.currency,
        salesStartAt: tier.salesStartAt,
        salesEndAt: tier.salesEndAt,
      }
    }),
}
