// TST-UNI-STORE-000066 — contrato Zod store-catalogo-api
import { describe, expect, it } from 'vitest'
import {
  filtrarProdutosPublicadosStore,
  storeAssinaturasRespostaSchema,
  storeCatalogoRespostaApiSchema,
} from '../../../servicos-global/configurador/src/schemas/store-catalogo-api'

describe('TST-UNI-STORE-000066 — store-catalogo-api Zod', () => {
  it('parse catálogo legado { products: [...] }', () => {
    const raw = {
      products: [{
        id: '1',
        name: 'Pedido',
        slug: 'pedido',
        description: 'Gestão de pedidos',
        status: 'ATIVO',
        unit_price: 99,
        currency: 'BRL',
      }],
    }
    const parsed = storeCatalogoRespostaApiSchema.parse(raw)
    expect(parsed.products).toHaveLength(1)
    expect(parsed.products[0]?.slug).toBe('pedido')
  })

  it('rejeita payload sem products', () => {
    expect(() => storeCatalogoRespostaApiSchema.parse({})).toThrow()
  })

  it('filtrarProdutosPublicadosStore ignora LEGADO/SUSPENSO', () => {
    const items = filtrarProdutosPublicadosStore([
      { id: '1', name: 'A', slug: 'a', description: null, status: 'ATIVO', unit_price: 1, currency: 'BRL' },
      { id: '2', name: 'B', slug: 'b', description: null, status: 'LEGADO', unit_price: 1, currency: 'BRL' },
      { id: '3', name: 'C', slug: 'c', description: null, status: 'em_breve', unit_price: 1, currency: 'BRL' },
    ])
    expect(items.map((p) => p.slug)).toEqual(['a', 'c'])
  })

  it('parse assinaturas mínimo para contadores da Store', () => {
    const raw = {
      assinaturas: [{
        produto: { slug_produto_gravity: 'pedido' },
        configuracao: { ativo_configuracao_produto_gravity: true },
      }],
    }
    const parsed = storeAssinaturasRespostaSchema.parse(raw)
    expect(parsed.assinaturas[0]?.produto.slug_produto_gravity).toBe('pedido')
  })
})
