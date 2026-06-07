import { z } from 'zod'
import { organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { verifyRotatingQRToken, hashQRToken } from '@/utils/crypto'
import { assertRateLimit } from '@/lib/rate-limit'

export const scanRouter = {
  validate: organizerProcedure
    .input(z.object({ eventId: z.string(), qrToken: z.string(), deviceInfo: z.any().optional() }))
    .mutation(async ({ input, ctx }) => {
      try {
        assertRateLimit(`scan:${ctx.user.id}`, 120, 60_000)
      } catch {
        throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message: 'Too many scan attempts' })
      }

      const { eventId, qrToken, deviceInfo } = input
      const event = await prisma.event.findUnique({ where: { id: eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized for this scanner' })
      }

      const tickets = await prisma.ticket.findMany({
        where: { eventId, status: { in: ['VALID', 'CHECKED_IN'] } },
        include: { ticketTier: true, event: { select: { id: true, title: true } } },
      })

      let matchedTicket = null
      let result: 'VALID' | 'ALREADY_SCANNED' | 'WRONG_EVENT' | 'REFUNDED' | 'VIP' | 'GUESTLIST' = 'WRONG_EVENT'

      for (const ticket of tickets) {
        if (verifyRotatingQRToken(ticket.id, qrToken, Date.now())) {
          matchedTicket = ticket
          break
        }
        if (hashQRToken(qrToken) === ticket.qrTokenHash) {
          matchedTicket = ticket
          break
        }
      }

      if (!matchedTicket) {
        result = 'WRONG_EVENT'
      } else if (matchedTicket.status === 'CHECKED_IN') {
        result = 'ALREADY_SCANNED'
      } else if (matchedTicket.status === 'REFUNDED' || matchedTicket.status === 'VOIDED') {
        result = 'REFUNDED'
      } else {
        const tierName = matchedTicket.ticketTier.name.toLowerCase()
        if (tierName.includes('guest')) {
          result = 'GUESTLIST'
        } else if (tierName.includes('vip')) {
          result = 'VIP'
        } else {
          result = 'VALID'
        }
        await prisma.ticket.update({
          where: { id: matchedTicket.id },
          data: { status: 'CHECKED_IN', checkedInAt: new Date(), checkedInBy: ctx.user.id },
        })
      }

      if (matchedTicket) {
        await prisma.scanLog.create({
          data: {
            eventId,
            ticketId: matchedTicket.id,
            scannedBy: ctx.user.id,
            result,
            deviceInfo,
          },
        })
      }

      return {
        result,
        ticket: matchedTicket
          ? {
              id: matchedTicket.id,
              attendeeName: matchedTicket.attendeeName,
              attendeeEmail: matchedTicket.attendeeEmail,
              tierName: matchedTicket.ticketTier.name,
              checkedInAt: matchedTicket.checkedInAt,
            }
          : null,
      }
    }),

  manualCheckIn: organizerProcedure
    .input(z.object({ eventId: z.string(), ticketId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.ticketId },
        include: { ticketTier: true, event: true },
      })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
      if (ticket.eventId !== input.eventId) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Ticket not for this event' })
      if (ticket.event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized for this scanner' })
      }
      if (ticket.status === 'CHECKED_IN') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Already checked in' })
      if (ticket.status === 'REFUNDED' || ticket.status === 'VOIDED') throw new TRPCError({ code: 'BAD_REQUEST', message: 'Ticket invalid' })

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'CHECKED_IN', checkedInAt: new Date(), checkedInBy: ctx.user.id },
      })

      await prisma.scanLog.create({
        data: {
          eventId: input.eventId,
          ticketId: ticket.id,
          scannedBy: ctx.user.id,
          result: 'VALID',
          deviceInfo: { manual: true },
        },
      })

      return { success: true, ticket }
    }),

  search: organizerProcedure
    .input(z.object({ eventId: z.string(), query: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized for this scanner' })
      }

      const tickets = await prisma.ticket.findMany({
        where: {
          eventId: input.eventId,
          OR: [
            { attendeeName: { contains: input.query, mode: 'insensitive' } },
            { attendeeEmail: { contains: input.query, mode: 'insensitive' } },
            { id: { contains: input.query } },
          ],
        },
        take: 20,
        include: { ticketTier: { select: { name: true } } },
      })
      return tickets
    }),

  getScanLogs: organizerProcedure
    .input(z.object({ eventId: z.string(), cursor: z.string().optional(), limit: z.number().min(1).max(200).default(100) }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const { cursor, limit } = input
      const logs = await prisma.scanLog.findMany({
        where: { eventId: input.eventId },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { scannedAt: 'desc' },
        include: {
          ticket: { select: { id: true, attendeeName: true, ticketTier: { select: { name: true } } } },
          scanner: { select: { id: true, name: true } },
        },
      })

      let nextCursor: string | undefined
      if (logs.length > limit) {
        const next = logs.pop()
        nextCursor = next!.id
      }

      return { logs, nextCursor }
    }),

  stats: organizerProcedure
    .input(z.object({ eventId: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.eventId } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const [total, checkedIn, vip, guestlist, refunded, byHour] = await Promise.all([
        prisma.ticket.count({ where: { eventId: input.eventId, status: { in: ['VALID', 'CHECKED_IN'] } } }),
        prisma.ticket.count({ where: { eventId: input.eventId, status: 'CHECKED_IN' } }),
        prisma.scanLog.count({ where: { eventId: input.eventId, result: 'VIP' } }),
        prisma.scanLog.count({ where: { eventId: input.eventId, result: 'GUESTLIST' } }),
        prisma.scanLog.count({ where: { eventId: input.eventId, result: 'REFUNDED' } }),
        prisma.$queryRaw`
          SELECT date_trunc('hour', "scannedAt") as hour, count(*) as count
          FROM "ScanLog"
          WHERE "eventId" = ${input.eventId} AND "result" = 'VALID'
          GROUP BY date_trunc('hour', "scannedAt")
          ORDER BY hour ASC
        `,
      ])

      return { total, checkedIn, vip, guestlist, refunded, checkInRate: total > 0 ? (checkedIn / total) * 100 : 0, byHour }
    }),
}
