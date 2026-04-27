/**
 * lote.ts — Operações em lote sobre pedidos (alteração de status)
 *
 * Rota base: /api/v1/pedidos/alteracoes-status-lote
 *
 * Endpoints:
 *   POST /preview   — simula mudança de status, retorna afetados/bloqueados
 *   POST /confirmar — aplica mudança de status em lote
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'

export const loteRouter = Router()

const STATUS_VALIDOS = ['rascunho', 'aberto', 'em_andamento', 'aprovado', 'transferencia', 'consolidado', 'cancelado'] as const
type PedidoStatus = typeof STATUS_VALIDOS[number]

const StatusPreviewSchema = z.object({
  ids:        z.array(z.string().min(1)).min(1, 'Selecione ao menos 1 pedido'),
  status_novo: z.enum(STATUS_VALIDOS),
})

const StatusConfirmarSchema = z.object({
  ids:        z.array(z.string().min(1)).min(1),
  status_novo: z.enum(STATUS_VALIDOS),
})

// ── POST /preview ─────────────────────────────────────────────────────────────

loteRouter.post('/preview', async (req: Request, res: Response, next: NextFunction) => {
  const parse = StatusPreviewSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const { ids, status_novo } = parse.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

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
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /confirmar ───────────────────────────────────────────────────────────

loteRouter.post('/confirmar', async (req: Request, res: Response, next: NextFunction) => {
  const parse = StatusConfirmarSchema.safeParse(req.body)
  if (!parse.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: parse.error.flatten() },
    })
  }

  const { ids, status_novo } = parse.data

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db       = rawDb as any
      const tenantId = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao.idOrganizacao

      const resultado = await db.pedido.updateMany({
        where: { id: { in: ids }, tenant_id: tenantId },
        data:  { status: status_novo },
      })

      res.json({ sucesso: resultado.count, erros: [] })
    })
  } catch (err) {
    next(err)
  }
})
