// TST-UNI-STORE-000065 — alinhamento catálogo Admin (13 produtos) + puzzle
import { describe, expect, it } from 'vitest'
import { contarStatusCatalogoStore } from '../../../servicos-global/configurador/src/data/status-produto-store'
import { ordenarSlugsPuzzleStore } from '../../../servicos-global/configurador/src/data/store-puzzle-order'
import { filtrarProdutosPublicadosStore } from '../../../servicos-global/configurador/src/schemas/store-catalogo-api'

const CATALOGO_ADMIN_13 = [
  { slug: 'bid-cambio', status: 'EM_BREVE' },
  { slug: 'bid-frete', status: 'ATIVO' },
  { slug: 'catlogo-de-produtos', status: 'EM_BREVE' },
  { slug: 'due', status: 'EM_BREVE' },
  { slug: 'duimp', status: 'EM_BREVE' },
  { slug: 'financeiro-comex', status: 'EM_BREVE' },
  { slug: 'lpco', status: 'ATIVO' },
  { slug: 'nf-importacao', status: 'EM_BREVE' },
  { slug: 'orkestra', status: 'EM_BREVE' },
  { slug: 'pedido', status: 'ATIVO' },
  { slug: 'simula-custo', status: 'EM_BREVE' },
  { slug: 'smart-read', status: 'EM_BREVE' },
  { slug: 'smart-trnsito', status: 'EM_BREVE' },
] as const

describe('TST-UNI-STORE-000065 — alinhamento Admin SSOT', () => {
  it('filtro publicado mantém 13 itens ATIVO+EM_BREVE', () => {
    const api = CATALOGO_ADMIN_13.map((p, i) => ({
      id: String(i),
      name: p.slug,
      slug: p.slug,
      description: null,
      status: p.status,
      unit_price: 1,
      currency: 'BRL',
    }))
    expect(filtrarProdutosPublicadosStore(api)).toHaveLength(13)
  })

  it('contadores batem com Admin: 10 em breve, 1 disponível, 2 contratados', () => {
    const assinaturas = new Map([
      ['pedido', { is_active: true }],
      ['bid-frete', { is_active: true }],
    ])
    expect(contarStatusCatalogoStore(CATALOGO_ADMIN_13, assinaturas)).toEqual({
      publicados: 13,
      disponiveis: 1,
      contratados: 2,
      em_breve: 10,
    })
  })

  it('puzzle lista 13 slugs do catálogo (sem fantasma fora da API)', () => {
    const ordem = ordenarSlugsPuzzleStore(CATALOGO_ADMIN_13)
    expect(ordem).toHaveLength(13)
    expect(ordem).toContain('catalogo-produto')
    expect(ordem).toContain('smart-transito')
  })
})
