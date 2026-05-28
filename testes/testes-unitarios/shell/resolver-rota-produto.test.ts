import { describe, expect, it } from 'vitest'
import {
  resolverRotaProdutoGravity,
  resolverSlugMetaProduto,
  slugsProdutoEquivalentes,
} from '../../../servicos-global/shell/utils/resolver-rota-produto'

describe('resolver-rota-produto', () => {
  it('resolve rota canônica do BID Frete Internacional', () => {
    expect(resolverRotaProdutoGravity('bid-frete-internacional')).toBe('/bid-frete')
    expect(resolverRotaProdutoGravity('bid-frete')).toBe('/bid-frete')
  })

  it('resolve slug de meta para bid-frete-internacional', () => {
    expect(resolverSlugMetaProduto('bid-frete-internacional')).toBe('bid-frete')
    expect(resolverSlugMetaProduto('pedido')).toBe('pedido')
  })

  it('trata slugs equivalentes de bid-frete', () => {
    expect(slugsProdutoEquivalentes('bid-frete', 'bid-frete-internacional')).toBe(true)
    expect(slugsProdutoEquivalentes('pedido', 'bid-frete')).toBe(false)
  })

  it('usa path padrão /{slug} para produtos sem alias', () => {
    expect(resolverRotaProdutoGravity('pedido')).toBe('/pedido')
    expect(resolverRotaProdutoGravity('simula-custo')).toBe('/simula-custo')
  })
})
