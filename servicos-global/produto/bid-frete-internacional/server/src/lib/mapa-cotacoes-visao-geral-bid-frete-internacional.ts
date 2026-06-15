/**
 * Mapa da visão operacional (Insights cliente) — reutiliza agregação de pinos/rotas.
 */

import { montarMapaCotacoesVisaoFornecedorBidFreteInternacional } from './mapa-cotacoes-visao-fornecedor-bid-frete-internacional.js'

export const STATUS_MAPA_VISAO_GERAL = [
  'RASCUNHO',
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

function normalizarModal(modal: string): 'MARITIMO' | 'AEREO' | 'RODOVIARIO' {
  if (modal === 'AEREO' || modal === 'RODOVIARIO') return modal
  return 'MARITIMO'
}

function normalizarTipoOperacao(tipo: string | undefined): 'IMPORTACAO' | 'EXPORTACAO' | null {
  if (tipo === 'IMPORTACAO' || tipo === 'EXPORTACAO') return tipo
  return null
}

function chaveRotaMapa(
  origem: string,
  destino: string,
  modal: string,
  tipoOperacao: string | undefined,
): string {
  const tipo = normalizarTipoOperacao(tipoOperacao) ?? 'NA'
  return `${origem}|${destino}|${normalizarModal(modal)}|${tipo}`
}

function mediaInteira(valores: number[]): number | null {
  if (valores.length === 0) return null
  return Math.round(valores.reduce((acc, v) => acc + v, 0) / valores.length)
}

export async function montarMapaCotacoesVisaoGeralBidFreteInternacional(
  cotacoes: CotacaoParaMapa[],
  opcoes?: { id_organizacao?: string },
) {
  const diasMercadoPorRota = new Map<string, number[]>()

  for (const cotacao of cotacoes) {
    const origem = cotacao.origem_codigo_cotacao_bid_frete_internacional.trim().toUpperCase()
    const destino = cotacao.destino_codigo_cotacao_bid_frete_internacional.trim().toUpperCase()
    if (!origem || !destino) continue

    const rotaKey = chaveRotaMapa(
      origem,
      destino,
      cotacao.modal_cotacao_bid_frete_internacional,
      cotacao.tipo_operacao_cotacao_bid_frete_internacional,
    )

    for (const proposta of cotacao.propostas) {
      const dias = proposta.dias_transito_proposta_bid_frete_internacional
      if (dias == null || !Number.isFinite(dias)) continue
      const lista = diasMercadoPorRota.get(rotaKey) ?? []
      lista.push(dias)
      diasMercadoPorRota.set(rotaKey, lista)
    }
  }

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

  const mapa = await montarMapaCotacoesVisaoFornecedorBidFreteInternacional(disparos, opcoes)

  return {
    ...mapa,
    rotas_mapa_visao_fornecedor_bid_frete_internacional:
      mapa.rotas_mapa_visao_fornecedor_bid_frete_internacional.map((rota) => {
        const rotaKey = chaveRotaMapa(
          rota.codigo_origem_mapa_visao_fornecedor_bid_frete_internacional,
          rota.codigo_destino_mapa_visao_fornecedor_bid_frete_internacional,
          rota.modal_mapa_visao_fornecedor_bid_frete_internacional,
          rota.tipo_operacao_cotacao_bid_frete_internacional ?? undefined,
        )
        return {
          ...rota,
          dias_transito_medio_mercado_mapa_visao_fornecedor_bid_frete_internacional: mediaInteira(
            diasMercadoPorRota.get(rotaKey) ?? [],
          ),
        }
      }),
  }
}
