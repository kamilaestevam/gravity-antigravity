/**
 * duplicacoes-pedido.ts — Rotas de duplicação de pedidos
 *
 * Rota base: /api/v1/pedidos
 *
 * Endpoints:
 *   POST /duplicacoes/preview   — retorna config e pedidos que serão duplicados
 *   POST /duplicacoes/confirmar — executa duplicação em $transaction
 *   POST /duplicacoes/itens     — clona itens dentro do mesmo pedido
 *
 * Regras:
 *   - Zod valida entrada em todas as rotas
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 *   - Erros via AppError, handler global trata
 *
 * Originado do split de duplicarExcluir.ts (Gamma-3, leva 3 — DDD: responsabilidade única).
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { DuplicarService, AppError } from '../services/duplicarExcluirService.js'

export const duplicacoesPedidoRouter = Router()

const duplicarService = new DuplicarService()

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const DuplicarPreviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido para duplicar'),
})

const DuplicarConfirmarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  numeros: z.record(z.string()).optional(),
})

const DuplicarItensSchema = z.object({
  pedido_id: z.string().min(1),
  item_ids: z.array(z.string().min(1)).min(1),
})

// ── POST /duplicacoes/preview ─────────────────────────────────────────────────

duplicacoesPedidoRouter.post('/duplicacoes/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarPreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const id_organizacao = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const resultado = await duplicarService.preview(db, id_organizacao, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /duplicacoes/confirmar ───────────────────────────────────────────────

duplicacoesPedidoRouter.post('/duplicacoes/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const id_workspace = (req.headers['x-id-workspace'] as string | undefined)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx            = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const id_organizacao = ctx.idOrganizacao
      const id_usuario     = ctx.idUsuario ?? ''
      const nome_usuario   = (req as { auth?: { nome_usuario?: string } }).auth?.nome_usuario ?? id_usuario

      const resultado = await duplicarService.confirmar(db, id_organizacao, id_workspace ?? id_organizacao, id_usuario, nome_usuario, parse.data)
      res.status(201).json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /duplicacoes/itens ───────────────────────────────────────────────────

duplicacoesPedidoRouter.post('/duplicacoes/itens', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarItensSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const id_workspace = (req.headers['x-id-workspace'] as string | undefined)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const id_organizacao = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const resultado = await duplicarService.duplicarItens(db, id_organizacao, id_workspace ?? id_organizacao, parse.data)
      res.status(201).json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// Re-exportar AppError para que o error handler do index.ts possa identificá-lo
export { AppError }
