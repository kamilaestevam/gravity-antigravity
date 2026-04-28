// server/prisma.ts
// Singleton do PrismaClient para o serviço de WhatsApp.
// Usa o client gerado a partir do schema composto pelo Coordenador.

import { PrismaClient } from '../../generated/index.js'

const globalForPrisma = global as unknown as { whatsappPrisma: PrismaClient }

export const prisma =
  globalForPrisma.whatsappPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.whatsappPrisma = prisma
