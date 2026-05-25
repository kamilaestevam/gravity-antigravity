/**
 * Filtro de workspace para queries Pedido — mesma semântica da Lista/Kanban.
 *
 * Prioridade: query `ids_workspaces` (CSV) > header `x-id-workspace` > org inteira.
 */

import type { Request } from 'express'

/** Parseia query `ids_workspaces` (CSV) do request. */
export function parseIdsWorkspacesQuery(req: Request): string[] | undefined {
  const raw = req.query.ids_workspaces as string | undefined
  if (!raw) return undefined
  const ids = raw.split(',').map(s => s.trim()).filter(Boolean)
  return ids.length > 0 ? ids : undefined
}

/**
 * Cláusula Prisma `where` para filtrar pedidos por workspace.
 * Retorna `{}` quando nenhum filtro explícito — org inteira (comportamento legado).
 */
export function clausulaFiltroWorkspacePedido(req: Request): Record<string, unknown> {
  const idsWorkspaces = parseIdsWorkspacesQuery(req)
  const idWorkspaceHeader = req.headers['x-id-workspace'] as string | undefined

  if (idsWorkspaces?.length) {
    return { id_workspace: { in: idsWorkspaces } }
  }
  if (idWorkspaceHeader) {
    return { id_workspace: idWorkspaceHeader }
  }
  return {}
}
