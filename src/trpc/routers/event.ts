import { z } from 'zod'
import { publicProcedure, protectedProcedure, organizerProcedure } from '../init'
import { TRPCError } from '@trpc/server'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/utils/slug'
import { EventStatus, EventVisibility, TicketTierStatus } from '@/generated/prisma/enums'
import { getDemoEventBySlug, listDemoEvents } from '@/lib/demo-events'

const createEventSchema = z.object({
  title: z.string().min(3).max(200),
  subtitle: z.string().max(300).optional(),
  description: z.string().min(10),
  posterUrl: z.string().url(),
  heroVideoUrl: z.string().url().optional(),
  venueName: z.string().min(2),
  venueAddress: z.string().min(5),
  city: z.string().min(2),
  timezone: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  startsAt: z.date(),
  endsAt: z.date(),
  capacity: z.number().int().positive(),
  visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']).default('PUBLIC'),
})

const updateEventSchema = createEventSchema.partial().extend({
  id: z.string(),
})

export const eventRouter = {
  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        city: z.string().optional(),
        status: z.enum(['DRAFT', 'SCHEDULED', 'LIVE', 'SOLD_OUT', 'COMPLETED', 'CANCELLED']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, city, status, search } = input

      const where = {
        ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { venueName: { contains: search, mode: 'insensitive' as const } },
          ],
        }),
        visibility: EventVisibility.PUBLIC,
        ...(status && { status: status as EventStatus }),
        ...(!status && { status: { in: [EventStatus.SCHEDULED, EventStatus.LIVE, EventStatus.SOLD_OUT] } }),
      }

      try {
        const events = await prisma.event.findMany({
          where,
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { startsAt: 'asc' },
          include: {
            organizer: { select: { id: true, name: true, avatarUrl: true } },
            ticketTiers: {
              where: { status: { in: [TicketTierStatus.ON_SALE, TicketTierStatus.SOLD_OUT] } },
              select: { id: true, name: true, priceCents: true, currency: true, quantityTotal: true, quantitySold: true },
            },
          },
        })

        let nextCursor: string | undefined
        if (events.length > limit) {
          const nextEvent = events.pop()
          nextCursor = nextEvent!.id
        }

        return { events, nextCursor }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[event.list] Database unavailable, serving demo drops:', error)
        }
        return {
          events: listDemoEvents({ limit, city, search, status }),
          nextCursor: undefined,
        }
      }
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      try {
        const event = await prisma.event.findUnique({
          where: { slug: input.slug },
          include: {
            organizer: { select: { id: true, name: true, avatarUrl: true, walletAddress: true } },
            ticketTiers: {
              where: { status: { in: ['ON_SALE', 'SOLD_OUT', 'LOCKED'] } },
              orderBy: { sortOrder: 'asc' },
            },
          },
        })

        if (!event) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
        }

        return event
      } catch (error) {
        const demoEvent = getDemoEventBySlug(input.slug)
        if (demoEvent) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[event.getBySlug] Serving demo drop:', input.slug, error)
          }
          return demoEvent
        }
        throw error
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({
        where: { id: input.id },
        include: {
          ticketTiers: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { orders: true, tickets: true, waitlist: true } },
        },
      })

      if (!event) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      }

      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return event
    }),

  create: organizerProcedure
    .input(createEventSchema)
    .mutation(async ({ input, ctx }) => {
      const baseSlug = generateSlug(input.title)
      let slug = baseSlug
      let counter = 1

      while (await prisma.event.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }

      const event = await prisma.event.create({
        data: {
          ...input,
          slug,
          organizerId: ctx.user.id,
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
        },
      })

      return event
    }),

  update: organizerProcedure
    .input(updateEventSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input

      const event = await prisma.event.findUnique({ where: { id } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.event.update({
        where: { id },
        data: {
          ...data,
          startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
          endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        },
      })
    }),

  publish: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.id } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.event.update({
        where: { id: input.id },
        data: { status: 'SCHEDULED' },
      })
    }),

  goLive: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.id } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.event.update({
        where: { id: input.id },
        data: { status: 'LIVE' },
      })
    }),

  cancel: organizerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const event = await prisma.event.findUnique({ where: { id: input.id } })
      if (!event) throw new TRPCError({ code: 'NOT_FOUND', message: 'Event not found' })
      if (event.organizerId !== ctx.user.id && ctx.user.role !== 'ADMIN') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' })
      }

      return prisma.event.update({
        where: { id: input.id },
        data: { status: 'CANCELLED' },
      })
    }),

  myEvents: protectedProcedure
    .input(z.object({ cursor: z.string().optional(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input

      const events = await prisma.event.findMany({
        where: { organizerId: ctx.user.id },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { orders: true, tickets: true } },
          ticketTiers: { select: { id: true, name: true, priceCents: true, quantityTotal: true, quantitySold: true } },
        },
      })

      let nextCursor: string | undefined
      if (events.length > limit) {
        const nextEvent = events.pop()
        nextCursor = nextEvent!.id
      }

      return { events, nextCursor }
    }),
}
