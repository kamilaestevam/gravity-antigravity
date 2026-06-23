/**
 * Contrato + API — drill-down Insights (alertas/rotas).
 */

import { z } from 'zod'

const propostaDetalheSchema = z.object({
  fornecedor: z.string(),
  valor: z.string(),
  transit: z.string(),
  status: z.string(),
  cor: z.string(),
})

const historicoDetalheSchema = z.object({
  data: z.string(),
  texto: z.string(),
  autor: z.string(),
})

export const cotacaoInsightsDetalheSchema = z.object({
  id_cotacao_bid_frete_internacional: z.string(),
  numero_cotacao_bid_frete_internacional: z.string(),
  status_cotacao_bid_frete_internacional: z.string(),
  origem_nome_cotacao_bid_frete_internacional: z.string(),
  origem_codigo_cotacao_bid_frete_internacional: z.string(),
  destino_nome_cotacao_bid_frete_internacional: z.string(),
  destino_codigo_cotacao_bid_frete_internacional: z.string(),
  descricao_mercadoria_cotacao_bid_frete_internacional: z.string(),
  ncm_cotacao_bid_frete_internacional: z.string().nullable(),
  quantidade_volume_cotacao_bid_frete_internacional: z.number(),
  peso_kg_cotacao_bid_frete_internacional: z.number().nullable(),
  cubagem_m3_cotacao_bid_frete_internacional: z.number().nullable(),
  incoterm_cotacao_bid_frete_internacional: z.string(),
  modal_cotacao_bid_frete_internacional: z.string(),
  modalidade_cotacao_bid_frete_internacional: z.string(),
  valor_meta_cotacao_bid_frete_internacional: z.number().nullable(),
  moeda_meta_cotacao_bid_frete_internacional: z.string().nullable(),
  data_criacao_cotacao_bid_frete_internacional: z.string(),
  data_limite_resposta_cotacao_bid_frete_internacional: z.string().nullable(),
  data_aprovacao_cotacao_bid_frete_internacional: z.string().nullable(),
  data_envio_disparo_cotacao_bid_frete_internacional: z.string().nullable(),
  data_primeira_resposta_cotacao_bid_frete_internacional: z.string().nullable(),
  propostas: z.array(propostaDetalheSchema),
  historico: z.array(historicoDetalheSchema),
})

export const insightsDetalheResponseSchema = z.object({
  contexto: z.string(),
  total: z.number(),
  cotacoes: z.array(cotacaoInsightsDetalheSchema),
})

export type CotacaoInsightsDetalheCliente = z.infer<typeof cotacaoInsightsDetalheSchema>

export type ContextoDialogoInsights =
  | { tipo: 'vence_hoje' | 'resposta' | 'aprovacao' | 'nova'; label: string; cor: string }
  | {
      tipo: 'rota'
      label: string
      codigo_origem?: string
      codigo_destino?: string
      modal_cotacao_bid_frete_internacional?: string
      fromPort?: string
      toPort?: string
      mode?: string
    }

export function extrairCodigoPortoInsights(porto: string): string | undefined {
  const match = porto.match(/\(([A-Z0-9]{3,6})\)\s*$/)
  return match?.[1]
}
