// server/lib/prisma.ts
// Singleton do PrismaClient para o serviço de Email.
// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()

import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { emailPrisma: PrismaClient }

let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.emailPrisma ?? new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
    if (process.env.NODE_ENV !== 'production') globalForPrisma.emailPrisma = _prisma
  }
  return _prisma
}

/** @deprecated Use getPrisma() — mantido para compatibilidade */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as Record<string | symbol, unknown>)[prop]
  },
})
