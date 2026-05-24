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
import {
  aggregateAlertasKpis,
  REGRAS_ALERTAS_DEFAULT,
  type RegrasAlertasConfig,
} from '../../../shared/pedidoAlertasAggregate.js'
import { mapItem } from '../../../../processos-core/src/routes/pedidos.js'

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

function extrairRegrasAlertas(config: Record<string, unknown> | null): RegrasAlertasConfig {
  if (!config) return REGRAS_ALERTAS_DEFAULT
  return {
    alerta_numero_duplicado: config.alerta_numero_duplicado !== false,
    alerta_valor_total_divergente: config.alerta_valor_total_divergente !== false,
    alerta_quantidade_total_divergente: config.alerta_quantidade_total_divergente !== false,
    alerta_quantidade_pronta_divergente: config.alerta_quantidade_pronta_divergente !== false,
    alerta_peso_liquido_divergente: config.alerta_peso_liquido_divergente !== false,
    alerta_peso_bruto_divergente: config.alerta_peso_bruto_divergente !== false,
    alerta_cubagem_divergente: config.alerta_cubagem_divergente !== false,
  }
}

function normalizarPedidoParaAlertas(
  p: Record<string, unknown>,
  itensMapped: Record<string, unknown>[],
): Record<string, unknown> {
  const prontaSoma = itensMapped.reduce(
    (s, i) => s + (Number(i.quantidade_pronta_pedido) || 0),
    0,
  )
  return {
    id_pedido: p.id_pedido,
    id: p.id_pedido,
    numero_pedido: p.numero_pedido,
    valor_total_pedido: p.valor_total_pedido,
    quantidade_total_pedido: p.quantidade_total_pedido,
    quantidade_pronta_itens_pedido_total: p.quantidade_pronta_itens_pedido_total ?? prontaSoma,
    unidade_comercializada_pedido: p.unidade_comercializada_pedido,
    data_emissao_pedido: p.data_emissao_pedido,
    peso_liquido_total_pedido: p.peso_liquido_total_pedido,
    peso_bruto_total_pedido: p.peso_bruto_total_pedido,
    cubagem_total_pedido: p.cubagem_total_pedido,
    _colunas_usuario: (p._colunas_usuario as Record<string, string> | undefined) ?? {},
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
      const tenant_id = (req as unknown as { organizacao: { idOrganizacao: string } }).organizacao.idOrganizacao

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
        numero_pedido: true,
        status_pedido: true,
        valor_total_pedido: true,
        quantidade_total_pedido: true,
        moeda_pedido: true,
        quantidade_pronta_itens_pedido_total: true,
        quantidade_cancelada_total_pedido: true,
        unidade_comercializada_pedido: true,
        data_emissao_pedido: true,
        peso_liquido_total_pedido: true,
        peso_bruto_total_pedido: true,
        cubagem_total_pedido: true,
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

      const pedidoIdsPromise = db.pedido.findMany({ where, select: { id_pedido: true } })

      const [pedidosRaw, pedidoIdsRows, taxasVenda, configRaw] = await Promise.all([
        db.pedido.findMany({ where, select: pedidoSelect }),
        pedidoIdsPromise,
        buscarTaxasVenda(),
        db.configuracaoPedido?.findFirst({ where: { tenant_id } }) ?? null,
      ])

      const pedidoIds = pedidoIdsRows.map((p: { id_pedido: string }) => p.id_pedido)
      const itensRaw = pedidoIds.length > 0
        ? await db.pedidoItem.findMany({ where: { id_pedido: { in: pedidoIds } } })
        : []

      const regras = extrairRegrasAlertas(configRaw as Record<string, unknown> | null)

      const itensPorPedidoAgg = new Map<string, Record<string, unknown>[]>()
      const itensPorPedidoAlertas = new Map<string, Record<string, unknown>[]>()
      for (const raw of itensRaw) {
        const pid = String(raw.id_pedido ?? '')
        if (!pid) continue
        const mapped = mapItem(raw) as Record<string, unknown>
        const arrAgg = itensPorPedidoAgg.get(pid) ?? []
        arrAgg.push(raw)
        itensPorPedidoAgg.set(pid, arrAgg)
        const arrAlert = itensPorPedidoAlertas.get(pid) ?? []
        arrAlert.push(mapped)
        itensPorPedidoAlertas.set(pid, arrAlert)
      }

      const pedidosParaAlertas = pedidosRaw.map((p: Record<string, unknown>) => {
        const pid = String(p.id_pedido ?? '')
        const itensP = itensPorPedidoAlertas.get(pid) ?? []
        return normalizarPedidoParaAlertas(p, itensP)
      })

      const kpisBase = aggregateListaCardKpis(
        pedidosRaw,
        itensRaw,
        taxasVenda,
        period,
        hoje,
      )

      const alertas = aggregateAlertasKpis(pedidosParaAlertas, itensPorPedidoAlertas, regras)

      res.json({ ...kpisBase, ...alertas })
    })
  } catch (err) {
    console.error('[ListaKpis]', err)
    res.status(500).json({ error: 'Erro ao agregar KPIs da lista' })
  }
})
