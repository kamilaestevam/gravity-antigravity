/**
 * historico-global-admin.ts — Proxy admin enriquecedor de Histórico Global
 *
 * Proxy fino sobre /api/v1/historico-global/logs (mount não-admin do upstream
 * historico-global). Diferença em relação ao `historico-organizacao.ts`:
 *
 *   - Esta rota é ADMIN ONLY (mount aplica `requireGravityAdmin`). O upstream
 *     promove SUPER_ADMIN/ADMIN a visão global automaticamente via
 *     `montarFiltroVisibilidadeHistoricoLog` (Mandamento 04).
 *   - Mantém paginação cursor-based do upstream (admin tem volume grande,
 *     não vale degradar para page-based).
 *   - Repassa filtros DDD canonical para o upstream sem renomear:
 *     `tipo_ator_historico_log`, `status_historico_log`, `modulo_historico_log`,
 *     `acao_historico_log`, `id_ator_historico_log`, `tipo_recurso_historico_log`,
 *     `id_recurso_historico_log`, `id_produto_historico_log`, `search`, `cursor`,
 *     `limit`, `startDate`, `endDate` (universais HTTP).
 *
 * Responsabilidade do proxy:
 *
 *   - Enriquecer cada log com `email_ator_historico_log` — lookup batch em
 *     `prisma.usuario` pelo `id_ator_historico_log` (apenas atores tipo
 *     USUARIO). A tabela `usuario` vive no banco do Configurador
 *     (CONFIGURADOR_DATABASE_URL), separado do `historico_log`
 *     (ORGANIZACAO_DATABASE_URL), por isso o JOIN é em código (1 query
 *     batch por página, sem N+1).
 *
 * O mount em `server/index.ts` posiciona este proxy ANTES do
 * `historicoRouter` para que `GET /logs` seja interceptado aqui. Outras
 * rotas (`/logs/:id`, `/logs/export`, `/alerts`, `/alert-rules`, `/lgpd`)
 * continuam servidas direto pelo `historicoRouter`.
 *
 * GET /api/v1/admin/historico-global/logs — lista logs enriquecidos
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { prisma } from '../lib/prisma.js'

export const historicoGlobalAdminRouter = Router()

const log = logger.child({ module: 'historico-global-admin' })

// ---------------------------------------------------------------------------
// Validação de query params — espelha ListHistoryQuerySchema do upstream
// ---------------------------------------------------------------------------

const listQuerySchema = z.object({
  // Filtros DDD canonical
  tipo_ator_historico_log:    z.enum(['USUARIO','API','IA','JOB','INTEGRACAO']).optional(),
  id_ator_historico_log:      z.string().optional(),
  modulo_historico_log:       z.string().optional(),
  tipo_recurso_historico_log: z.string().optional(),
  id_recurso_historico_log:   z.string().optional(),
  acao_historico_log:         z.string().optional(),
  status_historico_log:       z.enum(['SUCESSO','FALHA','PARCIAL']).optional(),
  id_produto_historico_log:   z.string().optional(),

  // Universais HTTP (exceção da skill ddd-nomenclatura)
  startDate: z.string().optional(),
  endDate:   z.string().optional(),
  search:    z.string().optional(),

  // Paginação cursor-based
  cursor: z.string().optional(),
  limit:  z.coerce.number().int().min(1).max(200).default(50),
})

// ---------------------------------------------------------------------------
// GET /logs
// ---------------------------------------------------------------------------

historicoGlobalAdminRouter.get(
  '/logs',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        return next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
      }

      const params = new URLSearchParams()
      const q = parsed.data
      if (q.tipo_ator_historico_log)     params.set('tipo_ator_historico_log', q.tipo_ator_historico_log)
      if (q.id_ator_historico_log)       params.set('id_ator_historico_log', q.id_ator_historico_log)
      if (q.modulo_historico_log)        params.set('modulo_historico_log', q.modulo_historico_log)
      if (q.tipo_recurso_historico_log)  params.set('tipo_recurso_historico_log', q.tipo_recurso_historico_log)
      if (q.id_recurso_historico_log)    params.set('id_recurso_historico_log', q.id_recurso_historico_log)
      if (q.acao_historico_log)          params.set('acao_historico_log', q.acao_historico_log)
      if (q.status_historico_log)        params.set('status_historico_log', q.status_historico_log)
      if (q.id_produto_historico_log)    params.set('id_produto_historico_log', q.id_produto_historico_log)
      if (q.startDate)                   params.set('startDate', q.startDate)
      if (q.endDate)                     params.set('endDate', q.endDate)
      if (q.search)                      params.set('search', q.search)
      if (q.cursor)                      params.set('cursor', q.cursor)
      params.set('limit', String(q.limit))

      const authorization = req.headers.authorization
      if (!authorization) {
        return next(new AppError('Authorization ausente', 401, 'UNAUTHORIZED'))
      }

      const internalBaseUrl = `http://localhost:${process.env.PORT ?? 8005}`
      const fetchUrl = `${internalBaseUrl}/api/v1/historico-global/logs?${params.toString()}`

      const response = await fetch(fetchUrl, {
        headers: {
          Authorization: authorization,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Erro ao buscar histórico')
        log.error('Falha upstream historico-global', { status: response.status, body: errorBody, fetchUrl })
        return next(new AppError(
          'Erro ao buscar histórico global (admin)',
          response.status >= 500 ? 502 : response.status,
          'UPSTREAM_ERROR',
        ))
      }

      const data = await response.json()
      const logs: Array<Record<string, unknown>> = data.data ?? []
      const meta = data.meta ?? { hasMore: false, nextCursor: null, limit: q.limit }

      // Enriquecer cada log com `email_ator_historico_log` — lookup em
      // `usuario` pelo `id_ator_historico_log`. Tabela `usuario` vive no
      // banco do Configurador, separado do `historico_log` (banco da
      // organização-shared), por isso fazemos JOIN em código (1 query
      // batch por página, não N+1).
      const idsAtorUsuario = Array.from(new Set(
        logs
          .filter((l) => l.tipo_ator_historico_log === 'USUARIO')
          .map((l) => l.id_ator_historico_log)
          .filter((v): v is string => typeof v === 'string' && v.length > 0)
      ))

      let mapaEmailPorIdUsuario = new Map<string, string>()
      if (idsAtorUsuario.length > 0) {
        try {
          const usuarios = await prisma.usuario.findMany({
            where: { id_usuario: { in: idsAtorUsuario } },
            select: { id_usuario: true, email_usuario: true },
          })
          mapaEmailPorIdUsuario = new Map(usuarios.map((u) => [u.id_usuario, u.email_usuario]))
        } catch (lookupErr) {
          // Falha de lookup não bloqueia a tela do Histórico Global —
          // só vai sem o email. Log estruturado para diagnóstico.
          log.warn('Falha ao enriquecer logs com email_ator_historico_log', { lookupErr })
        }
      }

      const logsEnriquecidos = logs.map((l) => {
        const idAtor = typeof l.id_ator_historico_log === 'string' ? l.id_ator_historico_log : null
        const email_ator_historico_log = idAtor ? (mapaEmailPorIdUsuario.get(idAtor) ?? null) : null
        return { ...l, email_ator_historico_log }
      })

      res.json({ data: logsEnriquecidos, meta })
    } catch (err) {
      next(err)
    }
  },
)
