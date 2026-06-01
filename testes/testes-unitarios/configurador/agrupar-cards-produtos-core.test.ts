// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  agruparCardsProdutosCore,
  temDuasZonasProdutosCore,
  type CardComVarianteCore,
} from '../../../servicos-global/configurador/src/shared/agrupamento-cards-produtos-core.js'

function card(key: string, variant: CardComVarianteCore['variant']): CardComVarianteCore {
  return { key, variant }
}

describe('agruparCardsProdutosCore', () => {
  it('separa operacional e fornecedor', () => {
    const grupo = agruparCardsProdutosCore([
      card('pedido', 'padrao'),
      card('bid:op', 'bid_operacional'),
      card('bid:forn', 'bid_fornecedor'),
    ])
    expect(grupo.meusProdutos).toHaveLength(2)
    expect(grupo.comoFornecedor).toHaveLength(1)
    expect(temDuasZonasProdutosCore(grupo)).toBe(true)
  })

  it('somente fornecedor nao ativa duas zonas', () => {
    const grupo = agruparCardsProdutosCore([card('bid:forn', 'bid_fornecedor')])
    expect(grupo.meusProdutos).toHaveLength(0)
    expect(temDuasZonasProdutosCore(grupo)).toBe(false)
  })
})
