import { PrismaClient } from '../../../../generated/index.js'

let _prisma: PrismaClient | undefined

/** Cliente Prisma do banco org (ORGANIZACAO_DATABASE_URL) — mesmo padrao de tokens.ts */
export function prismaOrgPlataforma(): PrismaClient {
  if (!_prisma) {
    const url = process.env.ORGANIZACAO_DATABASE_URL?.trim() ?? process.env.DATABASE_URL?.trim()
    if (!url) {
      throw new Error('ORGANIZACAO_DATABASE_URL ausente — api-cockpit sem banco org')
    }
    _prisma = new PrismaClient({ datasources: { db: { url } } })
  }
  return _prisma
}
