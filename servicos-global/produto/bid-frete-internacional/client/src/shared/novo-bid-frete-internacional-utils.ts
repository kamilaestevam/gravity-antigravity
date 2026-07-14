/**
 * Helpers do fluxo Novo BID → wizard de cotação com ?id_bid=
 */

import { rotaBidFreteInternacional } from './rotas-bid-frete-internacional'

const QUERY_ID_BID = 'id_bid'
/** Espelha QUERY_ID_PAINEL_LISTA_BID_FRETE em rotas-bid-frete-internacional.ts */
const QUERY_ID_PAINEL_LISTA = 'id_painel_lista'

export function idBidDoQueryParam(raw: string | null | undefined): string | null {
  const id = raw?.trim()
  return id ? id : null
}

export function buildRotaNovaCotacaoComBid(idBid: string, idPainelLista?: string | null): string {
  const params = new URLSearchParams()
  params.set(QUERY_ID_BID, idBid)
  if (idPainelLista?.trim()) {
    params.set(QUERY_ID_PAINEL_LISTA, idPainelLista.trim())
  }
  return `${rotaBidFreteInternacional('cotacoes/nova')}?${params.toString()}`
}

export function buildRotaNovaCotacaoManual(idPainelLista?: string | null): string {
  const id = idPainelLista?.trim()
  if (!id) return rotaBidFreteInternacional('cotacoes/nova')
  const params = new URLSearchParams()
  params.set(QUERY_ID_PAINEL_LISTA, id)
  return `${rotaBidFreteInternacional('cotacoes/nova')}?${params.toString()}`
}

export function buildQueryIdBid(idBid: string): string {
  return `${QUERY_ID_BID}=${encodeURIComponent(idBid)}`
}

/** Query `origem` reconhecida pelo Smart Docs ao abrir Nova Leitura a partir do BID Frete. */
export const ORIGEM_SMART_READ_BID_FRETE_INTERNACIONAL = 'bid-frete-internacional'

export function buildUrlNovaLeituraSmartReadBidFreteInternacional(): string {
  const params = new URLSearchParams({
    origem: ORIGEM_SMART_READ_BID_FRETE_INTERNACIONAL,
    acao: 'nova-leitura',
  })
  return `/smart-read/lista?${params.toString()}`
}
