// preferencias-usuario/server/lib/prisma.ts
// Singleton do PrismaClient tenant — usa o cliente composto em
// servicos-global/tenant/generated (NÃO @prisma/client raiz, que aponta
// para o configurador).

import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { preferenciasPrisma?: PrismaClient }

export const prisma =
  globalForPrisma.preferenciasPrisma ?? new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.preferenciasPrisma = prisma
}

export default prisma
