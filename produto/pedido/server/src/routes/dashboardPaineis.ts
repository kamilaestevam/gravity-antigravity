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

// ── ACL: mapper Prisma DDD → contrato legacy do frontend ──────────────────────

interface PainelDB {
  id_dashboard_painel:               string
  id_organizacao:                    string
  id_usuario:                        string
  nome_dashboard_painel:             string
  ordem_dashboard_painel:            number
  is_visivel_dashboard_painel:       boolean
  widgets_json_dashboard_painel:     string
  data_criacao_dashboard_painel:     Date | string
  data_atualizacao_dashboard_painel: Date | string
}

function mapPainel(p: PainelDB): Record<string, unknown> {
  return {
    id:           p.id_dashboard_painel,
    tenant_id:    p.id_organizacao,
    user_id:      p.id_usuario,
    nome:         p.nome_dashboard_painel,
    ordem:        p.ordem_dashboard_painel,
    is_visivel:   p.is_visivel_dashboard_painel,
    widgets_json: p.widgets_json_dashboard_painel,
    created_at:   p.data_criacao_dashboard_painel,
    updated_at:   p.data_atualizacao_dashboard_painel,
  }
}

function mapPatch(patch: { nome?: string; is_visivel?: boolean; widgets_json?: string }): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  if (patch.nome !== undefined)         data.nome_dashboard_painel = patch.nome
  if (patch.is_visivel !== undefined)   data.is_visivel_dashboard_painel = patch.is_visivel
  if (patch.widgets_json !== undefined) data.widgets_json_dashboard_painel = patch.widgets_json
  return data
}

// ── GET /paineis ──────────────────────────────────────────────────────────────

dashboardPaineisRouter.get('/paineis', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withTenant(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db        = rawDb as any
      const ctx       = (req as unknown as { tenant: TenantContext }).tenant
      const tenant_id = ctx.tenantId
      const user_id   = ctx.userId

      let paineis = await db.pedidoDashboardPainel.findMany({
        where:   { id_organizacao: tenant_id, id_usuario: user_id },
        orderBy: { ordem_dashboard_painel: 'asc' },
      })

      if (paineis.length === 0) {
        const padrao = await db.pedidoDashboardPainel.create({
          data: {
            id_organizacao:        tenant_id,
            id_usuario:            user_id,
            nome_dashboard_painel: 'Principal',
            ordem_dashboard_painel: 0,
          },
        })
        paineis = [padrao]
      }

      res.json({ data: (paineis as PainelDB[]).map(mapPainel) })
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

      const ultimo = await db.pedidoDashboardPainel.findFirst({
        where:   { id_organizacao: tenant_id, id_usuario: user_id },
        orderBy: { ordem_dashboard_painel: 'desc' },
        select:  { ordem_dashboard_painel: true },
      })

      const painel = await db.pedidoDashboardPainel.create({
        data: {
          id_organizacao:         tenant_id,
          id_usuario:             user_id,
          nome_dashboard_painel:  parsed.data.nome,
          ordem_dashboard_painel: (ultimo?.ordem_dashboard_painel ?? -1) + 1,
        },
      })

      res.status(201).json({ data: mapPainel(painel as PainelDB) })
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
          db.pedidoDashboardPainel.updateMany({
            where: { id_dashboard_painel: id, id_organizacao: tenant_id, id_usuario: user_id },
            data:  { ordem_dashboard_painel: index },
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

      const painel = await db.pedidoDashboardPainel.findFirst({
        where: { id_dashboard_painel: id, id_organizacao: tenant_id, id_usuario: user_id },
      })
      if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

      const atualizado = await db.pedidoDashboardPainel.update({
        where: { id_dashboard_painel: id },
        data:  mapPatch(parsed.data),
      })

      res.json({ data: mapPainel(atualizado as PainelDB) })
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

      const total = await db.pedidoDashboardPainel.count({
        where: { id_organizacao: tenant_id, id_usuario: user_id },
      })
      if (total <= 1) {
        throw new AppError('Não é possível deletar o único painel', 400, 'VALIDATION_ERROR')
      }

      const painel = await db.pedidoDashboardPainel.findFirst({
        where: { id_dashboard_painel: id, id_organizacao: tenant_id, id_usuario: user_id },
      })
      if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

      await db.pedidoDashboardPainel.delete({ where: { id_dashboard_painel: id } })

      res.json({ data: { deletado: true } })
    })
  } catch (err) {
    next(err)
  }
})
