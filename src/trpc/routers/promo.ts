import { z } from 'zod'
import { organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'

const promoSchema = z.object({
  eventId: z.string(),
  code: z.string().min(2).max(32),
  discountType: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().int().positive(),
  ticketTierId: z.string().optional(),
  usageLimit: z.number().int().positive().optional(),
  startsAt: z.date().optional(),
  endsAt: z.date().optional(),
})

export const promoRouter = {
  list: organizerProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      return prisma.promoCode.findMany({
        where: { eventId: input.eventId },
        orderBy: { createdAt: 'desc' },
        include: { ticketTier: { select: { name: true } } },
      })
    }),

  create: organizerProcedure
    .input(promoSchema)
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.promoCode.create({
        data: {
          ...input,
          code: input.code.toUpperCase(),
          attributedUserId: ctx.user.id,
        },
      })
    }),

  delete: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const promo = await prisma.promoCode.findUnique({
        where: { id: input.id },
        include: { event: true },
      })
      if (!promo) throw new TRPCError({ code: 'NOT_FOUND', message: 'Promo not found' })
      if (promo.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      await prisma.promoCode.delete({ where: { id: input.id } })
      return { success: true }
    }),
}
