import type { Empresa as PrismaEmpresa } from '../../../generated/index.js'
import { prisma } from '../lib/prisma.js'

export async function obterEmpresaDaOrganizacao(idOrganizacao: string): Promise<PrismaEmpresa | null> {
  return prisma.empresa.findUnique({ where: { id_organizacao_empresa: idOrganizacao } })
}
