/**
 * GET /api/v1/pedidos/visao-geral/agregado
 * Agregação server-side para Insights com escopo multi-workspace amplo.
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { withOrganizacao } from '@gravity/resolver-organizacao'
import { clausulaFiltroWorkspacePedido } from '../shared/workspace-filtro-pedido.js'
import {
  agregarVisaoGeralResumo,
  LIMITE_PEDIDOS_VISAO_GERAL_AGREGADO,
  type PedidoVisaoGeralResumoInput,
} from '../../../shared/visaoGeralResumoAggregate.js'

export const visaoGeralAgregadoRouter = Router()

const respostaAgregadoSchema = z.object({
  total: z.number(),
  kpis: z.object({
    andamento_count: z.number(),
    andamento_valor: z.number(),
    concluido_count: z.number(),
    concluido_valor: z.number(),
    valor_total: z.number(),
    ticket_medio: z.number(),
    taxa_atraso_pct: z.number(),
    atrasados_count: z.number(),
  }),
  aprovacao: z.object({
    percentual_em_tempo: z.number(),
    percentual_atraso: z.number(),
    nao_respondidas: z.number(),
  }),
  mensal: z.array(z.object({
    mes: z.string(),
    aprovadas: z.number(),
    andamento: z.number(),
    recusadas: z.number(),
  })),
  modal: z.array(z.object({
    key: z.string(),
    label: z.string(),
    count: z.number(),
    pct: z.number(),
    cor: z.string(),
  })),
  funil: z.array(z.object({
    label: z.string(),
    count: z.number(),
    color: z.string(),
  })),
  incoterms: z.array(z.object({
    incoterm: z.string(),
    count: z.number(),
    pct: z.number(),
  })),
  alertas: z.array(z.object({
    tipo: z.string(),
    count: z.number(),
    cor: z.string(),
  })),
  moedas: z.array(z.object({
    codigo: z.string(),
    quantidade: z.number(),
    pct: z.number(),
  })),
  sparkAndamento: z.array(z.number()),
  sparkConcluido: z.array(z.number()),
  maiorPedido: z.object({
    numero: z.string(),
    valor: z.number(),
    moeda: z.string(),
  }).nullable(),
})

visaoGeralAgregadoRouter.get('/agregado', async (req: Request, res: Response) => {
  try {
    await withOrganizacao(req, async rawDb => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any
      const filtroWorkspace = clausulaFiltroWorkspacePedido(req)

      const rows = await db.pedido.findMany({
        where: {
          data_exclusao_pedido: null,
          ...filtroWorkspace,
        },
        take: LIMITE_PEDIDOS_VISAO_GERAL_AGREGADO,
        orderBy: { data_emissao_pedido: 'desc' },
        select: {
          status_pedido: true,
          valor_total_pedido: true,
          tipo_operacao_pedido: true,
          incoterm_pedido: true,
          moeda_pedido: true,
          data_emissao_pedido: true,
          data_prevista_pedido_pronto: true,
          data_meta_pedido_pronto: true,
          created_at: true,
          numero_pedido: true,
        },
      })

      const pedidos: PedidoVisaoGeralResumoInput[] = rows.map(
        (row: Record<string, unknown>) => ({
          status: String(row.status_pedido ?? 'rascunho'),
          valor_total_pedido: row.valor_total_pedido,
          tipo_operacao: row.tipo_operacao_pedido as string | null,
          incoterm: row.incoterm_pedido as string | null,
          moeda_pedido: row.moeda_pedido as string | null,
          data_emissao_pedido: String(row.data_emissao_pedido ?? ''),
          data_prevista_pedido_pronto: row.data_prevista_pedido_pronto as string | null,
          data_meta_pedido_pronto: row.data_meta_pedido_pronto as string | null,
          created_at: row.created_at as string | null,
          numero_pedido: row.numero_pedido as string | null,
        }),
      )

      const resumo = agregarVisaoGeralResumo(pedidos)
      const payload = respostaAgregadoSchema.parse(resumo)
      res.json({ data: payload })
    })
  } catch (err) {
    console.error('[visao-geral/agregado] falha:', err)
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Erro ao agregar visão geral',
      code: 'VISAO_GERAL_AGREGADO_ERRO',
    })
  }
})
