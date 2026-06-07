import { describe, expect, it } from 'vitest'
import {
  isLinhaItemLista,
  tituloTooltipCelulaLista,
  tituloTooltipListaPorNivel,
} from '../../../servicos-global/produto/pedido/client/src/shared/buildTooltipRegraLista'

const t = ((key: string) => {
  const map: Record<string, string> = {
    'pedido.coluna_pai.moeda_pedido_titulo_linha_pedido': 'Moeda do Pedido',
    'pedido.coluna_pai.moeda_item_titulo': 'Moeda do Item',
  }
  return map[key] ?? key
}) as import('i18next').TFunction

describe('isLinhaItemLista', () => {
  it('pedido — numero_pedido identifica linha pai', () => {
    expect(isLinhaItemLista({ numero_pedido: 'P-001', id: 'p1' })).toBe(false)
  })

  it('item — pedido_id identifica linha filho', () => {
    expect(isLinhaItemLista({ pedido_id: 'p1', moeda_item: 'EUR', part_number: 'X' })).toBe(true)
  })

  it('item — moeda_item sem numero_pedido', () => {
    expect(isLinhaItemLista({ moeda_item: 'USD', part_number: 'Y' })).toBe(true)
  })

  it('item enriquecido — _p identifica linha filho', () => {
    expect(isLinhaItemLista({ pedido_id: 'p1', _p: { moeda_pedido: 'USD' } })).toBe(true)
  })

  it('sinais de item têm prioridade sobre numero_pedido fantasma', () => {
    expect(
      isLinhaItemLista({
        numero_pedido: 'P-ghost',
        pedido_id: 'p1',
        moeda_item: 'EUR',
      }),
    ).toBe(true)
  })
})

describe('tituloTooltipCelulaLista — moeda_pedido', () => {
  it('linha pedido → Moeda do Pedido', () => {
    expect(
      tituloTooltipCelulaLista(t, 'moeda_pedido', { numero_pedido: 'P-1' }, 'Moeda do Pedido', 'Moeda do Item'),
    ).toBe('Moeda do Pedido')
  })

  it('linha item → Moeda do Item', () => {
    expect(
      tituloTooltipCelulaLista(
        t,
        'moeda_pedido',
        { pedido_id: 'p1', moeda_item: 'EUR', part_number: 'A' },
        'Moeda do Pedido',
        'Moeda do Item',
      ),
    ).toBe('Moeda do Item')
  })
})

describe('tituloTooltipListaPorNivel — mapa filho (sem heurística de row)', () => {
  it('nível item → Moeda do Item mesmo com row ambíguo', () => {
    expect(tituloTooltipListaPorNivel(t, 'moeda_pedido', 'item')).toBe('Moeda do Item')
  })

  it('nível pai → Moeda do Pedido', () => {
    expect(tituloTooltipListaPorNivel(t, 'moeda_pedido', 'pai')).toBe('Moeda do Pedido')
  })
})
