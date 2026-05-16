/**
 * reordenacao-itens-pedido.ts — Rota de reordenação de itens de pedido
 *
 * Rota base: /api/v1/pedidos/:id_pedido/itens
 *
 * Endpoints:
 *   PATCH /reordenar — atualiza sequencia_item_pedido em batch
 *
 * Regras:
 *   - Zod valida entrada
 *   - tenant_id injetado pelo withOrganizacao
 *   - Valida que TODOS os IDs pertencem ao pedido + organização
 *   - res.json FORA do withOrganizacao (padrão exclusoes-pedido)
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

    // res.json FORA do withOrganizacao — garante que a resposta só é enviada
    // APÓS o commit da transaction (padrão exclusoes-pedido.ts).
    const resultado = await withOrganizacao(req, async (rawDb) => {
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
        return { erro: 'Pedido não encontrado', status: 404 } as const
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
        return { erro: 'IDs de itens não pertencem a este pedido', ids_invalidos: idsInvalidos, status: 400 } as const
      }

      // 4. Renumerar 1..N na ordem recebida
      // withOrganizacao já fornece contexto transacional — NÃO chamar db.$transaction()
      for (let i = 0; i < idsRecebidos.length; i++) {
        await db.pedidoItem.update({
          where: { id_item: idsRecebidos[i] },
          data: { sequencia_item_pedido: i + 1 },
        })
      }

      // 5. Touch no pedido pai para disparar @updatedAt
      await db.pedido.update({
        where: { id_pedido: idPedido },
        data: { data_atualizacao_pedido: new Date() },
      })

      return { ok: true, total_reordenados: idsRecebidos.length }
    })

    // Responder APÓS o commit da transaction
    if ('erro' in resultado) {
      const status = 'status' in resultado ? (resultado as { status: number }).status : 400
      res.status(status).json(resultado)
    } else {
      res.json(resultado)
    }
  } catch (err) {
    next(err)
  }
})
