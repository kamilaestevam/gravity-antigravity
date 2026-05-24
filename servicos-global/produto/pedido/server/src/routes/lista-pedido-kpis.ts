/**
 * lista-pedido-kpis.ts — KPIs agregados para cards da Lista (sem paginação)
 *
 * GET /api/v1/pedidos/lista/kpis
 * Query: period, status, busca, ids_workspaces (CSV)
 */

import { Router, Request, Response } from 'express'
import { withOrganizacao } from '@gravity/resolver-organizacao'
import {
  aggregateListaCardKpis,
  cardPeriodToDateRange,
} from '../shared/lista-card-aggregate.js'

export const listaPedidoKpisRouter = Router()

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL ?? 'http://localhost:8005'

async function buscarTaxasVenda(): Promise<Record<string, number>> {
  try {
    const r = await fetch(`${CONFIGURADOR_URL}/api/v1/taxa-cambio`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!r.ok) return { BRL: 1 }
    const json = await r.json() as { por_moeda?: Record<string, Array<{ venda: string | number }>> }
    const taxas: Record<string, number> = { BRL: 1 }
    for (const [moeda, boletins] of Object.entries(json.por_moeda ?? {})) {
      if (!boletins.length) continue
      const ultimo = boletins[boletins.length - 1]
      if (ultimo?.venda) taxas[moeda] = Number(ultimo.venda)
    }
    return taxas
  } catch {
    return { BRL: 1 }
  }
}

listaPedidoKpisRouter.get('/kpis', async (req: Request, res: Response) => {
  const period = (req.query.period as string) ?? '30d'
  const status = req.query.status as string | undefined
  const busca  = (req.query.busca as string | undefined)?.trim()
  const idsWorkspacesRaw = req.query.ids_workspaces as string | undefined
  const idsWorkspaces = idsWorkspacesRaw
    ? idsWorkspacesRaw.split(',').map(s => s.trim()).filter(Boolean)
    : undefined

  const idWorkspaceHeader = req.headers['x-id-workspace'] as string | undefined
  const { from, to } = cardPeriodToDateRange(period)
  const hoje = new Date().toISOString().slice(0, 10)

  try {
    await withOrganizacao(req, async (rawDb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = rawDb as any

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const where: Record<string, any> = {
        data_exclusao_pedido: null,
      }

      if (from) {
        where.data_emissao_pedido = { gte: from, lte: to }
      }

      if (status && status !== 'todos') {
        where.status_pedido = status
      }

      if (idsWorkspaces?.length) {
        where.id_workspace = { in: idsWorkspaces }
      } else if (idWorkspaceHeader) {
        where.id_workspace = idWorkspaceHeader
      }

      if (busca) {
        where.OR = [
          { numero_pedido: { contains: busca, mode: 'insensitive' } },
          { referencia_importador_pedido: { contains: busca, mode: 'insensitive' } },
          { referencia_exportador_pedido: { contains: busca, mode: 'insensitive' } },
          { numero_proforma_pedido: { contains: busca, mode: 'insensitive' } },
          { numero_invoice_pedido: { contains: busca, mode: 'insensitive' } },
        ]
      }

      const pedidoSelect = {
        id_pedido: true,
        status_pedido: true,
        valor_total_pedido: true,
        quantidade_total_pedido: true,
        moeda_pedido: true,
        quantidade_pronta_itens_pedido_total: true,
        quantidade_cancelada_total_pedido: true,
        data_prevista_pedido_pronto: true,
        data_confirmada_pedido_pronto: true,
        data_prevista_inspecao_pedido: true,
        data_confirmada_inspecao_pedido: true,
        data_prevista_coleta_pedido: true,
        data_confirmada_coleta_pedido: true,
        data_previsao_recebimento_rascunho_pedido: true,
        data_confirmacao_recebimento_rascunho_pedido: true,
        data_previsao_aprovacao_rascunho_pedido: true,
        data_confirmacao_aprovacao_rascunho_pedido: true,
        data_previsao_recebimento_rascunho_proforma_pedido: true,
        data_confirmacao_recebimento_rascunho_proforma_pedido: true,
        data_previsao_aprovacao_rascunho_proforma_pedido: true,
        data_confirmacao_aprovacao_rascunho_proforma_pedido: true,
        data_previsao_envio_original_proforma_pedido: true,
        data_confirmacao_envio_original_proforma_pedido: true,
        data_previsao_recebimento_original_proforma_pedido: true,
        data_confirmacao_recebimento_original_proforma_pedido: true,
        data_previsao_recebimento_rascunho_invoice_pedido: true,
        data_confirmacao_recebimento_rascunho_invoice_pedido: true,
        data_previsao_aprovacao_rascunho_invoice_pedido: true,
        data_confirmacao_aprovacao_rascunho_invoice_pedido: true,
        data_previsao_envio_original_invoice_pedido: true,
        data_confirmacao_envio_original_invoice_pedido: true,
        data_previsao_recebimento_original_invoice_pedido: true,
        data_confirmacao_recebimento_original_invoice_pedido: true,
      }

      const [pedidosRaw, itensRaw, taxasVenda] = await Promise.all([
        db.pedido.findMany({ where, select: pedidoSelect }),
        db.pedidoItem.findMany({
          where: { pedido_item: where },
          select: {
            id_pedido: true,
            quantidade_inicial_item: true,
            quantidade_atual_item: true,
            quantidade_pronta_item: true,
            quantidade_transferida_item: true,
            quantidade_cancelada_item: true,
            valor_total_item: true,
            cobertura_cambial_item: true,
          },
        }),
        buscarTaxasVenda(),
      ])

      const payload = aggregateListaCardKpis(
        pedidosRaw,
        itensRaw,
        taxasVenda,
        period,
        hoje,
      )

      res.json(payload)
    })
  } catch (err) {
    console.error('[ListaKpis]', err)
    res.status(500).json({ error: 'Erro ao agregar KPIs da lista' })
  }
})
