import { describe, expect, it } from 'vitest'
import {
  corOficialProdutoDim,
  corOficialProdutoGravity,
  resolverSlugProdutoGravity,
} from '../../../../nucleo-global/Logo/produtos/src/cores-produto-gravity'

describe('cores-produto-gravity', () => {
  it('resolve aliases de slug', () => {
    expect(resolverSlugProdutoGravity('bid-frete-internacional')).toBe('bid-frete')
    expect(resolverSlugProdutoGravity('nf-import')).toBe('nf-importacao')
  })

  it('retorna cores oficiais do design system', () => {
    expect(corOficialProdutoGravity('bid-frete')).toBe('#60a5fa')
    expect(corOficialProdutoGravity('bid-frete-internacional')).toBe('#60a5fa')
    expect(corOficialProdutoGravity('pedido')).toBe('#f59e0b')
    expect(corOficialProdutoGravity('simula-custo')).toBe('#34d399')
    expect(corOficialProdutoGravity('bid-cambio')).toBe('#06b6d4')
    expect(corOficialProdutoGravity('nf-importacao')).toBe('#c084fc')
    expect(corOficialProdutoGravity('processo')).toBe('#facc15')
  })

  it('gera fundo dim a partir da cor oficial', () => {
    expect(corOficialProdutoDim('bid-frete')).toBe('rgba(96,165,250,0.12)')
    expect(corOficialProdutoDim('smart-read', 0.15)).toBe('rgba(167,139,250,0.15)')
  })
})
