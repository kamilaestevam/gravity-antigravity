// server/lib/prisma.ts
// Singleton do PrismaClient para o serviço de Email.

import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { emailPrisma: PrismaClient }

export const prisma = globalForPrisma.emailPrisma ?? new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.emailPrisma = prisma
}
