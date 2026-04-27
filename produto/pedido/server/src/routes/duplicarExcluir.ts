/**
 * duplicarExcluir.ts — Rotas de duplicação e exclusão de pedidos
 *
 * Rota base: /api/v1/pedidos
 *
 * Endpoints:
 *   POST /duplicacoes/preview   — retorna config e pedidos que serão duplicados
 *   POST /duplicacoes/confirmar — executa duplicação em $transaction
 *   POST /duplicacoes/itens     — clona itens dentro do mesmo pedido
 *   POST /exclusoes/preview     — separa pedidos permitidos e bloqueados por status
 *   POST /exclusoes/confirmar   — hard delete com audit trail ANTES
 *   POST /exclusoes/itens       — exclui itens e aplica regra pedido-sem-item
 *
 * Regras:
 *   - Zod valida entrada em todas as rotas
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 *   - Erros via AppError, handler global trata
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { DuplicarService, ExcluirService, AppError } from '../services/duplicarExcluirService.js'

export const duplicarExcluirRouter = Router()

const duplicarService = new DuplicarService()
const excluirService = new ExcluirService()

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

// ── POST /duplicar/preview ────────────────────────────────────────────────────

duplicarExcluirRouter.post('/duplicacoes/preview', async (req: Request, res: Response, next: NextFunction) => {
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
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const resultado = await duplicarService.preview(db, tenantId, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /duplicar/confirmar ──────────────────────────────────────────────────

duplicarExcluirRouter.post('/duplicacoes/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const companyId = (req.headers['x-company-id'] as string | undefined)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao
      const userId   = ctx.idUsuario ?? ''

      const resultado = await duplicarService.confirmar(db, tenantId, companyId ?? tenantId, userId, parse.data)
      res.status(201).json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /duplicar/itens ──────────────────────────────────────────────────────

duplicarExcluirRouter.post('/duplicacoes/itens', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarItensSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const companyId = (req.headers['x-company-id'] as string | undefined)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const resultado = await duplicarService.duplicarItens(db, tenantId, companyId ?? tenantId, parse.data)
      res.status(201).json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /excluir/preview ─────────────────────────────────────────────────────

duplicarExcluirRouter.post('/exclusoes/preview', async (req: Request, res: Response, next: NextFunction) => {
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
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const resultado = await excluirService.preview(db, tenantId, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /excluir/confirmar ───────────────────────────────────────────────────

duplicarExcluirRouter.post('/exclusoes/confirmar', async (req: Request, res: Response, next: NextFunction) => {
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
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao
      const userId   = ctx.idUsuario ?? ''

      const resultado = await excluirService.confirmar(db, tenantId, userId, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /excluir/itens ───────────────────────────────────────────────────────

duplicarExcluirRouter.post('/exclusoes/itens', async (req: Request, res: Response, next: NextFunction) => {
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
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const tenantId = ctx.idOrganizacao
      const userId   = ctx.idUsuario ?? ''

      const resultado = await excluirService.excluirItens(
        db,
        tenantId,
        userId,
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
