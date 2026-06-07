import { z } from 'zod'
import { publicProcedure, protectedProcedure, organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { generateIdempotencyKey } from '@/utils/crypto'

export const referralRouter = {
  create: organizerProcedure
    .input(z.object({ eventId: z.string(), attributedUserId: z.string().optional(), rewardType: z.enum(['VIP_ACCESS', 'PERCENT_REFUND', 'BACKSTAGE', 'CUSTOM']).optional(), rewardValue: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const code = `REF_${generateIdempotencyKey().slice(5, 12).toUpperCase()}`
      const referral = await prisma.referral.create({
        data: {
          eventId: input.eventId,
          userId: input.attributedUserId || ctx.user.id,
          referrerId: input.attributedUserId || ctx.user.id,
          code,
          rewardType: input.rewardType,
          rewardValue: input.rewardValue,
        },
      })
      return referral
    }),

  getByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      const referral = await prisma.referral.findUnique({
        where: { code: input.code },
        include: { event: { select: { id: true, title: true, startsAt: true, posterUrl: true } } },
      })
      if (!referral) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid referral code' })
      return referral
    }),

  trackClick: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.referral.update({ where: { code: input.code }, data: { clicks: { increment: 1 } } })
      return { success: true }
    }),

  trackConversion: protectedProcedure
    .input(z.object({ code: z.string(), orderId: z.string(), revenueCents: z.number() }))
    .mutation(async ({ input }) => {
      const referral = await prisma.referral.findUnique({ where: { code: input.code } })
      if (!referral) return { success: false }

      await prisma.referral.update({
        where: { id: referral.id },
        data: { conversions: { increment: 1 }, revenueCents: { increment: input.revenueCents } },
      })
      return { success: true }
    }),

  myReferrals: protectedProcedure
    .input(z.object({ eventId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      return prisma.referral.findMany({
        where: { userId: ctx.user.id, ...(input.eventId && { eventId: input.eventId }) },
        include: { event: { select: { id: true, title: true, startsAt: true } } },
        orderBy: { createdAt: 'desc' },
      })
    }),

  eventReferrals: organizerProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      return prisma.referral.findMany({
        where: { eventId: input.eventId },
        orderBy: { conversions: 'desc' },
      })
    }),

  claimReward: protectedProcedure
    .input(z.object({ referralId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const referral = await prisma.referral.findUnique({ where: { id: input.referralId } })
      if (!referral) throw new TRPCError({ code: 'NOT_FOUND', message: 'Referral not found' })
      if (referral.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your referral' })
      if (referral.rewardClaimedAt) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already claimed' })

      await prisma.referral.update({
        where: { id: referral.id },
        data: { rewardClaimedAt: new Date() },
      })
      return { success: true }
    }),
}
