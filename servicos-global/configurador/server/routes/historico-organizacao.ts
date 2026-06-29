/**
 * historico-organizacao.ts — Audit trail da organização e workspaces
 *
 * Query direta ao banco ORGANIZACAO_DATABASE_URL + enrichment de email via
 * banco do Configurador. Evita self-HTTP-proxy (fetch loopback) que duplicava
 * validação Clerk e causava 401 em produção — mesmo padrão de
 * historico-global-admin.ts.
 *
 * GET /api/v1/historico-organizacao — lista logs de auditoria da organização
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import { AppError } from '../lib/appError.js'
import { logger } from '../lib/logger.js'
import { prisma } from '../lib/prisma.js'
import { servicoPermissaoUsuario } from '../services/permissao-usuario-servico.js'
import { temBypassPermissao } from '../../shared/index.js'

export const historicoOrganizacaoRouter = Router()

const log = logger.child({ module: 'historico-organizacao' })

let _orgModule: Awaited<ReturnType<typeof loadOrgModule>> | null = null
async function loadOrgModule() {
  const { PrismaClient } = await import('../../../servicos-plataforma/generated/index.js')
  const { montarFiltroVisibilidadeHistoricoLog } = await import(
    '../../../servicos-plataforma/historico-global/server/lib/visibility.js'
  )
  const client = new PrismaClient({
    datasources: { db: { url: process.env.ORGANIZACAO_DATABASE_URL } },
  })
  return { client, montarFiltroVisibilidadeHistoricoLog } as {
    client: InstanceType<typeof PrismaClient>
    montarFiltroVisibilidadeHistoricoLog: typeof montarFiltroVisibilidadeHistoricoLog
  }
}
async function getOrgModule() {
  if (!_orgModule) _orgModule = await loadOrgModule()
  return _orgModule
}

const MAX_PAGE_SIZE = 100

const listQuerySchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(25),
  cursor:    z.string().optional(),
  search:    z.string().optional(),
  from_date: z.string().optional(),
  to_date:   z.string().optional(),
  id_produto_historico_log: z.string().optional(),
})

function montarFiltroProdutoHistorico(
  idProdutoUrl: string | undefined,
  bypassPermissao: boolean,
): Record<string, unknown> | undefined {
  // Sem query param: MASTER/ADMIN veem todo o histórico da org; PADRAO usa escopo configurador.
  if (!idProdutoUrl) {
    if (bypassPermissao) return undefined
    return {
      OR: [
        { id_produto_historico_log: 'configurador' },
        { id_produto_historico_log: null },
      ],
    }
  }
  return { id_produto_historico_log: idProdutoUrl }
}

historicoOrganizacaoRouter.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        return next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
      }

      const { page, limit, cursor, search, from_date, to_date, id_produto_historico_log } = parsed.data
      const idProdutoPermissao = id_produto_historico_log ?? 'configurador'
      const bypass = temBypassPermissao(req.auth!)

      if (!req.auth?.tipo_usuario || !req.auth?.id_usuario || !req.auth?.id_organizacao) {
        return next(new AppError('Autenticacao necessaria', 401, 'UNAUTHORIZED'))
      }

      if (!bypass) {
        const permitido = await servicoPermissaoUsuario.verificarPermissaoEmAlgumWorkspace({
          id_organizacao: req.auth.id_organizacao,
          id_usuario:     req.auth.id_usuario,
          slug_produto:   idProdutoPermissao,
          secao:          'historico',
          acao:           'ver',
        })
        if (!permitido) {
          return next(new AppError(
            `Permissao negada: ${idProdutoPermissao}:historico:ver`,
            403,
            'FORBIDDEN_PERMISSION',
          ))
        }
      }

      if (!process.env.ORGANIZACAO_DATABASE_URL?.trim()) {
        return next(new AppError(
          'Banco de histórico indisponível (ORGANIZACAO_DATABASE_URL ausente)',
          503,
          'CONFIG_ERROR',
        ))
      }

      const safeLimit = Math.min(limit, MAX_PAGE_SIZE)
      const { client: orgPrisma, montarFiltroVisibilidadeHistoricoLog } = await getOrgModule()

      const usuario = {
        id_usuario:     req.auth.id_usuario,
        nome_usuario:   req.auth.nome_usuario,
        tipo_usuario:   req.auth.tipo_usuario as 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR',
        id_organizacao: req.auth.id_organizacao,
      }

      const visibilityFilter = montarFiltroVisibilidadeHistoricoLog(usuario)
      const filtroProduto = montarFiltroProdutoHistorico(id_produto_historico_log, bypass)

      const createdAtFilter: Record<string, Date> = {}
      if (cursor)    createdAtFilter.lt  = new Date(cursor)
      if (from_date) createdAtFilter.gte = new Date(from_date)
      if (to_date)   createdAtFilter.lte = new Date(to_date)

      const where = {
        ...visibilityFilter,
        ...(filtroProduto ?? {}),
        ...(Object.keys(createdAtFilter).length > 0 ? { data_criacao_historico_log: createdAtFilter } : {}),
        ...(search
          ? {
              OR: [
                { detalhe_acao_historico_log: { contains: search, mode: 'insensitive' as const } },
                { nome_ator_historico_log:    { contains: search, mode: 'insensitive' as const } },
                { tipo_recurso_historico_log: { contains: search, mode: 'insensitive' as const } },
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
      const logsSlice = hasMore ? rawLogs.slice(0, safeLimit) : rawLogs
      const nextCursor = hasMore
        ? logsSlice[logsSlice.length - 1].data_criacao_historico_log.toISOString()
        : null

      const idsAtorUsuario = Array.from(new Set(
        logsSlice
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

      const logsEnriquecidos = logsSlice.map((l) => {
        const idAtor = typeof l.id_ator_historico_log === 'string' ? l.id_ator_historico_log : null
        const email_ator_historico_log = idAtor ? (mapaEmailPorIdUsuario.get(idAtor) ?? null) : null
        return { ...l, email_ator_historico_log }
      })

      res.json({
        page,
        limit: safeLimit,
        logs: logsEnriquecidos,
        total: logsEnriquecidos.length,
        hasMore,
        nextCursor,
      })
    } catch (err: unknown) {
      const isPrismaTableMissing =
        err != null &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: string }).code === 'P2021'

      if (isPrismaTableMissing) {
        log.warn('Tabela historico_log ausente — retornando lista vazia')
        return res.json({
          page: 1,
          limit: 25,
          logs: [],
          total: 0,
          hasMore: false,
          nextCursor: null,
        })
      }

      log.error('Erro ao listar historico-organizacao', {
        err,
        message: err instanceof Error ? err.message : String(err),
        hasOrgUrl: !!process.env.ORGANIZACAO_DATABASE_URL,
      })
      next(err)
    }
  },
)
