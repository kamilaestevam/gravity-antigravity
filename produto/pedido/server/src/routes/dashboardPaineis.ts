/**
 * dashboardPaineis.ts — Painéis de dashboard por usuário
 *
 * GET    /api/v1/pedidos/dashboard/paineis             — lista painéis do usuário
 * POST   /api/v1/pedidos/dashboard/paineis             — cria novo painel
 * PUT    /api/v1/pedidos/dashboard/paineis/reordenar   — reordena painéis
 * PUT    /api/v1/pedidos/dashboard/paineis/:id         — atualiza painel (patch)
 * DELETE /api/v1/pedidos/dashboard/paineis/:id         — deleta painel
 */

import { Router, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'
import type { TenantRequest } from '../shared/types.js'

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTenantId(req: TenantRequest): string {
  const id = req.headers['x-tenant-id'] as string | undefined
  if (!id) throw new AppError('Header x-tenant-id obrigatório', 400, 'BAD_REQUEST')
  return id
}

function getUserId(req: TenantRequest): string {
  return (req.headers['x-user-id'] as string | undefined) ?? 'unknown'
}

// ── GET /paineis ──────────────────────────────────────────────────────────────

dashboardPaineisRouter.get('/paineis', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)

    let paineis = await req.prisma.dashboardPainel.findMany({
      where:   { tenant_id, user_id },
      orderBy: { ordem: 'asc' },
    })

    // Cria painel padrão se o usuário não tiver nenhum
    if (paineis.length === 0) {
      const padrao = await req.prisma.dashboardPainel.create({
        data: { tenant_id, user_id, nome: 'Principal', ordem: 0 },
      })
      paineis = [padrao]
    }

    res.json({ data: paineis })
  } catch (err) {
    next(err)
  }
})

// ── POST /paineis ─────────────────────────────────────────────────────────────

dashboardPaineisRouter.post('/paineis', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)

    const parsed = CriarPainelSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }

    const ultimo = await req.prisma.dashboardPainel.findFirst({
      where:   { tenant_id, user_id },
      orderBy: { ordem: 'desc' },
      select:  { ordem: true },
    })

    const painel = await req.prisma.dashboardPainel.create({
      data: {
        tenant_id,
        user_id,
        nome:  parsed.data.nome,
        ordem: (ultimo?.ordem ?? -1) + 1,
      },
    })

    res.status(201).json({ data: painel })
  } catch (err) {
    next(err)
  }
})

// ── PUT /paineis/reordenar — deve vir antes de /:id ───────────────────────────

dashboardPaineisRouter.put('/paineis/reordenar', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)

    const parsed = ReordenarSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }

    await Promise.all(
      parsed.data.ids.map((id, index) =>
        req.prisma.dashboardPainel.updateMany({
          where: { id, tenant_id, user_id },
          data:  { ordem: index },
        }),
      ),
    )

    res.json({ data: { reordenado: true } })
  } catch (err) {
    next(err)
  }
})

// ── PUT /paineis/:id ──────────────────────────────────────────────────────────

dashboardPaineisRouter.put('/paineis/:id', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)
    const { id }    = req.params

    const parsed = AtualizarPainelSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }

    const painel = await req.prisma.dashboardPainel.findFirst({
      where: { id, tenant_id, user_id },
    })
    if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

    const atualizado = await req.prisma.dashboardPainel.update({
      where: { id },
      data:  parsed.data,
    })

    res.json({ data: atualizado })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /paineis/:id ───────────────────────────────────────────────────────

dashboardPaineisRouter.delete('/paineis/:id', async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)
    const { id }    = req.params

    const total = await req.prisma.dashboardPainel.count({
      where: { tenant_id, user_id },
    })
    if (total <= 1) {
      throw new AppError('Não é possível deletar o único painel', 400, 'VALIDATION_ERROR')
    }

    const painel = await req.prisma.dashboardPainel.findFirst({
      where: { id, tenant_id, user_id },
    })
    if (!painel) throw new AppError('Painel não encontrado', 404, 'NOT_FOUND')

    await req.prisma.dashboardPainel.delete({ where: { id } })

    res.json({ data: { deletado: true } })
  } catch (err) {
    next(err)
  }
})
