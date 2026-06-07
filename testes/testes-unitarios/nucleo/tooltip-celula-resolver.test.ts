import { describe, expect, it } from 'vitest'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import {
  resolverNivelTooltipCelula,
  resolverTituloTooltipCelula,
  resolverTooltipRegraCelula,
} from '../../../nucleo-global/Tabelas/tabela-virtual-global/src/tooltipCelulaResolver'

const colMoeda: GTColuna<unknown> = {
  key: 'moeda_pedido',
  label: 'Moeda do Pedido/Item',
  tooltipTitulo: 'Moeda do Pedido',
  tooltipTituloItem: 'Moeda do Item',
  tooltipNivelCelula: (row) => {
    const r = row as Record<string, unknown>
    return r._p != null || typeof r.pedido_id === 'string' ? 'item' : 'pedido'
  },
  tooltipTituloCelula: (row) => {
    const r = row as Record<string, unknown>
    return r._p != null || typeof r.pedido_id === 'string' ? 'Moeda do Item' : 'Moeda do Pedido'
  },
  tooltipDescricao: 'bloco-pedido',
  tooltipDescricaoItem: 'bloco-item',
}

describe('resolverNivelTooltipCelula — SSOT núcleo', () => {
  it('usa tooltipNivelCelula em vez de isFilho da renderização', () => {
    const pedido = { numero_pedido: 'P-1' }
    expect(resolverNivelTooltipCelula(colMoeda, pedido, true)).toBe(false)
    expect(resolverNivelTooltipCelula(colMoeda, pedido, false)).toBe(false)
  })

  it('item enriquecido com _p → nível item mesmo se isFilhoRender false', () => {
    const item = { pedido_id: 'p1', moeda_item: 'EUR', _p: { moeda_pedido: 'USD' } }
    expect(resolverNivelTooltipCelula(colMoeda, item, false)).toBe(true)
  })
})

describe('resolverTituloTooltipCelula — moeda', () => {
  it('linha item → Moeda do Item', () => {
    const item = { pedido_id: 'p1', moeda_item: 'EUR', _p: {} }
    expect(resolverTituloTooltipCelula(colMoeda, item, false)).toBe('Moeda do Item')
  })

  it('linha pedido → Moeda do Pedido', () => {
    const pedido = { numero_pedido: 'P-1', moeda_pedido: 'USD' }
    expect(resolverTituloTooltipCelula(colMoeda, pedido, true)).toBe('Moeda do Pedido')
  })
})

describe('resolverTooltipRegraCelula — título alinhado à descrição', () => {
  it('item: título e descrição no nível item', () => {
    const item = { pedido_id: 'p1', moeda_item: 'EUR', _p: {} }
    const regra = resolverTooltipRegraCelula(colMoeda, item, false)
    expect(regra?.titulo).toBe('Moeda do Item')
    expect(regra?.descricao).toBe('bloco-item')
  })

  it('inferência por referência de tooltipDescricaoItem (sem tooltipNivelCelula)', () => {
    const descricaoItem = 'bloco-item-ref' as unknown as GTColuna<unknown>['tooltipDescricaoItem']
    const colSemNivel: GTColuna<unknown> = {
      key: 'moeda_pedido',
      label: 'Moeda',
      tooltipTitulo: 'Moeda do Pedido',
      tooltipTituloItem: 'Moeda do Item',
      tooltipDescricao: 'bloco-pedido-ref',
      tooltipDescricaoItem: descricaoItem,
      tooltipTituloCelula: () => 'Moeda do Pedido',
      tooltipDescricaoCelula: () => descricaoItem,
    }
    const item = { moeda_item: 'EUR' }
    expect(resolverTituloTooltipCelula(colSemNivel, item, false)).toBe('Moeda do Item')
    expect(resolverNivelTooltipCelula(colSemNivel, item, false)).toBe(true)
  })
})
