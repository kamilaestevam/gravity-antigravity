import { PrismaClient } from '@prisma/client'

// Singleton para evitar exaustão de conexões no dev
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
