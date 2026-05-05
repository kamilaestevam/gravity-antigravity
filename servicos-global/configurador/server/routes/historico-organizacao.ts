/**
 * historico-organizacao.ts — Audit trail da organização e workspaces
 *
 * Proxy fino sobre /api/v1/historico-global/logs (mount não-admin).
 * O upstream se autoescopa por id_organizacao via JWT; admins Gravity
 * recebem visão global automaticamente (Mandamento 04).
 *
 * Responsabilidade do proxy:
 *  - Repassar payload do upstream sem renomear campos (paridade DDD
 *    Prisma↔HTTP↔FE — todos os campos preservam o sufixo `_historico_log`,
 *    conforme REGRA 1.2 de `ddd-nomenclatura`: nomes genéricos como `acao`,
 *    `data_criacao`, `tipo_recurso` exigem sufixo de entidade).
 *  - Estabilizar paginação page-based (best-effort) e expor `nextCursor`.
 *
 * Limitações conhecidas (best-effort, documentadas no doc técnico):
 *  - O filtro `tipo_recurso IN (...)` não é suportado pelo upstream e foi
 *    removido. A página exibe o histórico completo da organização.
 *  - Paginação cursor-based do upstream é repassada via `cursor`/`nextCursor`;
 *    o parâmetro `page` é mantido apenas para retrocompatibilidade do FE.
 *
 * GET /api/v1/historico-organizacao — lista logs de auditoria da organização
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { prisma } from '../lib/prisma.js'

export const historicoOrganizacaoRouter = Router()

const log = logger.child({ module: 'historico-organizacao' })

// ---------------------------------------------------------------------------
// Validação de query params
// ---------------------------------------------------------------------------

const listQuerySchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(25),
  cursor:    z.string().optional(),
  search:    z.string().optional(),
  from_date: z.string().optional(),
  to_date:   z.string().optional(),
})

// ---------------------------------------------------------------------------
// GET /api/v1/historico-organizacao
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

      const { page, limit, cursor, search, from_date, to_date } = parsed.data

      const params = new URLSearchParams()
      params.set('limit', String(limit))
      if (cursor) params.set('cursor', cursor)
      if (search) params.set('search', search)
      if (from_date) params.set('startDate', from_date)
      if (to_date) params.set('endDate', to_date)

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
        return next(new AppError('Erro ao buscar histórico da organização', response.status >= 500 ? 502 : response.status, 'UPSTREAM_ERROR'))
      }

      const data = await response.json()
      const logs: Array<Record<string, unknown>> = data.data ?? data.logs ?? []
      const hasMore = data.meta?.hasMore ?? data.hasMore ?? false
      const nextCursor: string | null = data.meta?.nextCursor ?? null

      // Enriquecer cada log com `email_ator_historico_log` — lookup em `usuario`
      // pelo `id_ator_historico_log`. Tabela `usuario` vive no banco do
      // Configurador (CONFIGURADOR_DATABASE_URL), separado do `historico_log`
      // (ORGANIZACAO_DATABASE_URL), por isso fazemos JOIN em código (1 query
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
          // Falha de lookup não bloqueia a tela do Histórico — só vai sem o email.
          log.warn('Falha ao enriquecer logs com email_ator_historico_log', { lookupErr })
        }
      }

      const logsEnriquecidos = logs.map((l) => {
        const idAtor = typeof l.id_ator_historico_log === 'string' ? l.id_ator_historico_log : null
        const email_ator_historico_log = idAtor ? (mapaEmailPorIdUsuario.get(idAtor) ?? null) : null
        return { ...l, email_ator_historico_log }
      })

      res.json({
        page,
        limit,
        logs: logsEnriquecidos,
        total: logsEnriquecidos.length, // best-effort: upstream é cursor-based, não retorna total
        hasMore,
        nextCursor,
      })
    } catch (err) {
      next(err)
    }
  },
)
