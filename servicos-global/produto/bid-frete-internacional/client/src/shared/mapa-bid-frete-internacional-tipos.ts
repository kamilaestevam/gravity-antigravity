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
  quantidadeCotacoesAvulsas: number
  quantidadeBids: number
  bestPrice: number
  savingPct: number
  mode: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  supplier: string
  flag: string
  labelCotacao?: string
  alertaDivergenciaCadastros?: string | null
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
  quantidade_cotacoes_avulsas_mapa_visao_fornecedor_bid_frete_internacional?: number
  quantidade_bids_mapa_visao_fornecedor_bid_frete_internacional?: number
  melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional?: number | null
  id_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional?: string | null
  numero_cotacao_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional?: string | null
  numero_bid_melhor_proposta_mapa_visao_fornecedor_bid_frete_internacional?: string | null
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
  quantidadeCotacoes: number
  quantidadeBids: number
  bestPrice: number
  saving: number
  transitTime: number
  supplier: string
  codigo_origem?: string
  codigo_destino?: string
  codigo_origem_nome?: string
  codigo_destino_nome?: string
  marketTransitTime?: number
  id_cotacao_bid_frete_internacional?: string | null
  numero_cotacao_bid_frete_internacional?: string | null
  numero_bid_bid_frete_internacional?: string | null
}
