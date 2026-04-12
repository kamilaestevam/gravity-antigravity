// server/lib/prisma.ts
// Singleton do PrismaClient compartilhado por todos os serviços tenant.
// Instanciado uma única vez no processo do super-servidor.

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { tenantPrisma: PrismaClient }

export const prisma = globalForPrisma.tenantPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.tenantPrisma = prisma
}
