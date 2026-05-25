/**
 * Invalida cache do dashboard após mutações em /api/v1/pedidos/*.
 */

import type { Request, Response, NextFunction } from 'express'
import { invalidateDashboardCachePedido } from '../shared/dashboard-cache-pedido.js'

const METODOS_MUTACAO = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export function invalidarCacheDashboardAoMutarPedido(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!METODOS_MUTACAO.has(req.method)) {
    next()
    return
  }

  res.on('finish', () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return
    const ctx = req as Request & { organizacao?: { idOrganizacao?: string } }
    const idOrganizacao = ctx.organizacao?.idOrganizacao
    if (idOrganizacao) {
      void invalidateDashboardCachePedido(idOrganizacao).catch((err) => {
        console.warn('[invalidarCacheDashboard] falha ao invalidar', err)
      })
    }
  })

  next()
}
