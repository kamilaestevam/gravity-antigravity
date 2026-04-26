// server/lib/prisma.ts
// Singleton do PrismaClient para o serviço de Relatórios.
// Usa o client gerado a partir do schema composto pelo Coordenador.

import { PrismaClient } from '../../../generated/index.js';

const globalForPrisma = globalThis as unknown as { relatoriosPrisma: PrismaClient };

export const prisma =
  globalForPrisma.relatoriosPrisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.relatoriosPrisma = prisma;
}
