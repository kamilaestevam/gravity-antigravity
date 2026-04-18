/**
 * dashboardPaineis.ts — Painéis de dashboard por usuário
 *
 * GET    /api/v1/pedidos/dashboard/paineis             — lista painéis do usuário
 * POST   /api/v1/pedidos/dashboard/paineis             — cria novo painel
 * PUT    /api/v1/pedidos/dashboard/paineis/reordenar   — reordena painéis
 * PUT    /api/v1/pedidos/dashboard/paineis/:id         — atualiza painel (patch)
 * DELETE /api/v1/pedidos/dashboard/paineis/:id         — deleta painel
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withTenant, type TenantContext } from '@gravity/tenant-resolver'
import { AppError } from '../errors/AppError.js'

export const dashboardPaineisRouter = Router()

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const CriarPainelSchema = z.object({
  nome: z.string().min(1, 'Nome obrigatório').max(60, 'Máximo 60 caracteres'),
})

const AtualizarPainelSchema = z.object({
  nome:         z.string().min(1).max(60).optional(),
  is_visivel:   z.boolean().optional(),
  widgets_json: z.string().optional(),
})

const ReordenarSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, 'Informe ao menos um id'),
})

// ── GET /paineis ──────────────────────────────────────────────────────────────

dashboardPaineisRouter.get('/paineis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id = ctx.tenantId
      const user_id   = ctx.userId

      let paineis = await db.dashboardPainel.findMany({
        where:   { tenant_id, user_id },
        orderBy: { ordem: 'asc' },
      })

      if (paineis.length === 0) {
        const padrao = await db.dashboardPainel.create({
          data: { tenant_id, user_id, nome: 'Principal', ordem: 0 },
        })
        paineis = [padrao]
      }

      res.json({ data: paineis })
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /paineis ─────────────────────────────────────────────────────────────

dashboardPaineisRouter.post('/paineis', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = CriarPainelSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id = ctx.tenantId
      const user_id   = ctx.userId

      const ultimo = await db.dashboardPainel.findFirst({
        where:   { tenant_id, user_id },
        orderBy: { ordem: 'desc' },
        select:  { ordem: true },
      })

      const painel = await db.dashboardPainel.create({
        data: {
          tenant_id,
          user_id,
          nome:  parsed.data.nome,
          ordem: (ultimo?.ordem ?? -1) + 1,
        },
      })

      res.status(201).json({ data: painel })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /paineis/reordenar — deve vir antes de /:id ───────────────────────────

dashboardPaineisRouter.put('/paineis/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = ReordenarSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id = ctx.tenantId
      const user_id   = ctx.userId

      await Promise.all(
        parsed.data.ids.map((id, index) =>
          db.dashboardPainel.updateMany({
            where: { id, tenant_id, user_id },
            data:  { ordem: index },
          }),
        ),
      )

      res.json({ data: { reordenado: true } })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /paineis/:id ──────────────────────────────────────────────────────────

dashboardPaineisRouter.put('/paineis/:id', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = AtualizarPainelSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id = ctx.tenantId
      const user_id   = ctx.userId
      const { id }   = req.params

      const painel = await db.dashboardPainel.findFirst({
        where: { id, tenant_id, user_id },
      })
      if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

      const atualizado = await db.dashboardPainel.update({
        where: { id },
        data:  parsed.data,
      })

      res.json({ data: atualizado })
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /paineis/:id ───────────────────────────────────────────────────────

dashboardPaineisRouter.delete('/paineis/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id = ctx.tenantId
      const user_id   = ctx.userId
      const { id }   = req.params

      const total = await db.dashboardPainel.count({
        where: { tenant_id, user_id },
      })
      if (total <= 1) {
        throw new AppError('Não é possível deletar o único painel', 400, 'VALIDATION_ERROR')
      }

      const painel = await db.dashboardPainel.findFirst({
        where: { id, tenant_id, user_id },
      })
      if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

      await db.dashboardPainel.delete({ where: { id } })

      res.json({ data: { deletado: true } })
    })
  } catch (err) {
    next(err)
  }
})
