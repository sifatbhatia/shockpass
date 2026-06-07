import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL

function createPrismaClient() {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  if (databaseUrl.startsWith('prisma+postgres://')) {
    return new PrismaClient({ accelerateUrl: databaseUrl })
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  })
}

export const prisma =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
