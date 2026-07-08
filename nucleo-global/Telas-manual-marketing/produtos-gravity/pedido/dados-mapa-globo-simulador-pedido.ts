import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'

export type PinMapaSimuladorPedido = {
  id: number
  label: string
  country: string
  flag: string
  portCode: string
  geoLat: number
  geoLng: number
  tipoOperacao: 'importacao' | 'exportacao'
  pedidosCount: number
  contratosCambioCount: number
  totalAReceber: string
  totalAPagar: string
  fornecedorPrincipal?: string
}

export type RotaMapaSimuladorPedido = {
  fromId: number
  toId: number
  mode: 'importacao' | 'exportacao'
  color: string
  heightFactor?: number
}

export type MapaPedidoEmpresaSimulador = {
  pins: PinMapaSimuladorPedido[]
  rotas: RotaMapaSimuladorPedido[]
}

const COR_IMPORTACAO = 'rgba(245, 158, 11, 0.8)'
const COR_EXPORTACAO = 'rgba(167, 139, 250, 0.8)'

export const MAPA_PEDIDO_POR_EMPRESA_SIMULADOR: Record<string, MapaPedidoEmpresaSimulador> = {
  'filial-sc-importador': {
    pins: [
      { id: 1, label: 'Recife', country: 'BR', flag: '🇧🇷', portCode: 'BRREC', geoLat: -8.05, geoLng: -34.88, tipoOperacao: 'importacao', pedidosCount: 31, contratosCambioCount: 8, totalAReceber: 'USD 620.000', totalAPagar: 'USD 410.000', fornecedorPrincipal: 'Asia Pacific Ltd' },
      { id: 2, label: 'Shenzhen', country: 'CN', flag: '🇨🇳', portCode: 'CNSZX', geoLat: 22.54, geoLng: 114.06, tipoOperacao: 'importacao', pedidosCount: 14, contratosCambioCount: 4, totalAReceber: 'USD 210.000', totalAPagar: 'USD 155.000', fornecedorPrincipal: 'Shenzhen Components' },
      { id: 3, label: 'Tóquio', country: 'JP', flag: '🇯🇵', portCode: 'JPTYO', geoLat: 35.68, geoLng: 139.65, tipoOperacao: 'importacao', pedidosCount: 11, contratosCambioCount: 3, totalAReceber: 'JPY 24.000.000', totalAPagar: 'JPY 16.000.000' },
    ],
    rotas: [
      { fromId: 2, toId: 1, mode: 'importacao', color: COR_IMPORTACAO, heightFactor: 0.18 },
      { fromId: 3, toId: 1, mode: 'importacao', color: COR_IMPORTACAO, heightFactor: 0.2 },
    ],
  },
  'matriz-sp-importador': {
    pins: [
      { id: 7, label: 'São Paulo', country: 'BR', flag: '🇧🇷', portCode: 'BRSAO', geoLat: -23.55, geoLng: -46.63, tipoOperacao: 'importacao', pedidosCount: 24, contratosCambioCount: 6, totalAReceber: 'GBP 320.000', totalAPagar: 'GBP 198.000', fornecedorPrincipal: 'EuroParts GmbH' },
      { id: 4, label: 'Londres', country: 'GB', flag: '🇬🇧', portCode: 'GBLON', geoLat: 51.51, geoLng: -0.13, tipoOperacao: 'importacao', pedidosCount: 12, contratosCambioCount: 3, totalAReceber: 'GBP 199.800', totalAPagar: 'GBP 142.500' },
      { id: 8, label: 'Rotterdam', country: 'NL', flag: '🇳🇱', portCode: 'NLRTM', geoLat: 51.92, geoLng: 4.48, tipoOperacao: 'importacao', pedidosCount: 10, contratosCambioCount: 2, totalAReceber: 'EUR 145.000', totalAPagar: 'EUR 98.000' },
    ],
    rotas: [
      { fromId: 4, toId: 7, mode: 'importacao', color: COR_IMPORTACAO, heightFactor: 0.22 },
      { fromId: 8, toId: 7, mode: 'importacao', color: COR_IMPORTACAO, heightFactor: 0.19 },
    ],
  },
  'filial-pr-exportador': {
    pins: [
      { id: 10, label: 'Paranaguá', country: 'BR', flag: '🇧🇷', portCode: 'BRPNG', geoLat: -25.52, geoLng: -48.51, tipoOperacao: 'exportacao', pedidosCount: 19, contratosCambioCount: 5, totalAReceber: 'USD 480.000', totalAPagar: 'USD 120.000', fornecedorPrincipal: 'Agro Export PR' },
      { id: 6, label: 'Detroit', country: 'US', flag: '🇺🇸', portCode: 'USDTT', geoLat: 42.33, geoLng: -83.05, tipoOperacao: 'exportacao', pedidosCount: 11, contratosCambioCount: 3, totalAReceber: 'USD 310.000', totalAPagar: 'USD 95.000' },
      { id: 9, label: 'Santos', country: 'BR', flag: '🇧🇷', portCode: 'BRSSZ', geoLat: -23.96, geoLng: -46.33, tipoOperacao: 'exportacao', pedidosCount: 9, contratosCambioCount: 2, totalAReceber: 'USD 220.000', totalAPagar: 'USD 80.000' },
    ],
    rotas: [
      { fromId: 10, toId: 6, mode: 'exportacao', color: COR_EXPORTACAO, heightFactor: 0.16 },
      { fromId: 10, toId: 9, mode: 'exportacao', color: COR_EXPORTACAO, heightFactor: 0.12 },
    ],
  },
  'importador-ltda': {
    pins: [
      { id: 1, label: 'Recife', country: 'BR', flag: '🇧🇷', portCode: 'BRREC', geoLat: -8.05, geoLng: -34.88, tipoOperacao: 'importacao', pedidosCount: 20, contratosCambioCount: 5, totalAReceber: 'EUR 380.000', totalAPagar: 'EUR 260.000', fornecedorPrincipal: 'Nordic Supply' },
      { id: 5, label: 'Paris', country: 'FR', flag: '🇫🇷', portCode: 'FRPAR', geoLat: 48.86, geoLng: 2.35, tipoOperacao: 'importacao', pedidosCount: 13, contratosCambioCount: 3, totalAReceber: 'EUR 180.000', totalAPagar: 'EUR 95.000' },
      { id: 11, label: 'Hamburgo', country: 'DE', flag: '🇩🇪', portCode: 'DEHAM', geoLat: 53.55, geoLng: 9.99, tipoOperacao: 'importacao', pedidosCount: 11, contratosCambioCount: 2, totalAReceber: 'EUR 155.000', totalAPagar: 'EUR 110.000' },
    ],
    rotas: [
      { fromId: 5, toId: 1, mode: 'importacao', color: COR_IMPORTACAO, heightFactor: 0.2 },
      { fromId: 11, toId: 1, mode: 'importacao', color: COR_IMPORTACAO, heightFactor: 0.21 },
    ],
  },
  'exportador-ltda': {
    pins: [
      { id: 9, label: 'Santos', country: 'BR', flag: '🇧🇷', portCode: 'BRSSZ', geoLat: -23.96, geoLng: -46.33, tipoOperacao: 'exportacao', pedidosCount: 14, contratosCambioCount: 4, totalAReceber: 'GBP 142.500', totalAPagar: 'GBP 48.000', fornecedorPrincipal: 'Café Santos Export' },
      { id: 5, label: 'Paris', country: 'FR', flag: '🇫🇷', portCode: 'FRPAR', geoLat: 48.86, geoLng: 2.35, tipoOperacao: 'exportacao', pedidosCount: 9, contratosCambioCount: 2, totalAReceber: 'EUR 98.000', totalAPagar: 'EUR 32.000' },
      { id: 4, label: 'Londres', country: 'GB', flag: '🇬🇧', portCode: 'GBLON', geoLat: 51.51, geoLng: -0.13, tipoOperacao: 'exportacao', pedidosCount: 8, contratosCambioCount: 2, totalAReceber: 'GBP 88.000', totalAPagar: 'GBP 28.000' },
    ],
    rotas: [
      { fromId: 9, toId: 5, mode: 'exportacao', color: COR_EXPORTACAO, heightFactor: 0.14 },
      { fromId: 9, toId: 4, mode: 'exportacao', color: COR_EXPORTACAO, heightFactor: 0.18 },
    ],
  },
}

