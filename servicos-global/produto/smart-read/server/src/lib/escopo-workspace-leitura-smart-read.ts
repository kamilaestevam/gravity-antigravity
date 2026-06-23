/**
 * Escopo de workspace na lista — paridade Pedido / BID Frete.
 */
import type { Request } from 'express'
import type { Prisma } from '../generated/client/index.js'
import type { PrismaClient } from '../generated/client/index.js'

/** Header x-id-workspace; fallback id_organizacao (mesmo padrão Pedido). */
export function resolverIdWorkspaceLeituraSmartRead(
  req: Request,
  idOrganizacao: string,
): string {
  const header = req.headers['x-id-workspace']
  if (typeof header === 'string' && header.trim()) return header.trim()
  return idOrganizacao
}

/**
 * Filtro de workspace na lista — inclui registros legados com `id_workspace` null
 * (criados antes da paridade Pedido/BID) até backfill completo.
 */
export function clausulaWorkspaceLeituraSmartRead(
  idWorkspace: string,
): Prisma.SnapshotLeituraSmartReadWhereInput {
  return {
    OR: [{ id_workspace: idWorkspace }, { id_workspace: null }],
  }
}

/** Leitura pertence ao workspace ativo (snapshot ou progresso de qualquer usuário da filial). */
export async function leituraVinculadaAoWorkspaceSmartRead(
  prisma: PrismaClient,
  idLeitura: string,
  idWorkspace: string,
): Promise<boolean> {
  const filtro = clausulaWorkspaceLeituraSmartRead(idWorkspace)
  const [snapshot, progresso] = await Promise.all([
    prisma.snapshotLeituraSmartRead.findFirst({
      where: {
        ...filtro,
        id_leitura_legado_snapshot_leitura_smart_read: idLeitura,
      },
      select: { id_snapshot_leitura_smart_read: true },
    }),
    prisma.progressoLeituraSmartRead.findFirst({
      where: {
        ...filtro,
        id_leitura_legado_progresso_leitura_smart_read: idLeitura,
      },
      select: { id_progresso_leitura_smart_read: true },
    }),
  ])
  return Boolean(snapshot ?? progresso)
}
