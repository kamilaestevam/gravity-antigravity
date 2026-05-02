import { PrismaClient } from '@prisma/client';

export const getPrisma = (): PrismaClient => {
  const g = global as any;
  if (!g.prismaHelpdesk) {
    g.prismaHelpdesk = new PrismaClient();
  }
  return g.prismaHelpdesk as PrismaClient;
};
