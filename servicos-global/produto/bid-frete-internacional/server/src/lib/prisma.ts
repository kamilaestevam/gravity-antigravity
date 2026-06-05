/**
 * prisma.ts — Singleton do PrismaClient
 * Skill: antigravity-criar-produto
 */
import { PrismaClient } from '../generated/client/index.js'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function resolverUrlBancoBidFreteInternacional(): string {
  const url = process.env.BID_FRETE_INTERNATIONAL_DATABASE_URL ?? process.env.DATABASE_URL
  if (!url) {
    throw new Error('[BidFrete] BID_FRETE_INTERNATIONAL_DATABASE_URL ou DATABASE_URL ausente')
  }
  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: { url: resolverUrlBancoBidFreteInternacional() },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
