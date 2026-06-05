import { describe, expect, it } from 'vitest'
import {
  contarStatusCatalogoStore,
  resolverStatusProdutoStore,
  statusExibicaoParaLegado,
} from '../../../servicos-global/configurador/src/data/status-produto-store'

const catalogo = [
  { slug: 'pedido', status: 'ATIVO' },
  { slug: 'bid-frete', status: 'ATIVO' },
  { slug: 'bid-cambio', status: 'EM_BREVE' },
  { slug: 'smart-read', status: 'ATIVO' },
] as const

describe('resolverStatusProdutoStore — SSOT admin + assinatura', () => {
  it('EM_BREVE prevalece sobre assinatura ativa', () => {
    const assinaturas = new Map([['bid-cambio', { is_active: true }]])
    expect(resolverStatusProdutoStore('bid-cambio', catalogo, assinaturas)).toBe('em_breve')
  })

  it('ATIVO + assinatura → contratado', () => {
    const assinaturas = new Map([['pedido', { is_active: true }]])
    expect(resolverStatusProdutoStore('pedido', catalogo, assinaturas)).toBe('contratado')
    expect(statusExibicaoParaLegado('contratado')).toBe('owned')
  })

  it('ATIVO sem assinatura → disponivel', () => {
    expect(resolverStatusProdutoStore('smart-read', catalogo, new Map())).toBe('disponivel')
    expect(statusExibicaoParaLegado('disponivel')).toBe('available')
  })

  it('slug fora do catálogo → fora_catalogo', () => {
    expect(resolverStatusProdutoStore('duimp', catalogo, new Map())).toBe('fora_catalogo')
    expect(statusExibicaoParaLegado('fora_catalogo')).toBeNull()
  })

  it('alias puzzle smart-transito → slug smart-trnsito no catálogo', () => {
    const cat = [{ slug: 'smart-trnsito', status: 'EM_BREVE' }] as const
    expect(resolverStatusProdutoStore('smart-transito', cat, new Map())).toBe('em_breve')
  })

  it('contarStatusCatalogoStore alinha cards superiores', () => {
    const assinaturas = new Map([
      ['pedido', { is_active: true }],
      ['bid-cambio', { is_active: true }],
    ])
    expect(contarStatusCatalogoStore(catalogo, assinaturas)).toEqual({
      publicados: 4,
      disponiveis: 2,
      contratados: 1,
      em_breve: 1,
    })
  })
})
