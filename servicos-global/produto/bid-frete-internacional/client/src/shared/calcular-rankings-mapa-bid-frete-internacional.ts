/**
 * Rankings do painel lateral — derivados de pinos/rotas da API.
 */

import type { ArcRouteBidFrete, MapPinBidFrete } from './componentes/visao-geral-mapa-bid-frete'

export type ItemRankingMapaBidFrete = {
  rank: number
  name: string
  code: string
  flag: string
  count: number
  pct: number
  pinId: number | null
}

export type ItemRankingModalMapaBidFrete = {
  modal_cotacao_bid_frete_internacional: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  label: string
  count: number
  pct: number
  cor: string
}

const ROTULO_MODAL: Record<string, string> = {
  MARITIMO: 'Marítimo',
  AEREO: 'Aéreo',
  RODOVIARIO: 'Rodoviário',
}

const COR_MODAL: Record<string, string> = {
  MARITIMO: '#34d399',
  AEREO: '#a78bfa',
  RODOVIARIO: '#fbbf24',
}

function emojiBandeiraPais(iso2: string): string {
  const codigo = iso2.trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(codigo)) return ''
  return String.fromCodePoint(
    ...[...codigo].map((letra) => 0x1f1e6 + letra.charCodeAt(0) - 65),
  )
}

function montarTop10(
  contagem: Map<string, { count: number; pinId: number | null; name: string; flag: string }>,
  total: number,
): ItemRankingMapaBidFrete[] {
  return [...contagem.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([code, item], index) => ({
      rank: index + 1,
      name: item.name,
      code,
      flag: item.flag,
      count: item.count,
      pct: total > 0 ? Math.round((item.count / total) * 1000) / 10 : 0,
      pinId: item.pinId,
    }))
}

export function calcularRankingsMapaBidFreteInternacional(
  pins: MapPinBidFrete[],
  routes: ArcRouteBidFrete[],
): {
  origens: ItemRankingMapaBidFrete[]
  destinos: ItemRankingMapaBidFrete[]
  modais: ItemRankingModalMapaBidFrete[]
  totalBids: number
} {
  const pinPorId = new Map(pins.map((p) => [p.id, p]))
  const origensMap = new Map<string, { count: number; pinId: number | null; name: string; flag: string }>()
  const destinosMap = new Map<string, { count: number; pinId: number | null; name: string; flag: string }>()
  const modaisMap = new Map<string, number>()

  let totalBids = 0

  for (const rota of routes) {
    const qtd = rota.quantidade_disparos_mapa_visao_fornecedor_bid_frete_internacional ?? 1
    totalBids += qtd

    const fromPin = pinPorId.get(rota.fromId)
    const toPin = pinPorId.get(rota.toId)
    const modal = rota.modal_cotacao_bid_frete_internacional ?? (rota.mode === 'AEREO' ? 'AEREO' : 'MARITIMO')
    modaisMap.set(modal, (modaisMap.get(modal) ?? 0) + qtd)

    if (fromPin) {
      const code = fromPin.portCode
      const atual = origensMap.get(code) ?? {
        count: 0,
        pinId: fromPin.id,
        name: fromPin.label,
        flag: fromPin.flag || emojiBandeiraPais(fromPin.country),
      }
      atual.count += qtd
      origensMap.set(code, atual)
    }

    if (toPin) {
      const code = toPin.portCode
      const atual = destinosMap.get(code) ?? {
        count: 0,
        pinId: toPin.id,
        name: toPin.label,
        flag: toPin.flag || emojiBandeiraPais(toPin.country),
      }
      atual.count += qtd
      destinosMap.set(code, atual)
    }
  }

  if (totalBids === 0) {
    for (const pin of pins) {
      totalBids += pin.activeBids
      const code = pin.portCode
      const entry = {
        count: pin.activeBids,
        pinId: pin.id,
        name: pin.label,
        flag: pin.flag || emojiBandeiraPais(pin.country),
      }
      origensMap.set(code, entry)
      destinosMap.set(code, { ...entry })
      modaisMap.set(pin.mode, (modaisMap.get(pin.mode) ?? 0) + pin.activeBids)
    }
  }

  const modais: ItemRankingModalMapaBidFrete[] = [...modaisMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([modal, count]) => ({
      modal_cotacao_bid_frete_internacional: modal as 'MARITIMO' | 'AEREO' | 'RODOVIARIO',
      label: ROTULO_MODAL[modal] ?? modal,
      count,
      pct: totalBids > 0 ? Math.round((count / totalBids) * 1000) / 10 : 0,
      cor: COR_MODAL[modal] ?? '#94a3b8',
    }))

  return {
    origens: montarTop10(origensMap, totalBids),
    destinos: montarTop10(destinosMap, totalBids),
    modais,
    totalBids,
  }
}
