/**
 * historico-global-admin.ts — Rota admin de Histórico Global com enrichment
 *
 * Query direta ao banco ORGANIZACAO_DATABASE_URL + enrichment de email via
 * banco do Configurador. Substituiu o antigo self-HTTP-proxy que fazia
 * fetch(localhost:PORT) e duplicava a validação Clerk (causando 401 em
 * produção por race/rate-limit no segundo verifyToken).
 *
 * Diferença em relação ao `historico-organizacao.ts`:
 *   - ADMIN ONLY (mount aplica `requireGravityAdmin`)
 *   - SUPER_ADMIN/ADMIN veem tudo (sem filtro de organização) via
 *     `montarFiltroVisibilidadeHistoricoLog` (Mandamento 04)
 *   - Paginação cursor-based (admin tem volume grande)
 *
 * Responsabilidade:
 *   - Enriquecer cada log com `email_ator_historico_log` — lookup batch em
 *     `prisma.usuario` pelo `id_ator_historico_log`. Tabela `usuario` vive
 *     no banco do Configurador (CONFIGURADOR_DATABASE_URL), separado do
 *     `historico_log` (ORGANIZACAO_DATABASE_URL), por isso JOIN em código
 *     (1 query batch por página, sem N+1).
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

// Lazy-loaded para não bloquear startup do servidor
let _orgModule: Awaited<ReturnType<typeof loadOrgModule>> | null = null
async function loadOrgModule() {
  const { PrismaClient, Prisma } = await import('../../../servicos-plataforma/generated/index.js')
  const { montarFiltroVisibilidadeHistoricoLog } = await import(
    '../../../servicos-plataforma/historico-global/server/lib/visibility.js'
  )
  const client = new PrismaClient({
    datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } },
  })
  return { client, Prisma, montarFiltroVisibilidadeHistoricoLog } as {
    client: InstanceType<typeof PrismaClient>
    Prisma: typeof Prisma
    montarFiltroVisibilidadeHistoricoLog: typeof montarFiltroVisibilidadeHistoricoLog
  }
}
async function getOrgModule() {
  if (!_orgModule) _orgModule = await loadOrgModule()
  return _orgModule
}

const MAX_PAGE_SIZE = 200

// ---------------------------------------------------------------------------
// Validação de query params
// ---------------------------------------------------------------------------

const listQuerySchema = z.object({
  tipo_ator_historico_log:    z.enum(['USUARIO','API','IA','JOB','INTEGRACAO']).optional(),
  id_ator_historico_log:      z.string().optional(),
  modulo_historico_log:       z.string().optional(),
  tipo_recurso_historico_log: z.string().optional(),
  id_recurso_historico_log:   z.string().optional(),
  acao_historico_log:         z.string().optional(),
  status_historico_log:       z.enum(['SUCESSO','FALHA','PARCIAL']).optional(),
  id_produto_historico_log:   z.string().optional(),

  startDate: z.string().optional(),
  endDate:   z.string().optional(),
  search:    z.string().optional(),

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

      const q = parsed.data
      const safeLimit = Math.min(q.limit, MAX_PAGE_SIZE)

      // req.auth já populado pelo requireAuth + requireGravityAdmin do mount
      const { client: orgPrisma, Prisma: PrismaNamespace, montarFiltroVisibilidadeHistoricoLog } = await getOrgModule()

      const usuario = {
        id_usuario:     req.auth.id_usuario,
        nome_usuario:   req.auth.nome_usuario,
        tipo_usuario:   req.auth.tipo_usuario as 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR',
        id_organizacao: req.auth.id_organizacao,
      }

      const visibilityFilter = montarFiltroVisibilidadeHistoricoLog(usuario)

      const createdAtFilter: Record<string, Date> = {}
      if (q.cursor)    createdAtFilter.lt  = new Date(q.cursor)
      if (q.startDate) createdAtFilter.gte = new Date(q.startDate)
      if (q.endDate)   createdAtFilter.lte = new Date(q.endDate)

      const where = {
        ...visibilityFilter,
        ...(q.tipo_ator_historico_log    ? { tipo_ator_historico_log: q.tipo_ator_historico_log } : {}),
        ...(q.id_ator_historico_log      ? { id_ator_historico_log: q.id_ator_historico_log } : {}),
        ...(q.modulo_historico_log       ? { modulo_historico_log: q.modulo_historico_log } : {}),
        ...(q.tipo_recurso_historico_log ? { tipo_recurso_historico_log: q.tipo_recurso_historico_log } : {}),
        ...(q.id_recurso_historico_log   ? { id_recurso_historico_log: q.id_recurso_historico_log } : {}),
        ...(q.acao_historico_log         ? { acao_historico_log: q.acao_historico_log } : {}),
        ...(q.status_historico_log       ? { status_historico_log: q.status_historico_log } : {}),
        ...(q.id_produto_historico_log   ? { id_produto_historico_log: q.id_produto_historico_log } : {}),
        ...(Object.keys(createdAtFilter).length > 0 ? { data_criacao_historico_log: createdAtFilter } : {}),
        ...(q.search
          ? {
              OR: [
                { detalhe_acao_historico_log: { contains: q.search, mode: 'insensitive' as const } },
                { nome_ator_historico_log:    { contains: q.search, mode: 'insensitive' as const } },
                { tipo_recurso_historico_log: { contains: q.search, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      }

      const rawLogs = await orgPrisma.historicoLog.findMany({
        where,
        orderBy: { data_criacao_historico_log: 'desc' },
        take: safeLimit + 1,
      })

      const hasMore = rawLogs.length > safeLimit
      const logs = hasMore ? rawLogs.slice(0, safeLimit) : rawLogs
      const nextCursor = hasMore
        ? logs[logs.length - 1].data_criacao_historico_log.toISOString()
        : null

      // Enriquecer com email — tabela `usuario` (Configurador DB), lookup batch
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
          log.warn('Falha ao enriquecer logs com email_ator_historico_log', { lookupErr })
        }
      }

      const logsEnriquecidos = logs.map((l) => {
        const idAtor = typeof l.id_ator_historico_log === 'string' ? l.id_ator_historico_log : null
        const email_ator_historico_log = idAtor ? (mapaEmailPorIdUsuario.get(idAtor) ?? null) : null
        return { ...l, email_ator_historico_log }
      })

      res.json({ data: logsEnriquecidos, meta: { hasMore, nextCursor, limit: safeLimit } })
    } catch (err) {
      log.error('Erro ao listar logs do historico-global-admin', {
        err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        hasOrgUrl: !!process.env.ORGANIZACAO_DATABASE_URL,
      })
      next(err)
    }
  },
)
