import { z } from 'zod'
import { publicProcedure, protectedProcedure, organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'

export const waitlistRouter = {
  join: publicProcedure
    .input(z.object({ eventId: z.string(), email: z.string().email(), userId: z.string().optional() }))
    .mutation(async ({ input }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })

      const existing = await prisma.waitlistEntry.findFirst({
        where: { eventId: input.eventId, email: input.email },
      })
      if (existing) {
        return { entry: existing, alreadyJoined: true }
      }

      const position = await prisma.waitlistEntry.count({ where: { eventId: input.eventId, status: 'ACTIVE' } }) + 1

      const entry = await prisma.waitlistEntry.create({
        data: {
          eventId: input.eventId,
          userId: input.userId || '',
          email: input.email,
          position,
        },
      })

      return { entry, alreadyJoined: false }
    }),

  getPosition: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const entry = await prisma.waitlistEntry.findFirst({
        where: { eventId: input.eventId, userId: ctx.user.id },
      })
      if (!entry) return { onWaitlist: false }
      return { onWaitlist: true, position: entry.position, status: entry.status }
    }),

  leave: protectedProcedure
    .input(z.object({ eventId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await prisma.waitlistEntry.deleteMany({ where: { eventId: input.eventId, userId: ctx.user.id } })
      return { success: true }
    }),

  notifyNext: organizerProcedure
    .input(z.object({ eventId: z.string(), count: z.number().int().positive().default(10) }))
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const entries = await prisma.waitlistEntry.findMany({
        where: { eventId: input.eventId, status: 'ACTIVE' },
        orderBy: { position: 'asc' },
        take: input.count,
      })

      for (const entry of entries) {
        await prisma.waitlistEntry.update({
          where: { id: entry.id },
          data: { status: 'NOTIFIED', notifiedAt: new Date() },
        })
      }

      return { notified: entries.length }
    }),

  convert: protectedProcedure
    .input(z.object({ entryId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const entry = await prisma.waitlistEntry.findUnique({ where: { id: input.entryId } })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND', message: 'Entry not found' })
      if (entry.userId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      if (entry.status !== 'NOTIFIED' && entry.status !== 'ACTIVE') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Not eligible for conversion' })
      }

      await prisma.waitlistEntry.update({
        where: { id: entry.id },
        data: { status: 'CONVERTED', convertedAt: new Date() },
      })

      return { success: true }
    }),

  list: organizerProcedure
    .input(z.object({ eventId: z.string(), status: z.enum(['ACTIVE', 'NOTIFIED', 'CONVERTED', 'EXPIRED']).optional() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.waitlistEntry.findMany({
        where: { eventId: input.eventId, ...(input.status && { status: input.status }) },
        orderBy: { position: 'asc' },
        include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      })
    }),

  reorder: organizerProcedure
    .input(z.object({ eventId: z.string(), entries: z.array(z.object({ id: z.string(), position: z.number() })) }))
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      await prisma.$transaction(
        input.entries.map(e => prisma.waitlistEntry.update({ where: { id: e.id }, data: { position: e.position } }))
      )

      return { success: true }
    }),
}