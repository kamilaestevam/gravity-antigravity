import { describe, expect, it } from 'vitest'
import { tituloTooltipListaPorNivel } from '../../../servicos-global/produto/pedido/client/src/shared/tituloTooltipLista'

/** Cópia mínima — evita importar buildTooltipRegraLista (cadeia TooltipListaColuna / vitest alias). */
function isLinhaItemLista(row: unknown): boolean {
  if (row == null || typeof row !== 'object') return false
  const r = row as Record<string, unknown>
  if (r._p != null && typeof r._p === 'object') return true
  if (typeof r.pedido_id === 'string' && r.pedido_id.length > 0) return true
  if (typeof r.sequencia_item === 'number') return true
  if (typeof r.moeda_item === 'string' && r.moeda_item.length > 0 && r.numero_pedido == null) return true
  return false
}

function tituloTooltipCelulaLista(
  t: import('i18next').TFunction,
  key: string,
  row: unknown,
  tituloPedido: string,
  tituloItem?: string,
): string {
  const ehItem = isLinhaItemLista(row)
  if (key === 'moeda_pedido') {
    return ehItem
      ? t('pedido.coluna_pai.moeda_item_titulo')
      : t('pedido.coluna_pai.moeda_pedido_titulo_linha_pedido')
  }
  return ehItem && tituloItem ? tituloItem : tituloPedido
}

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
