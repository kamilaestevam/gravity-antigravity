// preferencias-usuario/server/lib/prisma.ts
// Singleton do PrismaClient tenant — usa o cliente composto em
// servicos-global/tenant/generated (NÃO @prisma/client raiz, que aponta
// para o configurador).
// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()

import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { preferenciasPrisma?: PrismaClient }

let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.preferenciasPrisma ?? new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
    if (process.env.NODE_ENV !== 'production') globalForPrisma.preferenciasPrisma = _prisma
  }
  return _prisma
}

/** @deprecated Use getPrisma() — mantido para compatibilidade */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as Record<string | symbol, unknown>)[prop]
  },
})

export default prisma
