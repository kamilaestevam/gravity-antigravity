/**
 * duplicarExcluir.ts — Rotas de duplicação e exclusão de pedidos
 *
 * Rota base: /api/v1/pedidos
 *
 * Endpoints:
 *   POST /duplicar/preview   — retorna config e pedidos que serão duplicados
 *   POST /duplicar/confirmar — executa duplicação em $transaction
 *   POST /duplicar/itens     — clona itens dentro do mesmo pedido
 *   POST /excluir/preview    — separa pedidos permitidos e bloqueados por status
 *   POST /excluir/confirmar  — hard delete com audit trail ANTES
 *   POST /excluir/itens      — exclui itens e aplica regra pedido-sem-item
 *
 * Regras:
 *   - Zod valida entrada em todas as rotas
 *   - tenant_id injetado pelo tenantIsolationMiddleware
 *   - Erros via AppError, handler global trata
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'
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

duplicarExcluirRouter.post('/duplicar/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarPreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const resultado = await duplicarService.preview(db, tenantId, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /duplicar/confirmar ──────────────────────────────────────────────────

duplicarExcluirRouter.post('/duplicar/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const companyId = (req.headers['x-company-id'] as string | undefined)

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { tenant: TenantContext }).tenant
      const tenantId = ctx.tenantId
      const userId   = ctx.userId ?? ''

      const resultado = await duplicarService.confirmar(db, tenantId, companyId ?? tenantId, userId, parse.data)
      res.status(201).json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /duplicar/itens ──────────────────────────────────────────────────────

duplicarExcluirRouter.post('/duplicar/itens', async (req: Request, res: Response, next: NextFunction) => {
  const parse = DuplicarItensSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const companyId = (req.headers['x-company-id'] as string | undefined)

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const resultado = await duplicarService.duplicarItens(db, tenantId, companyId ?? tenantId, parse.data)
      res.status(201).json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /excluir/preview ─────────────────────────────────────────────────────

duplicarExcluirRouter.post('/excluir/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirPreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { tenant: TenantContext }).tenant.tenantId

      const resultado = await excluirService.preview(db, tenantId, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /excluir/confirmar ───────────────────────────────────────────────────

duplicarExcluirRouter.post('/excluir/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { tenant: TenantContext }).tenant
      const tenantId = ctx.tenantId
      const userId   = ctx.userId ?? ''

      const resultado = await excluirService.confirmar(db, tenantId, userId, parse.data.ids)
      res.json(resultado)
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /excluir/itens ───────────────────────────────────────────────────────

duplicarExcluirRouter.post('/excluir/itens', async (req: Request, res: Response, next: NextFunction) => {
  const parse = ExcluirItensSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { tenant: TenantContext }).tenant
      const tenantId = ctx.tenantId
      const userId   = ctx.userId ?? ''

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
