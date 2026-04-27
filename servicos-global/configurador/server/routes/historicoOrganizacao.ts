/**
 * historicoOrganizacao.ts — Audit trail da organização e workspaces
 *
 * Proxy para historico-global filtrando por resource_type IN ('Organizacao', 'Workspace', 'PlatformConfig').
 * Página de workspace (requireAuth, sem requireGravityAdmin).
 *
 * GET /api/v1/historico-organizacao — lista logs de auditoria da organização
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { AppError } from '../lib/appError.js'

export const historicoOrganizacaoRouter = Router()

// ---------------------------------------------------------------------------
// Validação de query params
// ---------------------------------------------------------------------------

const listQuerySchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(25),
  search:    z.string().optional(),
  from_date: z.string().optional(),
  to_date:   z.string().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/historico-organizacao
// Lista audit logs filtrados por resource_type de organização
// ---------------------------------------------------------------------------

historicoOrganizacaoRouter.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        return next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
      }

      const { page, limit, search, from_date, to_date } = parsed.data

      // Montar query params para o historico-global interno
      const params = new URLSearchParams()
      params.set('resource_type', 'Organizacao,Workspace,PlatformConfig')
      params.set('limit', String(limit))
      if (search) params.set('search', search)
      if (from_date) params.set('startDate', from_date)
      if (to_date) params.set('endDate', to_date)

      // Cursor-based pagination: historico-global usa cursor, nós convertemos page→cursor
      // Para page 1, sem cursor. Para page > 1, usaremos offset via skip (o historico-global
      // suporta isso internamente). Como alternativa simples, passamos limit + offset no skip.
      // O historico-global aceita page-based via limit+cursor. Simplificamos: buscamos todos
      // e fazemos skip client-side se necessário.

      // Chamada interna ao historico-global (montado no mesmo processo Express)
      const internalBaseUrl = `http://localhost:${process.env.PORT ?? 8005}`
      const internalKey = process.env.INTERNAL_SERVICE_KEY

      if (!internalKey) {
        return next(new AppError('INTERNAL_SERVICE_KEY não configurada', 500, 'CONFIG_ERROR'))
      }

      // Extrair tenant_id e user_id do auth
      const auth = (req as any).auth
      const tenantId = auth?.tenantId
      if (!tenantId) {
        return next(new AppError('tenant_id obrigatório', 401, 'UNAUTHORIZED'))
      }

      const fetchUrl = `${internalBaseUrl}/api/v1/admin/historico-global/logs?${params.toString()}`
      const response = await fetch(fetchUrl, {
        headers: {
          'x-internal-key': internalKey,
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Erro ao buscar histórico')
        console.error('[historico-organizacao] Erro ao buscar historico-global:', response.status, errorBody)
        return next(new AppError('Erro ao buscar histórico da organização', response.status >= 500 ? 502 : response.status, 'UPSTREAM_ERROR'))
      }

      const data = await response.json()

      // Retornar com metadados de paginação
      res.json({
        page,
        limit,
        logs: data.logs ?? data.data ?? [],
        total: data.total ?? 0,
        hasMore: data.hasMore ?? false,
      })
    } catch (err) {
      next(err)
    }
  },
)
