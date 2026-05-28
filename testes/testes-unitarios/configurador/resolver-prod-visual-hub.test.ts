import { describe, expect, it } from 'vitest'
import { resolverProdVisualHub } from '../../../servicos-global/configurador/src/utils/resolver-prod-visual-hub'

const fallback = {
  color: '#6366f1',
  dim: 'rgba(99,102,241,0.12)',
  icon: 'generic',
  description: 'default',
}

describe('resolverProdVisualHub', () => {
  it('retorna entrada do mapa quando o slug está registrado', () => {
    const mapped = { ...fallback, color: '#60a5fa', dim: 'rgba(96,165,250,0.12)' }
    const result = resolverProdVisualHub('bid-frete', { 'bid-frete': mapped }, fallback)
    expect(result).toBe(mapped)
  })

  it('aplica cor oficial do SSOT para slug fora do mapa (ex.: lpco)', () => {
    const result = resolverProdVisualHub('lpco', {}, fallback)
    expect(result.color).toBe('#f43f5e')
    expect(result.dim).toBe('rgba(244,63,94,0.12)')
    expect(result.icon).toBe('generic')
  })

  it('resolve via altKey (product_key) quando slug do catálogo difere', () => {
    const mapped = { ...fallback, color: '#f59e0b', dim: 'rgba(245,158,11,0.12)' }
    const result = resolverProdVisualHub('slug-desconhecido', { pedido: mapped }, fallback, 'pedido')
    expect(result).toBe(mapped)
  })

  it('financeiro-comex usa cor oficial mesmo sem mapa Hub', () => {
    const result = resolverProdVisualHub('financeiro-comex', {}, fallback)
    expect(result.color).toBe('#f472b6')
  })
})
