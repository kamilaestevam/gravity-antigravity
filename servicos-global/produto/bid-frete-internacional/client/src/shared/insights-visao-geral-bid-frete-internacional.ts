/**
 * Contratos Zod — Insights cliente (visao-geral).
 */

import { z } from 'zod'
import type { CalendarioAlerta, DashboardKPIs, StatusCotacao } from './types'

const statusCotacaoSchema = z.enum([
  'RASCUNHO',
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REPROVADA',
  'CANCELADA',
  'FALTA_INFORMACAO',
  'EXPIRADA',
])

export const dashboardKpisResponseSchema = z.object({
  cotacoes_andamento: z.number(),
  cotacoes_passadas: z.number(),
  cotacoes_aprovadas: z.number().optional(),
  valor_andamento_usd: z.number(),
  valor_aprovado_usd: z.number(),
  tempo_medio_resposta_dias: z.number().nullable().optional(),
  aprovacao: z.object({
    total: z.number(),
    em_tempo: z.number(),
    fora_prazo: z.number(),
    percentual_em_tempo: z.union([z.string(), z.number()]),
  }),
  savings: z.object({
    total_saving_usd: z.number().optional(),
    total_saving_vs_target: z.number().optional(),
    total_saving_vs_media: z.number().optional(),
    media_saving_percentual: z.number().optional(),
    total_valor_aprovado: z.number().optional(),
    total_cotacoes_aprovadas_classificacao_bid_frete_internacional: z.number().optional(),
  }),
  funil: z.array(
    z.object({
      status: z.string(),
      count: z.number(),
    }),
  ),
  distribuicao_modal_andamento: z
    .array(
      z.object({
        modal_cotacao_bid_frete_internacional: z.string(),
        count: z.number(),
      }),
    )
    .optional(),
  kpi_insights_aguardando_aprovacao: z.number().optional(),
  kpi_insights_aguardando_resposta: z.number().optional(),
  kpi_insights_aguardando_resposta_detalhe: z
    .object({
      enviada_fornecedores: z.number(),
      em_cotacao: z.number(),
    })
    .optional(),
})

export const insightsAlertasResponseSchema = z.object({
  data_referencia: z.string().optional(),
  alertas: z.array(
    z.object({
      tipo: z.string(),
      label: z.string(),
      count: z.number(),
      cor: z.enum(['green', 'yellow', 'orange', 'red']),
    }),
  ),
})

export function mapDashboardKpisFromServer(
  raw: z.infer<typeof dashboardKpisResponseSchema>,
): DashboardKPIs & {
  tempo_medio_resposta_dias: number | null
  cotacoes_aprovadas: number
  distribuicao_modal_andamento: Array<{ modal_cotacao_bid_frete_internacional: string; count: number }>
  total_cotacoes_com_saving: number
  total_saving_vs_media: number
  kpi_insights_aguardando_aprovacao: number
  kpi_insights_aguardando_resposta: number
  kpi_insights_aguardando_resposta_detalhe: { enviada_fornecedores: number; em_cotacao: number }
} {
  const savingUsd =
    raw.savings.total_saving_usd ??
    raw.savings.total_saving_vs_target ??
    0
  const savingPct = raw.savings.media_saving_percentual ?? 0
  const pctEmTempo =
    typeof raw.aprovacao.percentual_em_tempo === 'string'
      ? parseFloat(raw.aprovacao.percentual_em_tempo)
      : raw.aprovacao.percentual_em_tempo

  const funil = raw.funil.map((f) => ({
    status: f.status as StatusCotacao,
    count: f.count,
  }))

  return {
    cotacoes_andamento: raw.cotacoes_andamento,
    cotacoes_passadas: raw.cotacoes_aprovadas ?? raw.cotacoes_passadas,
    cotacoes_aprovadas: raw.cotacoes_aprovadas ?? raw.aprovacao.total,
    valor_andamento_usd: raw.valor_andamento_usd,
    valor_andamento_brl: 0,
    valor_aprovado_usd: raw.valor_aprovado_usd,
    valor_aprovado_brl: 0,
    tempo_medio_resposta_dias: raw.tempo_medio_resposta_dias ?? null,
    aprovacao: {
      percentual_em_tempo: Number.isFinite(pctEmTempo) ? pctEmTempo : 0,
      percentual_atraso: raw.aprovacao.fora_prazo,
      nao_respondidas: 0,
    },
    savings: {
      total_saving_usd: savingUsd,
      media_saving_percentual: savingPct,
    },
    funil,
    fornecedores_cadastrados: 0,
    fornecedores_por_tipo: [],
    moedas: [],
    distribuicao_modal_andamento: raw.distribuicao_modal_andamento ?? [],
    total_cotacoes_com_saving:
      raw.savings.total_cotacoes_aprovadas_classificacao_bid_frete_internacional ?? 0,
    total_saving_vs_media: raw.savings.total_saving_vs_media ?? 0,
    kpi_insights_aguardando_aprovacao: raw.kpi_insights_aguardando_aprovacao ?? 0,
    kpi_insights_aguardando_resposta: raw.kpi_insights_aguardando_resposta ?? 0,
    kpi_insights_aguardando_resposta_detalhe: raw.kpi_insights_aguardando_resposta_detalhe ?? {
      enviada_fornecedores: 0,
      em_cotacao: 0,
    },
  }
}

export function mapInsightsAlertasFromServer(
  raw: z.infer<typeof insightsAlertasResponseSchema>,
): CalendarioAlerta[] {
  return raw.alertas
}

export const insightsGraficosResponseSchema = z.object({
  total_cotacoes: z.number(),
  cotacoes_por_mes: z.array(
    z.object({
      mes: z.string(),
      chave_mes: z.string(),
      aprovadas: z.number(),
      andamento: z.number(),
      recusadas: z.number(),
    }),
  ),
  distribuicao_modal: z.array(
    z.object({
      modal_cotacao_bid_frete_internacional: z.string(),
      count: z.number(),
      pct: z.number(),
      cor: z.string(),
    }),
  ),
  top_incoterms: z.array(
    z.object({
      incoterm_cotacao_bid_frete_internacional: z.string(),
      count: z.number(),
      pct: z.number(),
    }),
  ),
  melhor_cotacao_mes: z
    .object({
      numero_cotacao_bid_frete_internacional: z.string(),
      origem: z.string(),
      destino: z.string(),
      modal_cotacao_bid_frete_internacional: z.string(),
      saving_pct: z.number(),
      ganho_valor_cotacao_bid_frete_internacional: z.number(),
      valor_aprovado_ganho_bid_frete_internacional: z.number(),
      fornecedor: z.string(),
      transit_time: z.number().nullable(),
    })
    .nullable(),
})

export type InsightsGraficosBidFreteInternacionalCliente = z.infer<typeof insightsGraficosResponseSchema>
