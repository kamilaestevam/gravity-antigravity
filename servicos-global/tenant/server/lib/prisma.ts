// server/lib/prisma.ts
// Singleton do PrismaClient compartilhado por todos os serviços tenant.
// Instanciado uma única vez no processo do super-servidor.

// Importa diretamente do client gerado pelo tenant (não do @prisma/client raiz,
// que aponta para o schema do configurador e não inclui os modelos tenant).
import { PrismaClient } from '../../generated/index.js'

const globalForPrisma = globalThis as unknown as { tenantPrisma: PrismaClient }

export const prisma = globalForPrisma.tenantPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.tenantPrisma = prisma
}
