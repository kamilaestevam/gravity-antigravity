/**
 * exclusoes-pedido.ts — Rotas de exclusão de pedidos
 *
 * Rota base: /api/v1/pedidos
 *
 * Endpoints:
 *   POST /exclusoes/preview     — separa pedidos permitidos e bloqueados por status
 *   POST /exclusoes/confirmar   — hard delete com audit trail ANTES
 *   POST /exclusoes/itens       — exclui itens e aplica regra pedido-sem-item
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
import { ExcluirService, AppError } from '../services/duplicarExcluirService.js'

export const exclusoesPedidoRouter = Router()

const excluirService = new ExcluirService()

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const ExcluirPreviewSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido para excluir'),
})

const ExcluirConfirmarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

const ExcluirItensSchema = z.object({
  pedido_id: z.string().min(1),
  item_ids: z.array(z.string().min(1)).min(1),
})

// ── POST /exclusoes/preview ───────────────────────────────────────────────────

exclusoesPedidoRouter.post('/exclusoes/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirPreviewSchema.safeParse(req.body)
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

      const resultado = await excluirService.preview(db, id_organizacao, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /exclusoes/confirmar ─────────────────────────────────────────────────

exclusoesPedidoRouter.post('/exclusoes/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx            = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const id_organizacao = ctx.idOrganizacao
      const id_usuario     = ctx.idUsuario ?? ''
      const nome_usuario   = (req as { auth?: { nome_usuario?: string } }).auth?.nome_usuario ?? id_usuario

      const resultado = await excluirService.confirmar(db, id_organizacao, id_usuario, nome_usuario, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /exclusoes/itens ─────────────────────────────────────────────────────

exclusoesPedidoRouter.post('/exclusoes/itens', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirItensSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx            = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const id_organizacao = ctx.idOrganizacao
      const id_usuario     = ctx.idUsuario ?? ''
      const nome_usuario   = (req as { auth?: { nome_usuario?: string } }).auth?.nome_usuario ?? id_usuario

      const resultado = await excluirService.excluirItens(
        db,
        id_organizacao,
        id_usuario,
        nome_usuario,
        parse.data.pedido_id,
        parse.data.item_ids,
      )
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// Re-exportar AppError para que o error handler do index.ts possa identificá-lo
export { AppError }
