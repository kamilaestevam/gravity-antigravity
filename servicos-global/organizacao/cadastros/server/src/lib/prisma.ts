/**
 * Singleton do PrismaClient para o serviço Cadastros.
 *
 * Importamos do client gerado em `generated/` (paridade nominal por serviço —
 * cada serviço tem seu próprio Prisma).
 *
 * Em testes, é possível injetar um client alternativo via `setPrismaClient()`.
 */
import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { __cadastrosPrisma?: PrismaClient }

let _prisma: PrismaClient =
  globalForPrisma.__cadastrosPrisma ?? new PrismaClient({ log: ['error'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__cadastrosPrisma = _prisma
}

export function getPrisma(): PrismaClient {
  return _prisma
}

/**
 * Substitui o client em runtime — uso EXCLUSIVO para testes funcionais
 * que precisam apontar pra um banco de testes ou injetar um mock.
 */
export function setPrismaClient(client: PrismaClient): void {
  _prisma = client
  globalForPrisma.__cadastrosPrisma = client
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(_prisma as unknown as object, prop, _prisma)
  },
})
