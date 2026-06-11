import { describe, expect, it } from 'vitest'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import {
  resolverNivelTooltipCelula,
  resolverTituloFinalTooltipCelula,
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
  it('linha filha GTV (isFilhoRender=true) é sempre nível item', () => {
    const pedido = { numero_pedido: 'P-1' }
    expect(resolverNivelTooltipCelula(colMoeda, pedido, true)).toBe(true)
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

  it('linha pedido (isFilhoRender=false) → Moeda do Pedido', () => {
    const pedido = { numero_pedido: 'P-1', moeda_pedido: 'USD' }
    expect(resolverTituloTooltipCelula(colMoeda, pedido, false)).toBe('Moeda do Pedido')
  })

  it('linha filha GTV (isFilhoRender=true) → Moeda do Item mesmo com payload de pedido', () => {
    const pedido = { numero_pedido: 'P-1', moeda_pedido: 'USD' }
    expect(resolverTituloTooltipCelula(colMoeda, pedido, true)).toBe('Moeda do Item')
  })

  it('isFilhoRender=true sem tooltipTituloItem não usa tooltipTitulo de pedido', () => {
    const colSemTituloItem: GTColuna<unknown> = {
      key: 'moeda_pedido',
      label: 'Moeda do Pedido/Item',
      tooltipTitulo: 'Moeda do Pedido',
      tooltipDescricaoItem: 'corpo-item',
    }
    const item = { moeda_item: 'USD' }
    expect(resolverTituloTooltipCelula(colSemTituloItem, item, true)).toBe('Moeda do Pedido/Item')
  })
})

describe('resolverTooltipRegraCelula — título alinhado à descrição', () => {
  it('item: título e descrição no nível item', () => {
    const item = { pedido_id: 'p1', moeda_item: 'EUR', _p: {} }
    const regra = resolverTooltipRegraCelula(colMoeda, item, false)
    expect(regra?.titulo).toBe('Moeda do Item')
    expect(regra?.descricao).toBe('bloco-item')
  })

  it('tituloOverride do mapaColunasFilho (moeda item)', () => {
    const col: GTColuna<unknown> = {
      key: 'moeda_pedido',
      label: 'Moeda',
      tooltipTitulo: 'Moeda do Pedido',
      tooltipTituloItem: 'Moeda do Item',
      tooltipDescricaoItem: 'corpo-item',
    }
    const regra = { titulo: 'Moeda do Pedido', descricao: 'corpo-item' }
    expect(
      resolverTituloFinalTooltipCelula(col, regra, true, 'Moeda do Item'),
    ).toBe('Moeda do Item')
  })

  it('isFilhoRender=true: tooltipTituloItem vence tituloOverride de pedido', () => {
    const col: GTColuna<unknown> = {
      key: 'moeda_pedido',
      label: 'Moeda',
      tooltipTitulo: 'Moeda do Pedido',
      tooltipTituloItem: 'Moeda do Item',
      tooltipDescricaoItem: 'corpo-item',
    }
    const regra = { titulo: 'Moeda do Pedido', descricao: 'corpo-item' }
    expect(
      resolverTituloFinalTooltipCelula(col, regra, true, 'Moeda do Pedido'),
    ).toBe('Moeda do Item')
  })

  it('isFilhoRender=true: tituloOverride do mapa vence tooltipTitulo de pedido (col inline)', () => {
    const colInline: GTColuna<unknown> = {
      key: 'moeda_pedido',
      label: 'Moeda do Pedido/Item',
      tooltipTitulo: 'Moeda do Pedido',
      tooltipDescricao: 'corpo-pedido',
      tooltipDescricaoItem: 'corpo-item',
      tooltipInline: true,
    }
    const item = { moeda_item: 'EUR' }
    const regra = { titulo: 'Moeda do Pedido', descricao: 'corpo-item' }
    expect(
      resolverTituloFinalTooltipCelula(colInline, regra, true, 'Moeda do Item', item),
    ).toBe('Moeda do Item')
  })

  it('isFilhoRender=true sem tooltipTituloItem usa tooltipTituloCelula do item', () => {
    const colSemTituloItem: GTColuna<unknown> = {
      key: 'moeda_pedido',
      label: 'Moeda',
      tooltipTitulo: 'Moeda do Pedido',
      tooltipTituloCelula: (row) => {
        const r = row as Record<string, unknown>
        return r.moeda_item ? 'Moeda do Item' : 'Moeda do Pedido'
      },
      tooltipDescricaoItem: 'corpo-item',
    }
    const item = { moeda_item: 'EUR' }
    const regra = { titulo: 'Moeda do Pedido', descricao: 'corpo-item' }
    expect(
      resolverTituloFinalTooltipCelula(colSemTituloItem, regra, true, undefined, item),
    ).toBe('Moeda do Item')
  })

  it('isFilhoRender=true vence tooltipNivelCelula pedido (bug moeda item)', () => {
    const colNivelErrado: GTColuna<unknown> = {
      key: 'moeda_pedido',
      label: 'Moeda',
      tooltipTitulo: 'Moeda do Pedido',
      tooltipTituloItem: 'Moeda do Item',
      tooltipNivelCelula: () => 'pedido',
      tooltipTituloCelula: () => 'Moeda do Pedido',
      tooltipDescricao: 'pedido',
      tooltipDescricaoItem: 'item',
    }
    const item = { moeda_item: 'USD' }
    expect(resolverTituloTooltipCelula(colNivelErrado, item, true)).toBe('Moeda do Item')
    expect(resolverNivelTooltipCelula(colNivelErrado, item, true)).toBe(true)
  })

  it('linha pedido: título pedido permanece pedido (não troca por tooltipTituloItem)', () => {
    const col: GTColuna<unknown> = {
      key: 'data_prevista_pedido_pronto',
      label: 'Data Prevista',
      tooltipTitulo: 'Data Prevista — Pedido Pronto',
      tooltipTituloItem: 'Data Prevista — Item Pronto',
      tooltipDescricao: 'bloco-pedido',
      tooltipDescricaoItem: 'bloco-item',
    }
    const pedido = { numero_pedido: 'P-1' }
    const regra = resolverTooltipRegraCelula(col, pedido, false)
    expect(regra?.titulo).toBe('Data Prevista — Pedido Pronto')
    expect(regra?.descricao).toBe('bloco-pedido')
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
