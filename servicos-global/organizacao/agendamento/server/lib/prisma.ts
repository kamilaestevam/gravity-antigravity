// server/lib/prisma.ts
// Singleton do PrismaClient para o serviço de Agendamento.
// Usa o client gerado a partir do schema composto pelo Coordenador.

import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { agendamentoPrisma: PrismaClient }

export const prisma =
  globalForPrisma.agendamentoPrisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.agendamentoPrisma = prisma
}
