import { prisma } from '@/lib/prisma'
import { generateIdempotencyKey, generateQRToken, hashQRToken } from '@/utils/crypto'
import { sendTicketEmail } from '@/lib/email'

const HOLD_MINUTES = 10

export function holdExpiresAtFromNow() {
  return new Date(Date.now() + HOLD_MINUTES * 60 * 1000)
}

export async function getReservedQuantity(tierId: string) {
  const result = await prisma.order.aggregate({
    where: {
      ticketTierId: tierId,
      paymentStatus: 'PENDING',
      holdExpiresAt: { gt: new Date() },
    },
    _sum: { quantity: true },
  })
  return result._sum.quantity ?? 0
}

export async function expireStaleHolds(tierId?: string) {
  await prisma.order.updateMany({
    where: {
      paymentStatus: 'PENDING',
      holdExpiresAt: { lt: new Date() },
      ...(tierId ? { ticketTierId: tierId } : {}),
    },
    data: { paymentStatus: 'FAILED' },
  })
}

export async function fulfillOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { event: true, ticketTier: true, promoCode: true },
  })
  if (!order) throw new Error('Order not found')
  if (order.paymentStatus === 'PAID') return { orderId, tickets: order.quantity, alreadyPaid: true }

  const tickets = await prisma.$transaction(async (tx) => {
    const created = []
    for (let i = 0; i < order.quantity; i++) {
      const qrToken = generateQRToken()
      const ticket = await tx.ticket.create({
        data: {
          orderId: order.id,
          eventId: order.eventId,
          ticketTierId: order.ticketTierId,
          attendeeId: order.buyerId,
          attendeeName: order.buyerName || undefined,
          attendeeEmail: order.buyerEmail,
          qrTokenHash: hashQRToken(qrToken),
          transferToken: generateIdempotencyKey(),
          transferExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      })
      created.push({ ...ticket, qrToken })
    }

    await tx.ticketTier.update({
      where: { id: order.ticketTierId },
      data: { quantitySold: { increment: order.quantity } },
    })

    await tx.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID', holdExpiresAt: null },
    })

    if (order.promoCodeId) {
      await tx.promoCode.update({
        where: { id: order.promoCodeId },
        data: { usedCount: { increment: 1 } },
      })
    }

    if (order.referralCode) {
      await tx.referral.updateMany({
        where: { code: order.referralCode },
        data: { conversions: { increment: 1 }, revenueCents: { increment: order.totalCents } },
      })
    }

    return created
  })

  await sendTicketEmail({
    to: order.buyerEmail,
    eventTitle: order.event.title,
    walletAccessToken: order.walletAccessToken || undefined,
    tickets: tickets.map((t) => ({
      id: t.id,
      qrToken: t.qrToken,
      tierName: order.ticketTier.name,
      attendeeName: t.attendeeName ?? undefined,
    })),
  })

  return { orderId: order.id, tickets: tickets.length, alreadyPaid: false }
}
