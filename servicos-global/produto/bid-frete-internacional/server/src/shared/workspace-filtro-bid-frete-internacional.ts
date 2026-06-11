/**
 * Filtro de workspace para queries BID Frete Internacional — paridade Pedido.
 *
 * Prioridade: query `ids_workspaces` (CSV) > query `id_workspace` > header `x-id-workspace` > org inteira.
 */

import type { Request } from 'express'

/** Parseia query `ids_workspaces` (CSV) do request. */
export function parseIdsWorkspacesQuery(req: Request): string[] | undefined {
  const raw = req.query.ids_workspaces as string | undefined
  if (!raw) return undefined
  const ids = [...new Set(raw.split(',').map(s => s.trim()).filter(Boolean))]
  return ids.length > 0 ? ids : undefined
}

/**
 * Cláusula Prisma `where` para filtrar cotações/BIDs por workspace.
 * Retorna `{}` quando nenhum filtro explícito — org inteira (comportamento legado).
 */
export function clausulaFiltroWorkspaceBidFrete(req: Request): Record<string, unknown> {
  const idsWorkspaces = parseIdsWorkspacesQuery(req)
  const idWorkspaceQuery = req.query.id_workspace as string | undefined
  const idWorkspaceHeader = req.headers['x-id-workspace'] as string | undefined

  if (idsWorkspaces?.length) {
    return { id_workspace: { in: idsWorkspaces } }
  }
  const single = idWorkspaceQuery?.trim() || idWorkspaceHeader?.trim()
  if (single) {
    return { id_workspace: single }
  }
  return {}
}
