/**
 * kanbanPreferencias.ts — Preferências do Kanban por usuário
 *
 * GET    /api/v1/pedidos/kanban/preferencias  — busca preferências do usuário
 * PUT    /api/v1/pedidos/kanban/preferencias  — salva preferências
 * DELETE /api/v1/pedidos/kanban/preferencias  — restaura padrão (remove registro)
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
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

const KanbanCardCampoSchema = z.object({
  campo:   z.string().min(1),
  label:   z.string().min(1),
  visivel: z.boolean(),
  grupo:   z.enum(['parceiro', 'pedido', 'documentos', 'progresso']).optional(),
})

const KanbanCardConfigSchema = z.object({
  campos:      z.array(KanbanCardCampoSchema),
  dataCritica: z.string().nullable(),
})

const KanbanPreferenciasSchema = z.object({
  abas: z.array(KanbanAbaConfigSchema).refine(
    abas => abas.every(a => a.campos.length <= (LIMITES_ABA[a.aba] ?? 10)),
    { message: 'Número de campos excede o limite permitido para a aba' },
  ),
  card:            KanbanCardConfigSchema.optional(),
  colunas_ocultas: z.array(z.string()).optional(),
})

// ── GET /kanban/preferencias ─────────────────────────────────────────────────

kanbanPreferenciasRouter.get('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idUsuario     = ctx.idUsuario

      const registro = await db.kanbanPreferenciasGlobal.findFirst({
        where: { id_organizacao: idOrganizacao, id_usuario: idUsuario },
      })

      res.json({ data: registro ? registro.preferencias_kanban_preferencias_global : null })
    })
  } catch (err) {
    next(err)
  }
})

// ── PUT /kanban/preferencias ──────────────────────────────────────────────────

kanbanPreferenciasRouter.put('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  const parsed = KanbanPreferenciasSchema.safeParse(req.body)
  if (!parsed.success) {
    return next(new AppError(parsed.error.errors[0]?.message ?? 'Payload inválido', 400, 'VALIDATION_ERROR'))
  }

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idUsuario     = ctx.idUsuario

      const registro = await db.kanbanPreferenciasGlobal.upsert({
        where:  { id_organizacao_id_usuario: { id_organizacao: idOrganizacao, id_usuario: idUsuario } },
        create: { id_organizacao: idOrganizacao, id_usuario: idUsuario, preferencias_kanban_preferencias_global: parsed.data },
        update: { preferencias_kanban_preferencias_global: parsed.data },
      })

      res.json({ data: registro.preferencias_kanban_preferencias_global })
    })
  } catch (err) {
    next(err)
  }
})

// ── DELETE /kanban/preferencias ───────────────────────────────────────────────

kanbanPreferenciasRouter.delete('/preferencias', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const ctx      = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idOrganizacao = ctx.idOrganizacao
      const idUsuario     = ctx.idUsuario

      await db.kanbanPreferenciasGlobal.deleteMany({
        where: { id_organizacao: idOrganizacao, id_usuario: idUsuario },
      })

      res.json({ data: { restaurado: true } })
    })
  } catch (err) {
    next(err)
  }
})
