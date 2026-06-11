/**
 * Helpers do fluxo Novo BID → wizard de cotação com ?id_bid=
 */

const QUERY_ID_BID = 'id_bid'

export function idBidDoQueryParam(raw: string | null | undefined): string | null {
  const id = raw?.trim()
  return id ? id : null
}

export function buildRotaNovaCotacaoComBid(idBid: string): string {
  return `/bid-frete/cotacoes/nova?${QUERY_ID_BID}=${encodeURIComponent(idBid)}`
}

export function buildQueryIdBid(idBid: string): string {
  return `${QUERY_ID_BID}=${encodeURIComponent(idBid)}`
}
