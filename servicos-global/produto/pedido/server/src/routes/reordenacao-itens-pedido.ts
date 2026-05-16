/**
 * reordenacao-itens-pedido.ts — Rota de reordenação de itens de pedido
 *
 * Rota base: /api/v1/pedidos/:id_pedido/itens
 *
 * Endpoints:
 *   PATCH /reordenar — atualiza sequencia_item_pedido em batch ($transaction)
 *
 * Regras:
 *   - Zod valida entrada
 *   - tenant_id injetado pelo withOrganizacao
 *   - Valida que TODOS os IDs pertencem ao pedido + organização
 *   - Erros via AppError
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { withOrganizacao, type ContextoOrganizacao } from '@gravity/resolver-organizacao'
import { exigirPermissao } from '../permissoes.js'

export const reordenacaoItensPedidoRouter = Router({ mergeParams: true })

reordenacaoItensPedidoRouter.use(exigirPermissao('lista', 'editar'))

// ── Schema Zod ────────────────────────────────────────────────────────────────

const ReordenarItensSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
})

// ── PATCH /reordenar ──────────────────────────────────────────────────────────

reordenacaoItensPedidoRouter.patch('/reordenar', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parse = ReordenarItensSchema.safeParse(req.body)
    if (!parse.success) {
      res.status(400).json({ erro: 'Payload inválido', detalhes: parse.error.flatten() })
      return
    }

    const idPedido = req.params.id_pedido
    if (!idPedido) {
      res.status(400).json({ erro: 'id_pedido ausente nos parâmetros da rota' })
      return
    }

    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const { idOrganizacao } = (req as unknown as { organizacao: ContextoOrganizacao }).organizacao
      const idWorkspace = (req.headers['x-id-workspace'] as string | undefined) ?? idOrganizacao

      // 1. Validar que o pedido existe e pertence à organização
      const pedido = await db.pedido.findFirst({
        where: { id_pedido: idPedido, id_organizacao: idOrganizacao, id_workspace: idWorkspace },
        select: { id_pedido: true },
      })
      if (!pedido) {
        res.status(404).json({ erro: 'Pedido não encontrado' })
        return
      }

      // 2. Buscar TODOS os itens do pedido para validação cruzada
      const itensExistentes = await db.pedidoItem.findMany({
        where: { id_pedido: idPedido, id_organizacao: idOrganizacao },
        select: { id_item: true },
      })

      const idsExistentes = new Set(itensExistentes.map((i: { id_item: string }) => i.id_item))
      const idsRecebidos = parse.data.ids

      // 3. Verificar que todos os IDs recebidos pertencem ao pedido
      const idsInvalidos = idsRecebidos.filter(id => !idsExistentes.has(id))
      if (idsInvalidos.length > 0) {
        res.status(400).json({ erro: 'IDs de itens não pertencem a este pedido', ids_invalidos: idsInvalidos })
        return
      }

      // 4. Renumerar em $transaction — 1..N na ordem recebida
      await db.$transaction(async (tx: typeof db) => {
        for (let i = 0; i < idsRecebidos.length; i++) {
          await tx.pedidoItem.update({
            where: { id_item: idsRecebidos[i] },
            data: { sequencia_item_pedido: i + 1 },
          })
        }

        // 5. Touch no pedido pai para disparar @updatedAt → frontend detecta
        // via itemVersion e recarrega filhos expandidos automaticamente
        await tx.pedido.update({
          where: { id_pedido: idPedido },
          data: { data_atualizacao_pedido: new Date() },
        })
      })

      res.json({ ok: true, total_reordenados: idsRecebidos.length })
    })
  } catch (err) {
    console.error('[reordenacao-itens] ERRO:', err)
    next(err)
  }
})
