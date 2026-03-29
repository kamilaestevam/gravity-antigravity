// server/lib/prisma.ts
// Singleton do Prisma Client — reutiliza conexão entre hot-reloads em dev

import { PrismaClient } from '../../../../configurador/generated/index.js'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
