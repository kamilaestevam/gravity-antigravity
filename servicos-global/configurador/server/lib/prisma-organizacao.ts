/**
 * PrismaClient do banco ORGANIZACAO_DATABASE_URL (historico_log, notificacoes, api-cockpit…).
 * Singleton — mesmo padrão de notificacoes/server/lib/prisma.ts.
 */
import { PrismaClient } from '../../../servicos-plataforma/generated/index.js'
import { sincronizarEnvOrganizacao } from './resolver-url-organizacao.js'

const globalForPrisma = globalThis as unknown as { orgPlataformaPrisma: PrismaClient }

let _prisma: PrismaClient | undefined

export function getPrismaOrganizacao(): PrismaClient {
  if (!_prisma) {
    sincronizarEnvOrganizacao(process.env.NODE_ENV !== 'production')
    const url = process.env.ORGANIZACAO_DATABASE_URL
    if (!url?.trim()) {
      throw new Error('ORGANIZACAO_DATABASE_URL ausente')
    }
    _prisma =
      globalForPrisma.orgPlataformaPrisma ??
      new PrismaClient({ datasources: { db: { url } } })
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.orgPlataformaPrisma = _prisma
    }
  }
  return _prisma
}
