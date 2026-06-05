import { describe, expect, it } from 'vitest'
import { iconeOficialProdutoGravity } from '../../../../nucleo-global/Logo/produtos/src/icone-produto-gravity'

describe('iconeOficialProdutoGravity — SSOT Hub', () => {
  it('retorna elemento React para slugs do Hub', () => {
    const slugs = [
      'pedido',
      'simula-custo',
      'bid-frete',
      'bid-cambio',
      'nf-importacao',
      'smart-read',
      'processo',
    ] as const
    for (const slug of slugs) {
      const node = iconeOficialProdutoGravity(slug, 24)
      expect(node).toBeTruthy()
      expect(typeof node).toBe('object')
    }
  })

  it('resolve aliases de slug', () => {
    expect(iconeOficialProdutoGravity('bid-frete-internacional', 24)).toBeTruthy()
    expect(iconeOficialProdutoGravity('nf-import', 24)).toBeTruthy()
  })
})
