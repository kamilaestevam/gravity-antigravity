/**
 * Prefixo canônico de URL do BID Frete Internacional no shell (`/bid-frete/*`).
 * Links do menu lateral usam href absoluto — sem o prefixo o shell retorna 404.
 */

export const PREFIXO_URL_BID_FRETE_INTERNACIONAL = '/bid-frete'

const BASE_VISAO_FORNECEDOR = `${PREFIXO_URL_BID_FRETE_INTERNACIONAL}/visao-fornecedor-bid-frete-internacional`

export function rotaBidFreteInternacional(segmento = ''): string {
  const limpo = segmento.replace(/^\//, '')
  return limpo ? `${PREFIXO_URL_BID_FRETE_INTERNACIONAL}/${limpo}` : PREFIXO_URL_BID_FRETE_INTERNACIONAL
}

/** Lista de cotações (visualização tabela/kanban). */
export const ROTA_LISTA_BID_FRETE_INTERNACIONAL = rotaBidFreteInternacional('lista')

/** Query param — painel ativo da lista ao sair/voltar do wizard Nova Cotação. */
export const QUERY_ID_PAINEL_LISTA_BID_FRETE = 'id_painel_lista'

export function idPainelListaBidFreteDoQueryParam(raw: string | null | undefined): string | null {
  const id = raw?.trim()
  return id ? id : null
}

export function buildRotaListaBidFreteComPainelAtivo(id_painel_lista: string): string {
  const params = new URLSearchParams()
  params.set(QUERY_ID_PAINEL_LISTA_BID_FRETE, id_painel_lista)
  return `${ROTA_LISTA_BID_FRETE_INTERNACIONAL}?${params.toString()}`
}

/** Detalhe/cockpit de uma cotação — rota canônica `/bid-frete/cotacoes/:id`. */
export function rotaDetalheCotacaoBidFreteInternacional(
  id_cotacao_bid_frete_internacional: string,
): string {
  return rotaBidFreteInternacional(`cotacoes/${id_cotacao_bid_frete_internacional}`)
}

export const ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL = {
  dashboard: `${BASE_VISAO_FORNECEDOR}/dashboard`,
  paineisDashboard: `${BASE_VISAO_FORNECEDOR}/paineis-dashboard`,
  lista: `${BASE_VISAO_FORNECEDOR}/lista`,
  kanban: `${BASE_VISAO_FORNECEDOR}/kanban`,
  cotacoesPendentes: `${BASE_VISAO_FORNECEDOR}/cotacoes-pendentes`,
  propostas: `${BASE_VISAO_FORNECEDOR}/propostas`,
  tabelasValor: `${BASE_VISAO_FORNECEDOR}/tabelas-valor`,
  desempenho: `${BASE_VISAO_FORNECEDOR}/desempenho`,
  configuracoes: `${BASE_VISAO_FORNECEDOR}/configuracoes`,
  responder: (id_disparo_cotacao_bid_frete_internacional: string) =>
    `${BASE_VISAO_FORNECEDOR}/responder/${id_disparo_cotacao_bid_frete_internacional}`,
} as const
