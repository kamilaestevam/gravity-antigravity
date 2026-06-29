// server/lib/prisma.ts
// Singleton do PrismaClient para o serviço Gabi.
// Usa o client gerado a partir do schema composto pelo Coordenador.

import { PrismaClient } from '../../../generated/index.js'
import { sincronizarEnvOrganizacaoGabi } from './resolver-url-organizacao-gabi.js'

sincronizarEnvOrganizacaoGabi()

const globalForPrisma = globalThis as unknown as { gabiPrisma: PrismaClient }

export const prisma =
  globalForPrisma.gabiPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.gabiPrisma = prisma
}

export default prisma
