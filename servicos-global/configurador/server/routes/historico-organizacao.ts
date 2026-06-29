/**
 * historico-organizacao.ts — Audit trail da organização e workspaces
 *
 * Query direta via consultarHistoricoLog (sem HTTP loopback — evita 401 Clerk).
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
import {
  consultarHistoricoLog,
  isErroTabelaHistoricoAusente,
} from '../lib/consultar-historico-log.js'

export const historicoOrganizacaoRouter = Router()

const log = logger.child({ module: 'historico-organizacao' })

const listQuerySchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  limit:     z.coerce.number().int().min(1).max(100).default(25),
  cursor:    z.string().optional(),
  search:    z.string().optional(),
  from_date: z.string().optional(),
  to_date:   z.string().optional(),
  id_produto_historico_log: z.string().optional(),
})

historicoOrganizacaoRouter.get(
  '/',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.tipo_usuario || !req.auth?.id_usuario || !req.auth?.id_organizacao) {
        return next(new AppError('Autenticacao necessaria', 401, 'UNAUTHORIZED'))
      }

      const parsed = listQuerySchema.safeParse(req.query)
      if (!parsed.success) {
        return next(new AppError('Parâmetros inválidos', 400, 'VALIDATION_ERROR'))
      }

      const { page, limit, cursor, search, from_date, to_date, id_produto_historico_log } = parsed.data
      const idProdutoPermissao = id_produto_historico_log ?? 'configurador'
      const bypass = temBypassPermissao(req.auth)

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

      const usuario = {
        id_usuario:     req.auth.id_usuario,
        nome_usuario:   req.auth.nome_usuario,
        tipo_usuario:   req.auth.tipo_usuario as 'SUPER_ADMIN' | 'ADMIN' | 'MASTER' | 'PADRAO' | 'FORNECEDOR',
        id_organizacao: req.auth.id_organizacao,
      }

      const resultado = await consultarHistoricoLog({
        usuario,
        limit,
        cursor,
        search,
        fromDate: from_date,
        toDate: to_date,
        idProdutoHistoricoLog: id_produto_historico_log,
        bypassPermissao: bypass,
      })

      const idsAtorUsuario = Array.from(new Set(
        resultado.logs
          .filter((l) => l.tipo_ator_historico_log === 'USUARIO')
          .map((l) => l.id_ator_historico_log)
          .filter((v) => v.length > 0),
      ))

      let mapaEmail = new Map<string, string>()
      if (idsAtorUsuario.length > 0) {
        try {
          const usuarios = await prisma.usuario.findMany({
            where: { id_usuario: { in: idsAtorUsuario } },
            select: { id_usuario: true, email_usuario: true },
          })
          mapaEmail = new Map(usuarios.map((u) => [u.id_usuario, u.email_usuario]))
        } catch (lookupErr) {
          log.warn('Falha ao enriquecer logs com email_ator_historico_log', { lookupErr })
        }
      }

      const logsEnriquecidos = resultado.logs.map((l) => ({
        ...l,
        email_ator_historico_log: mapaEmail.get(l.id_ator_historico_log) ?? null,
      }))

      res.json({
        page,
        limit,
        logs: logsEnriquecidos,
        total: logsEnriquecidos.length,
        hasMore: resultado.hasMore,
        nextCursor: resultado.nextCursor,
      })
    } catch (err: unknown) {
      if (isErroTabelaHistoricoAusente(err)) {
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

      if (err instanceof Error && err.message.includes('ORGANIZACAO_DATABASE_URL ausente')) {
        return next(new AppError(err.message, 503, 'CONFIG_ERROR'))
      }

      log.error('Erro ao listar historico-organizacao', {
        err,
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      })
      next(err)
    }
  },
)
