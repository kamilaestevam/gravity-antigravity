// Importa do generated da plataforma (não do @prisma/client raiz, que aponta
// para o schema do configurador e não inclui os modelos da plataforma).
// Lazy initialization — evita ESM hoisting ler process.env antes do dotenv.config()
import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { plataformaPrisma: PrismaClient }

let _prisma: PrismaClient | undefined

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = globalForPrisma.plataformaPrisma ?? new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })
    if (process.env.NODE_ENV !== 'production') globalForPrisma.plataformaPrisma = _prisma
  }
  return _prisma
}

/** @deprecated Use getPrisma() — mantido para compatibilidade com imports existentes */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as Record<string | symbol, unknown>)[prop]
  },
})
