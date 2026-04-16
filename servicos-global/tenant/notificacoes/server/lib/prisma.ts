// Importa do generated tenant (não do @prisma/client raiz, que aponta para o
// schema do configurador e não inclui Notification/NotificationPreferences).
import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { tenantPrisma: PrismaClient }

export const prisma = globalForPrisma.tenantPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.tenantPrisma = prisma
