/**
 * Tipos compartilhados do mapa Bid Frete — evita import circular com o componente React.
 */

import type { StatusCotacao } from './types'

export interface MapPinBidFrete {
  id: number
  label: string
  portCode: string
  country: string
  lat: number
  lng: number
  geoLat: number
  geoLng: number
  activeBids: number
  bestPrice: number
  savingPct: number
  mode: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  supplier: string
  flag: string
}

export interface ArcRouteBidFrete {
  fromId: number
  toId: number
  color: string
  heightFactor?: number
  mode: 'MARITIMO' | 'AEREO'
  modal_cotacao_bid_frete_internacional?: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  tipo_operacao_cotacao_bid_frete_internacional?: 'IMPORTACAO' | 'EXPORTACAO'
  transitTime?: number
  marketTransitTime?: number
  quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional?: number
  melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional?: number | null
  statuses_cotacao_bid_frete_internacional?: StatusCotacao[]
}

export type DadosMapaBidFrete = {
  pins: MapPinBidFrete[]
  routes: ArcRouteBidFrete[]
}

export interface RouteDetailBidFrete {
  fromPort: string
  fromFlag: string
  toPort: string
  toFlag: string
  mode: 'MARITIMO' | 'AEREO'
  bids: number
  bestPrice: number
  saving: number
  transitTime: number
  supplier: string
  codigo_origem?: string
  codigo_destino?: string
  marketTransitTime?: number
}
