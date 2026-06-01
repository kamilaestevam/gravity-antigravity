/**
 * API do dashboard configurável — visão fornecedor (mapeia GET /visao-fornecedor/.../dashboard)
 */

import type { DashboardKpis, DashboardTrendBucket, GabiInsightItem } from './api'
import { getVisaoFornecedorBidFreteInternacionalDashboard } from './api'
import type { DashboardVisaoFornecedorBidFreteInternacional } from './api'
import {
  MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP,
  USAR_MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP,
} from './mock-dashboard-visao-fornecedor-APAGAR-ANTES-COMMIT'
import { buildClientInsightsFornecedor } from './dashboard-fornecedor-insights'

function rotuloFunilParaStatus(rotulo: string): string {
  const map: Record<string, string> = {
    aguardando_resposta: 'AGUARDANDO_RESPOSTA',
    em_analise: 'EM_ANALISE',
    aprovada: 'APROVADA',
    aprovadas: 'APROVADA',
    reprovada: 'REPROVADA',
    reprovadas: 'REPROVADA',
  }
  return map[rotulo] ?? rotulo.toUpperCase()
}

export function mapDashboardFornecedorParaKpis(
  dash: DashboardVisaoFornecedorBidFreteInternacional,
  period: string,
): DashboardKpis {
  const m = dash.metricas
  const cotacoes_status: Record<string, number> = {}
  for (const etapa of dash.funil) {
    const key = rotuloFunilParaStatus(etapa.rotulo)
    cotacoes_status[key] = etapa.quantidade
  }

  const pendentes = m.cotacoes_pendentes_visao_fornecedor_bid_frete_internacional
  const emAnalise = m.propostas_em_analise_visao_fornecedor_bid_frete_internacional
  const aprovadas = m.propostas_aprovadas_visao_fornecedor_bid_frete_internacional
  const reprovadas = m.propostas_reprovadas_visao_fornecedor_bid_frete_internacional
  const enviadas = m.propostas_enviadas_visao_fornecedor_bid_frete_internacional

  return {
    period,
    cotacoes_pendentes_visao_fornecedor: pendentes,
    propostas_enviadas_visao_fornecedor: enviadas,
    propostas_aprovadas_visao_fornecedor: aprovadas,
    propostas_em_analise_visao_fornecedor: emAnalise,
    propostas_reprovadas_visao_fornecedor: reprovadas,
    disparos_recebidos_visao_fornecedor: m.disparos_recebidos_visao_fornecedor_bid_frete_internacional,
    taxa_resposta_visao_fornecedor: Number(m.taxa_resposta_visao_fornecedor_bid_frete_internacional) || 0,
    taxa_aprovacao_visao_fornecedor: Number(m.taxa_aprovacao_visao_fornecedor_bid_frete_internacional) || 0,
    cotacoes_andamento: pendentes + emAnalise,
    cotacoes_passadas: aprovadas + reprovadas,
    cotacoes_status,
    volume_mensal: enviadas,
    saving_total: 0,
    valor_medio_ganho_bid_frete_internacional: 0,
    ganho_percentual_ganho_bid_frete_internacional: 0,
    transit_time: 0,
    valor_andamento_usd: 0,
    valor_aprovado_usd: 0,
  }
}

function buildTrendBucketsFornecedor(dash: DashboardVisaoFornecedorBidFreteInternacional): DashboardTrendBucket[] {
  const now = new Date()
  const enviadas = dash.metricas.propostas_enviadas_visao_fornecedor_bid_frete_internacional
  const buckets: DashboardTrendBucket[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const fator = i === 0 ? 1 : 0.55 + (11 - i) * 0.04
    const base = Math.max(0, Math.round((enviadas / 12) * fator))
    buckets.push({
      month,
      volume_mensal: base,
      saving_total: 0,
      valor_medio_ganho_bid_frete_internacional: 0,
      ganho_percentual_ganho_bid_frete_internacional: 0,
      transit_time: 0,
      cotacoes_andamento: 0,
      cotacoes_passadas: 0,
      valor_andamento_usd: 0,
      valor_aprovado_usd: 0,
      propostas_enviadas_visao_fornecedor: base,
    })
  }
  return buckets
}

async function carregarDashboardFornecedor(): Promise<DashboardVisaoFornecedorBidFreteInternacional> {
  if (USAR_MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP) {
    return MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP
  }
  return getVisaoFornecedorBidFreteInternacionalDashboard()
}

export const dashboardFornecedorApi = {
  kpis: async (period: string): Promise<DashboardKpis> => {
    const dash = await carregarDashboardFornecedor()
    return mapDashboardFornecedorParaKpis(dash, period)
  },

  trend: async (_period: string, _granularity = 'month'): Promise<{
    period: string
    granularity: string
    value: DashboardTrendBucket[]
  }> => {
    const dash = await carregarDashboardFornecedor()
    return {
      period: '12m',
      granularity: 'month',
      value: buildTrendBucketsFornecedor(dash),
    }
  },

  insights: async (period: string): Promise<{ period: string; role: string; insights: GabiInsightItem[] }> => {
    const dash = await carregarDashboardFornecedor()
    const kpis = mapDashboardFornecedorParaKpis(dash, period)
    return {
      period,
      role: 'fornecedor',
      insights: buildClientInsightsFornecedor(kpis),
    }
  },
}

/** Painéis persistidos apenas no cliente (sem endpoint dedicado na visão fornecedor). */
export const paineisDashboardFornecedorApi = {
  listar: (): Promise<{ data: never[] }> => Promise.resolve({ data: [] }),

  criar: (nome: string): Promise<{ data: { id: string; nome: string; ordem: number; is_visivel: boolean; widgets_json: string | null } }> =>
    Promise.resolve({
      data: {
        id: `forn-painel-${Date.now()}`,
        nome,
        ordem: 0,
        is_visivel: true,
        widgets_json: null,
      },
    }),

  atualizar: (
    id: string,
    patch: Partial<{ nome: string; is_visivel: boolean; widgets_json: string | null }>,
  ): Promise<{ data: { id: string; nome: string; ordem: number; is_visivel: boolean; widgets_json: string | null } }> =>
    Promise.resolve({
      data: {
        id,
        nome: patch.nome ?? 'Painel',
        ordem: 0,
        is_visivel: patch.is_visivel ?? true,
        widgets_json: patch.widgets_json ?? null,
      },
    }),

  reordenar: (): Promise<{ data: { reordenado: boolean } }> =>
    Promise.resolve({ data: { reordenado: true } }),

  deletar: (): Promise<{ data: { deletado: boolean } }> =>
    Promise.resolve({ data: { deletado: true } }),
}
