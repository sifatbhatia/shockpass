import { z } from 'zod'
import { publicProcedure, protectedProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { generateRotatingQRToken, generateTransferToken, hashQRToken } from '@/utils/crypto'
import { DEMO_EVENTS, getDemoTierById } from '@/lib/demo-events'

function getDemoTicket(ticketId: string, accessToken: string) {
  if (!accessToken.startsWith('demo_wallet_') || !ticketId.startsWith('demo_ticket_')) return null
  const tier = DEMO_EVENTS.flatMap((event) => event.ticketTiers).find((candidate) =>
    ticketId.startsWith(`demo_ticket_${candidate.id}_`)
  )
  const event = DEMO_EVENTS.find((item) => item.id === tier?.eventId)
  const accessTier = getDemoTierById(accessToken.replace(/^demo_wallet_/, '').split(/_(?=\d+_\d+$)/)[0])
  if (!tier || !event || accessTier?.id !== tier.id) return null
  return {
    id: ticketId,
    orderId: `demo_order_${accessToken}`,
    eventId: event.id,
    ticketTierId: tier.id,
    attendeeId: null,
    attendeeName: null,
    attendeeEmail: null,
    qrTokenHash: 'demo',
    qrTokenVersion: 1,
    status: 'VALID' as const,
    checkedInAt: null,
    checkedInBy: null,
    transferredToEmail: null,
    transferToken: null,
    transferExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    event,
    ticketTier: tier,
    order: { buyerEmail: 'guest@willcall.app', createdAt: new Date() },
  }
}

export const walletRouter = {
  getTickets: protectedProcedure
    .input(
      z.object({
        status: z.enum(['VALID', 'CHECKED_IN', 'TRANSFERRED', 'REFUNDED', 'VOIDED']).optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const { status, cursor, limit } = input

      const tickets = await prisma.ticket.findMany({
        where: {
          attendeeId: ctx.user.id,
          ...(status && { status }),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          event: {
            select: {
              id: true,
              slug: true,
              title: true,
              subtitle: true,
              posterUrl: true,
              venueName: true,
              venueAddress: true,
              city: true,
              startsAt: true,
              endsAt: true,
              timezone: true,
            },
          },
          ticketTier: { select: { id: true, name: true, priceCents: true, currency: true } },
        },
      })

      let nextCursor: string | undefined
      if (tickets.length > limit) {
        const nextTicket = tickets.pop()
        nextCursor = nextTicket!.id
      }

      return { tickets, nextCursor }
    }),

  getTicket: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.id },
        include: {
          event: true,
          ticketTier: true,
          order: { select: { id: true, buyerEmail: true, createdAt: true } },
        },
      })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
      if (ticket.attendeeId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      return ticket
    }),

  initiateTransfer: protectedProcedure
    .input(z.object({ ticketId: z.string(), recipientEmail: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.ticketId },
        include: { event: true },
      })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
      if (ticket.attendeeId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your ticket' })
      }
      if (ticket.status !== 'VALID') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Ticket cannot be transferred' })
      }
      if (ticket.event.startsAt < new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Event has already started' })
      }

      const transferToken = generateTransferToken()
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'TRANSFERRED',
          transferredToEmail: input.recipientEmail,
          transferToken,
          transferExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })

      return { success: true, transferToken }
    }),

  acceptTransfer: protectedProcedure
    .input(z.object({ transferToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ticket = await prisma.ticket.findUnique({
        where: { transferToken: input.transferToken },
        include: { event: true },
      })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid transfer link' })
      if (ticket.transferredToEmail !== ctx.user.email) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'This transfer is not for you' })
      }
      if (ticket.transferExpiresAt && ticket.transferExpiresAt < new Date()) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Transfer link has expired' })
      }
      if (ticket.status !== 'TRANSFERRED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Ticket already claimed or invalid' })
      }

      const newQrToken = `qrt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          attendeeId: ctx.user.id,
          attendeeName: ctx.user.name || undefined,
          attendeeEmail: ctx.user.email,
          status: 'VALID',
          transferredToEmail: null,
          transferToken: null,
          transferExpiresAt: null,
          qrTokenHash: hashQRToken(newQrToken),
          qrTokenVersion: { increment: 1 },
        },
      })

      return { success: true, ticketId: ticket.id }
    }),

  cancelTransfer: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ticket = await prisma.ticket.findUnique({ where: { id: input.ticketId } })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
      if (ticket.attendeeId !== ctx.user.id) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your ticket' })
      }
      if (ticket.status !== 'TRANSFERRED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'No active transfer to cancel' })
      }

      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: 'VALID',
          transferredToEmail: null,
          transferToken: null,
          transferExpiresAt: null,
        },
      })

      return { success: true }
    }),

  getRotatingQR: protectedProcedure
    .input(z.object({ ticketId: z.string() }))
    .query(async ({ input, ctx }) => {
      const ticket = await prisma.ticket.findUnique({ where: { id: input.ticketId } })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
      if (ticket.attendeeId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      const timestamp = Date.now()
      const token = generateRotatingQRToken(ticket.id, timestamp)

      return {
        token,
        timestamp,
        expiresAt: timestamp + 30000,
      }
    }),

  getTicketGuest: publicProcedure
    .input(z.object({ id: z.string(), accessToken: z.string() }))
    .query(async ({ input }) => {
      const demoTicket = getDemoTicket(input.id, input.accessToken)
      if (demoTicket) return demoTicket

      const order = await prisma.order.findUnique({
        where: { walletAccessToken: input.accessToken },
        include: { tickets: { where: { id: input.id } } },
      })
      if (!order || order.tickets.length === 0) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      const ticket = await prisma.ticket.findUnique({
        where: { id: input.id },
        include: { event: true, ticketTier: true, order: { select: { buyerEmail: true, createdAt: true } } },
      })
      if (!ticket) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
      return ticket
    }),

  getRotatingQRGuest: publicProcedure
    .input(z.object({ ticketId: z.string(), accessToken: z.string() }))
    .query(async ({ input }) => {
      const demoTicket = getDemoTicket(input.ticketId, input.accessToken)
      if (demoTicket) {
        const timestamp = Date.now()
        return {
          token: generateRotatingQRToken(input.ticketId, timestamp),
          timestamp,
          expiresAt: timestamp + 30000,
        }
      }

      const order = await prisma.order.findUnique({
        where: { walletAccessToken: input.accessToken },
        include: { tickets: { where: { id: input.ticketId } } },
      })
      if (!order || order.tickets.length === 0) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }
      const timestamp = Date.now()
      return {
        token: generateRotatingQRToken(input.ticketId, timestamp),
        timestamp,
        expiresAt: timestamp + 30000,
      }
    }),
}
