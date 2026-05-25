/**
 * Carregamento otimizado de dados crus para agregação do Dashboard.
 * Centraliza where + selects + taxas PTAX (1 fetch por bundle).
 */

import type { Request } from 'express'
import { clausulaFiltroWorkspacePedido, parseIdsWorkspacesQuery } from './workspace-filtro-pedido.js'
import { clausulaDataEmissaoPedido, resolverPeriodoPedido } from './pedido-periodo-filtro.js'
import type { DashboardTrendBucket } from './dashboard-cache-pedido.js'

const CONFIGURADOR_URL = process.env.CONFIGURADOR_URL ?? 'http://localhost:8005'

let taxasMemCache: { data: Record<string, number>; expiresAt: number } | null = null
const TAXAS_TTL_MS = 60_000

export async function buscarTaxasVendaCached(): Promise<Record<string, number>> {
  if (taxasMemCache && Date.now() < taxasMemCache.expiresAt) {
    return taxasMemCache.data
  }
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
    taxasMemCache = { data: taxas, expiresAt: Date.now() + TAXAS_TTL_MS }
    return taxas
  } catch {
    return { BRL: 1 }
  }
}

export function resolverFiltrosDashboard(
  req: Request,
  period: string,
  fromParam?: string,
  toParam?: string,
): {
  from: Date | null
  to: Date
  wherePedido: Record<string, unknown>
  whereItemPedido: Record<string, unknown>
} {
  const { from, to } = (fromParam && toParam)
    ? resolverPeriodoPedido(period, fromParam, toParam)
    : resolverPeriodoPedido(period)

  const filtroWorkspace = clausulaFiltroWorkspacePedido(req)
  const filtroData = clausulaDataEmissaoPedido(from, to)

  return {
    from,
    to,
    wherePedido: {
      data_exclusao_pedido: null,
      ...filtroWorkspace,
      ...filtroData,
    },
    whereItemPedido: {
      data_exclusao_pedido: null,
      ...filtroWorkspace,
      ...filtroData,
    },
  }
}

const PEDIDO_AGG_SELECT = {
  id_pedido: true,
  status_pedido: true,
  valor_total_pedido: true,
  quantidade_total_pedido: true,
  moeda_pedido: true,
  id_importacao_exportador_pedido: true,
  tipo_operacao_pedido: true,
  incoterm_pedido: true,
  id_fabricante_pedido: true,
  numero_proforma_pedido: true,
  numero_invoice_pedido: true,
  referencia_importador_pedido: true,
  referencia_exportador_pedido: true,
  peso_bruto_total_pedido: true,
  cubagem_total_pedido: true,
  data_emissao_pedido: true,
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
} as const

const ITEM_AGG_SELECT = {
  id_pedido: true,
  quantidade_inicial_item: true,
  quantidade_atual_item: true,
  quantidade_transferida_item: true,
  quantidade_pronta_item: true,
  valor_total_item: true,
  cobertura_cambial_item: true,
  quantidade_cancelada_item: true,
  peso_bruto_unitario_item: true,
  cubagem_unitaria_item: true,
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DbLike = any

export async function carregarDadosAgregacaoDashboard(
  db: DbLike,
  wherePedido: Record<string, unknown>,
  whereItemPedido: Record<string, unknown>,
): Promise<{
  pedidos: Record<string, unknown>[]
  itens: Record<string, unknown>[]
  taxasVenda: Record<string, number>
}> {
  const [pedidos, itens, taxasVenda] = await Promise.all([
    db.pedido.findMany({ where: wherePedido, select: PEDIDO_AGG_SELECT }),
    db.pedidoItem.findMany({
      where: { pedido_item: whereItemPedido },
      select: ITEM_AGG_SELECT,
    }),
    buscarTaxasVendaCached(),
  ])
  return { pedidos, itens, taxasVenda }
}

/** Série mensal — select mínimo (só emissão + valor). */
export async function carregarPedidosTendencia(
  db: DbLike,
  req: Request,
  trendPeriod: string,
): Promise<Array<{ data_emissao_pedido: Date | string | null; valor_total_pedido: unknown }>> {
  const { wherePedido } = resolverFiltrosDashboard(req, trendPeriod)
  return db.pedido.findMany({
    where: wherePedido,
    select: { data_emissao_pedido: true, valor_total_pedido: true },
    orderBy: { data_emissao_pedido: 'asc' },
  })
}

export function montarBucketsTendencia(
  pedidos: Array<{ data_emissao_pedido: Date | string | null; valor_total_pedido: unknown }>,
  period: string,
  granularity: string,
): DashboardTrendBucket[] {
  const buckets: Record<string, DashboardTrendBucket> = {}

  for (const p of pedidos) {
    if (!p.data_emissao_pedido) continue
    const d = new Date(p.data_emissao_pedido)
    if (Number.isNaN(d.getTime())) continue

    let key: string
    let label: string
    if (granularity === 'month') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      label = d.toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
    } else if (granularity === 'week') {
      const startOfWeek = new Date(d)
      startOfWeek.setDate(d.getDate() - d.getDay())
      key = startOfWeek.toISOString().slice(0, 10)
      label = `Sem ${key}`
    } else {
      key = d.toISOString().slice(0, 10)
      label = key
    }

    if (!buckets[key]) {
      buckets[key] = { month: key, label, total_pedidos: 0, valor_total: 0, cobertura_pendente: 0, valor_itens_total: 0 }
    }
    buckets[key].total_pedidos++
    buckets[key].valor_total += Number(p.valor_total_pedido ?? 0)
  }

  return Object.values(buckets)
}

export function escopoHashFromRequest(req: Request): string {
  const ids = parseIdsWorkspacesQuery(req)
  if (ids?.length) return ids.sort().join(',')
  const header = req.headers['x-id-workspace'] as string | undefined
  return header?.trim() ? `h:${header.trim()}` : 'org'
}
