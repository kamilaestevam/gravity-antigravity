import type { HistoricoAprovadoMesmasCondicoes } from '@produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'

/** Frete base por mês (6 meses) — curva visível no gráfico; média ~US$ 1.050. */
const FRETE_BASE_HISTORICO_DEMO = [780, 950, 1210, 880, 1340, 1090] as const

/** Histórico aprovado demo — 6 meses com variação de frete base para o termômetro. */
export function criarHistoricoDemoTermometroPainelInsights(): HistoricoAprovadoMesmasCondicoes {
  const agora = new Date()
  return FRETE_BASE_HISTORICO_DEMO.map((freteBase, indice) => {
    const mesesAtras = 5 - indice
    const dataAprovacao = new Date(agora.getFullYear(), agora.getMonth() - mesesAtras, 12)
    return {
      id_cotacao_bid_frete_internacional: `cot-hist-manual-${indice}`,
      numero_cotacao_bid_frete_internacional: `COT-HIST-2026${String(indice + 1).padStart(2, '0')}`,
      data_aprovacao_cotacao_bid_frete_internacional: dataAprovacao.toISOString(),
      propostas: [
        {
          valor_frete_proposta_bid_frete_internacional: freteBase,
          valor_total_proposta_bid_frete_internacional: freteBase + 120 + (indice % 3) * 35,
          moeda_proposta_bid_frete_internacional: 'USD',
        },
      ],
    }
  })
}

export const HISTORICO_DEMO_TERMOMETRO_PAINEL_INSIGHTS = criarHistoricoDemoTermometroPainelInsights()
