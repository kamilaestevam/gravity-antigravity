/**
 * Agrega métricas de pinos a partir das rotas (modo API / cotações).
 */

import type { ArcRouteBidFrete, MapPinBidFrete } from './mapa-bid-frete-internacional-tipos'

export function enriquecerPinsMapaBidFreteInternacional(
  pins: MapPinBidFrete[],
  routes: ArcRouteBidFrete[],
): MapPinBidFrete[] {
  if (pins.length === 0 || routes.length === 0) return pins

  const melhorPrecoPorPin = new Map<number, number>()
  const rotasPorPin = new Map<number, number>()

  for (const rota of routes) {
    const valor = rota.melhor_valor_proposta_mapa_visao_fornecedor_bid_frete_internacional
    for (const pinId of [rota.fromId, rota.toId]) {
      rotasPorPin.set(pinId, (rotasPorPin.get(pinId) ?? 0) + 1)
      if (valor != null && Number.isFinite(valor) && valor > 0) {
        const atual = melhorPrecoPorPin.get(pinId)
        if (atual == null || valor < atual) {
          melhorPrecoPorPin.set(pinId, valor)
        }
      }
    }
  }

  return pins.map((pin) => ({
    ...pin,
    bestPrice: melhorPrecoPorPin.get(pin.id) ?? pin.bestPrice,
    activeBids: pin.activeBids > 0 ? pin.activeBids : (rotasPorPin.get(pin.id) ?? pin.activeBids),
  }))
}

export type ModoMetricaMapaBidFrete = 'demonstracao' | 'cotacoes'

export function modoMetricaMapaBidFrete(fonteDados: 'demonstracao' | 'api'): ModoMetricaMapaBidFrete {
  return fonteDados === 'api' ? 'cotacoes' : 'demonstracao'
}

export function pinTemPropostaComValor(pin: MapPinBidFrete): boolean {
  return pin.bestPrice > 0
}
