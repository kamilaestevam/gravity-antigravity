/**
 * lote.ts — Operações em lote sobre pedidos
 *
 * Rota base: /api/v1/pedidos/lote
 *
 * Endpoints:
 *   POST /status/preview   — simula mudança de status, retorna afetados/bloqueados
 *   POST /status/confirmar — aplica mudança de status em lote
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'

export const loteRouter = Router()

const STATUS_VALIDOS = ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'] as const
type StatusPedido = typeof STATUS_VALIDOS[number]

const StatusPreviewSchema = z.object({
  ids:        z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido'),
  status_novo: z.enum(STATUS_VALIDOS),
})

const StatusConfirmarSchema = z.object({
  ids:        z.array(z.string().min(1)).min(1),
  status_novo: z.enum(STATUS_VALIDOS),
})

// ── POST /status/preview ──────────────────────────────────────────────────────

loteRouter.post('/status/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = StatusPreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db       = (req as any).prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantId = (req as any).tenantId as string
  const { ids, status_novo } = parse.data

  try {
    const pedidos = await db.pedido.findMany({
      where: { id: { in: ids }, tenant_id: tenantId },
      select: { id: true, numero_pedido: true, status: true },
    })

    const afetados = pedidos.map((p: { id: string; numero_pedido: string; status: string }) => ({
      id:            p.id,
      numero_pedido: p.numero_pedido,
      status_atual:  p.status,
      status_novo,
    }))

    res.json({ total: afetados.length, afetados, bloqueados: [] })
  } catch (err) {
    next(err)
  }
})

// ── POST /status/confirmar ────────────────────────────────────────────────────

loteRouter.post('/status/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = StatusConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db       = (req as any).prisma
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tenantId = (req as any).tenantId as string
  const { ids, status_novo } = parse.data

  try {
    const resultado = await db.pedido.updateMany({
      where: { id: { in: ids }, tenant_id: tenantId },
      data:  { status: status_novo },
    })

    res.json({ sucesso: resultado.count, erros: [] })
  } catch (err) {
    next(err)
  }
})
