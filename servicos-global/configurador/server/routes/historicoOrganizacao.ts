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
import { logger } from '../lib/logger.js'

export const historicoOrganizacaoRouter = Router()

const log = logger.child({ module: 'historico-organizacao' })

// ---------------------------------------------------------------------------
// ACL — Prisma `historico-global` → contrato consumido pelo frontend
// (Mandamento 06: tradução obrigatória nos pontos onde o nome interno difere
// do nome do contrato. Aqui apenas removemos o sufixo `_historico_log`.)
// ---------------------------------------------------------------------------

interface HistoricoLogPrisma {
  id_historico_log: string
  data_criacao_historico_log: string
  acao_historico_log: string
  detalhe_acao_historico_log: string | null
  tipo_recurso_historico_log: string
  id_recurso_historico_log: string | null
  nome_ator_historico_log: string | null
  tipo_ator_historico_log: string | null
  status_historico_log: string | null
}

function mapPrismaParaContrato(row: HistoricoLogPrisma) {
  return {
    id:            row.id_historico_log,
    data_criacao:  row.data_criacao_historico_log,
    acao:          row.acao_historico_log,
    detalhe_acao:  row.detalhe_acao_historico_log,
    tipo_recurso:  row.tipo_recurso_historico_log,
    id_recurso:    row.id_recurso_historico_log,
    nome_ator:     row.nome_ator_historico_log,
    tipo_ator:     row.tipo_ator_historico_log,
    status:        row.status_historico_log,
  }
}

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

      // Extrair id_organizacao e id_usuario do auth
      const auth = (req as any).auth
      const id_organizacao = auth?.id_organizacao
      if (!id_organizacao) {
        return next(new AppError('id_organizacao obrigatório', 401, 'UNAUTHORIZED'))
      }

      const fetchUrl = `${internalBaseUrl}/api/v1/admin/historico-global/logs?${params.toString()}`
      const response = await fetch(fetchUrl, {
        headers: {
          'x-internal-key': internalKey,
          'x-id-organizacao': id_organizacao,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Erro ao buscar histórico')
        log.error({ status: response.status, body: errorBody, fetchUrl }, 'Falha upstream historico-global')
        return next(new AppError('Erro ao buscar histórico da organização', response.status >= 500 ? 502 : response.status, 'UPSTREAM_ERROR'))
      }

      const data = await response.json()
      const linhasPrisma: HistoricoLogPrisma[] = data.data ?? data.logs ?? []
      const logs = linhasPrisma.map(mapPrismaParaContrato)
      const hasMore = data.meta?.hasMore ?? data.hasMore ?? false

      res.json({
        page,
        limit,
        logs,
        total: data.meta?.total ?? data.total ?? logs.length,
        hasMore,
      })
    } catch (err) {
      next(err)
    }
  },
)
