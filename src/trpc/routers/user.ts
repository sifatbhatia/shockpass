import { z } from 'zod'
import { adminProcedure } from '../init'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@/generated/prisma/enums'

export const userRouter = {
  ensureOrganizer: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.update({
        where: { id: input.userId },
        data: { role: UserRole.ORGANIZER },
        select: { role: true },
      })

      return { role: user.role }
    })
}