function chaveRota(rota: RotaMapaSimuladorPedido): string {
  return `${rota.fromId}|${rota.toId}|${rota.mode}`
}

export function agregarMapaPedidosEmpresasSimulador(
  empresas: PerfilEmpresaSimulador[],
): MapaPedidoEmpresaSimulador {
  const perfis = empresas
    .map((empresa) => MAPA_PEDIDO_POR_EMPRESA_SIMULADOR[empresa.id])
    .filter((perfil): perfil is MapaPedidoEmpresaSimulador => Boolean(perfil))

  if (perfis.length === 0) {
    return agregarMapaPedidosEmpresasSimulador([{ id: 'filial-sc-importador' } as PerfilEmpresaSimulador])
  }

  const pinMap = new Map<number, PinMapaSimuladorPedido>()
  for (const perfil of perfis) {
    for (const pin of perfil.pins) {
      const atual = pinMap.get(pin.id)
      if (!atual) {
        pinMap.set(pin.id, { ...pin })
        continue
      }
      pinMap.set(pin.id, {
        ...atual,
        pedidosCount: atual.pedidosCount + pin.pedidosCount,
        contratosCambioCount: atual.contratosCambioCount + pin.contratosCambioCount,
        tipoOperacao:
          pin.pedidosCount > atual.pedidosCount ? pin.tipoOperacao : atual.tipoOperacao,
        fornecedorPrincipal:
          perfis.length > 1 ? 'Escopo consolidado' : atual.fornecedorPrincipal ?? pin.fornecedorPrincipal,
      })
    }
  }

  const pinIds = new Set(pinMap.keys())
  const rotaMap = new Map<string, RotaMapaSimuladorPedido>()
  for (const perfil of perfis) {
    for (const rota of perfil.rotas) {
      if (!pinIds.has(rota.fromId) || !pinIds.has(rota.toId)) continue
      if (!rotaMap.has(chaveRota(rota))) {
        rotaMap.set(chaveRota(rota), { ...rota })
      }
    }
  }

  return {
    pins: [...pinMap.values()].sort((a, b) => b.pedidosCount - a.pedidosCount),
    rotas: [...rotaMap.values()],
  }
}

const TODAS_EMPRESAS_MAPA = Object.keys(MAPA_PEDIDO_POR_EMPRESA_SIMULADOR).map(
  (id) => ({ id }) as PerfilEmpresaSimulador,
)

/** Fallback consolidado — todas as empresas selecionadas. */
export const PINS_MAPA_SIMULADOR_PEDIDO: PinMapaSimuladorPedido[] =
  agregarMapaPedidosEmpresasSimulador(TODAS_EMPRESAS_MAPA).pins

export const ROTAS_MAPA_SIMULADOR_PEDIDO: RotaMapaSimuladorPedido[] =
  agregarMapaPedidosEmpresasSimulador(TODAS_EMPRESAS_MAPA).rotas
