/**
 * kanbanPreferencias.ts — Preferências do Kanban por usuário
 *
 * GET    /api/v1/pedidos/kanban/preferencias  — busca preferências do usuário
 * PUT    /api/v1/pedidos/kanban/preferencias  — salva preferências
 * DELETE /api/v1/pedidos/kanban/preferencias  — restaura padrão (remove registro)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { AppError } from '../errors/AppError.js'

export const kanbanPreferenciasRouter = Router()

// ── Schemas Zod ───────────────────────────────────────────────────────────────

const KanbanCampoConfigSchema = z.object({
  campo:   z.string().min(1),
  label:   z.string().min(1),
  visivel: z.boolean(),
  ordem:   z.number().int().min(0),
})

const KanbanAbaConfigSchema = z.object({
  aba:    z.enum(['pedido', 'quantidades', 'datas']),
  campos: z.array(KanbanCampoConfigSchema),
})

const LIMITES_ABA: Record<string, number> = {
  pedido:      10,
  quantidades: 6,
  datas:       8,
}

const KanbanPreferenciasSchema = z.object({
  abas: z.array(KanbanAbaConfigSchema).refine(
    abas => abas.every(a => a.campos.length <= (LIMITES_ABA[a.aba] ?? 10)),
    { message: 'Número de campos excede o limite permitido para a aba' },
  ),
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function getTenantId(req: Request): string {
  const id = req.headers['x-tenant-id'] as string | undefined
  if (!id) throw new AppError('Header x-tenant-id obrigatório', 400, 'BAD_REQUEST')
  return id
}

function getUserId(req: Request): string {
  return (req.headers['x-user-id'] as string | undefined) ?? 'unknown'
}

// ── GET /kanban/preferencias ─────────────────────────────────────────────────

kanbanPreferenciasRouter.get('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (req as any).prisma as Record<string, any>

    const registro = await db.kanbanPreferencias.findFirst({
      where: { tenant_id, user_id },
    })

    res.json({ data: registro ? registro.preferencias : null })
  } catch (err) {
    next(err)
  }
})

// ── PUT /kanban/preferencias ──────────────────────────────────────────────────

kanbanPreferenciasRouter.put('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)

    const parsed = KanbanPreferenciasSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (req as any).prisma as Record<string, any>

    const registro = await db.kanbanPreferencias.upsert({
      where:  { tenant_id_user_id: { tenant_id, user_id } },
      create: { tenant_id, user_id, preferencias: parsed.data },
      update: { preferencias: parsed.data },
    })

    res.json({ data: registro.preferencias })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /kanban/preferencias ───────────────────────────────────────────────

kanbanPreferenciasRouter.delete('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant_id = getTenantId(req)
    const user_id   = getUserId(req)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = (req as any).prisma as Record<string, any>

    await db.kanbanPreferencias.deleteMany({
      where: { tenant_id, user_id },
    })

    res.json({ data: { restaurado: true } })
  } catch (err) {
    next(err)
  }
})
