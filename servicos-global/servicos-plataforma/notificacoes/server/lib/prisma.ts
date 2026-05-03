// Importa do generated da plataforma (não do @prisma/client raiz, que aponta
// para o schema do configurador e não inclui os modelos da plataforma).
import { PrismaClient } from '../../../generated/index.js'

const globalForPrisma = globalThis as unknown as { plataformaPrisma: PrismaClient }

export const prisma = globalForPrisma.plataformaPrisma ?? new PrismaClient({ datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } } })

if (process.env.NODE_ENV !== 'production') globalForPrisma.plataformaPrisma = prisma
