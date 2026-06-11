/**
 * prisma.ts — Singleton do PrismaClient
 * Skill: antigravity-criar-produto
 */
import { PrismaClient } from '../generated/client/index.js'
import { resolverUrlBancoBidFreteInternacional } from './url-banco-bid-frete-internacional.js'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: resolverUrlBancoBidFreteInternacional() },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
