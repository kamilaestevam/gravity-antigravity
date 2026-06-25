// TST-UNI-STORE-000072 — puzzle só ATIVO (owned + available), sem EM_BREVE
import { describe, expect, it } from 'vitest'
import {
  slugsPuzzleStackProdutosGravity,
} from '../../../servicos-global/configurador/src/lib/produtos-gravity-store-status'
import { pecasPuzzleStackProdutosGravity } from '../../../servicos-global/configurador/src/components/puzzle-stack-produtos-gravity'

const CATALOGO_MISTO = [
  { slug: 'pedido', name: 'Pedido', status: 'ATIVO' },
  { slug: 'bid-frete-internacional', name: 'Bid Frete', status: 'ATIVO' },
  { slug: 'bid-cambio', name: 'Bid Câmbio', status: 'ATIVO' },
  { slug: 'smart-read', name: 'Smart Read', status: 'ATIVO' },
  { slug: 'duimp', name: 'DUIMP', status: 'EM_BREVE' },
  { slug: 'nf-importacao', name: 'NF Import', status: 'EM_BREVE' },
  { slug: 'lpco', name: 'LPCO', status: 'EM_BREVE' },
] as const

describe('TST-UNI-STORE-000072 — puzzle exclui EM_BREVE', () => {
  const assinaturas = [{ product_key: 'pedido', is_active: true }]

  it('slugsPuzzleStack ignora EM_BREVE do catálogo', () => {
    const slugs = slugsPuzzleStackProdutosGravity([...CATALOGO_MISTO])
    expect(slugs).toHaveLength(4)
    expect(slugs).not.toContain('duimp')
    expect(slugs).not.toContain('nf-importacao')
  })

  it('pecasPuzzleStack só owned e available (sem soon)', () => {
    const pecas = pecasPuzzleStackProdutosGravity([...CATALOGO_MISTO], assinaturas)
    expect(pecas).toHaveLength(4)
    expect(pecas.every(p => p.status === 'owned' || p.status === 'available')).toBe(true)
    expect(pecas.filter(p => p.status === 'owned')).toHaveLength(1)
    expect(pecas.filter(p => p.status === 'available')).toHaveLength(3)
  })
})
