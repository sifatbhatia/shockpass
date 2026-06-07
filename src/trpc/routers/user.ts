import { protectedProcedure } from '../init'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/generated/prisma/enums'

export const userRouter = {
  ensureOrganizer: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role === UserRole.ORGANIZER || ctx.user.role === UserRole.ADMIN) {
      return { role: ctx.user.role }
    }

    const user = await prisma.user.update({
      where: { id: ctx.user.id },
      data: { role: UserRole.ORGANIZER },
      select: { role: true },
    })

    return { role: user.role }
  }),
}
