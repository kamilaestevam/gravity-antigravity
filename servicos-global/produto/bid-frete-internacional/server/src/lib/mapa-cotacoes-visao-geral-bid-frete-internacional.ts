/**
 * Mapa da visão operacional (Insights cliente) — reutiliza agregação de pinos/rotas.
 */

import { montarMapaCotacoesVisaoFornecedorBidFreteInternacional } from './mapa-cotacoes-visao-fornecedor-bid-frete-internacional.js'

export const STATUS_MAPA_VISAO_GERAL = [
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'FALTA_INFORMACAO',
  'APROVADA',
  'REPROVADA',
  'EXPIRADA',
] as const

type CotacaoParaMapa = {
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  origem_pais_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  destino_pais_cotacao_bid_frete_internacional: string
  modal_cotacao_bid_frete_internacional: string
  tipo_operacao_cotacao_bid_frete_internacional: string
  propostas: Array<{
    valor_total_proposta_bid_frete_internacional: number | null
    dias_transito_proposta_bid_frete_internacional: number | null
  }>
}

export async function montarMapaCotacoesVisaoGeralBidFreteInternacional(
  cotacoes: CotacaoParaMapa[],
  opcoes?: { id_organizacao?: string },
) {
  const disparos = cotacoes.map((cotacao) => {
    const melhorProposta = [...cotacao.propostas]
      .filter((p) => p.valor_total_proposta_bid_frete_internacional != null)
      .sort(
        (a, b) =>
          (a.valor_total_proposta_bid_frete_internacional ?? Infinity) -
          (b.valor_total_proposta_bid_frete_internacional ?? Infinity),
      )[0]

    return {
      cotacao: {
        origem_codigo_cotacao_bid_frete_internacional: cotacao.origem_codigo_cotacao_bid_frete_internacional,
        origem_nome_cotacao_bid_frete_internacional: cotacao.origem_nome_cotacao_bid_frete_internacional,
        origem_pais_cotacao_bid_frete_internacional: cotacao.origem_pais_cotacao_bid_frete_internacional,
        destino_codigo_cotacao_bid_frete_internacional: cotacao.destino_codigo_cotacao_bid_frete_internacional,
        destino_nome_cotacao_bid_frete_internacional: cotacao.destino_nome_cotacao_bid_frete_internacional,
        destino_pais_cotacao_bid_frete_internacional: cotacao.destino_pais_cotacao_bid_frete_internacional,
        modal_cotacao_bid_frete_internacional: cotacao.modal_cotacao_bid_frete_internacional,
        tipo_operacao_cotacao_bid_frete_internacional:
          cotacao.tipo_operacao_cotacao_bid_frete_internacional,
      },
      proposta: melhorProposta
        ? {
            valor_total_proposta_bid_frete_internacional:
              melhorProposta.valor_total_proposta_bid_frete_internacional,
            dias_transito_proposta_bid_frete_internacional:
              melhorProposta.dias_transito_proposta_bid_frete_internacional,
          }
        : null,
    }
  })

  return montarMapaCotacoesVisaoFornecedorBidFreteInternacional(disparos, opcoes)
}
