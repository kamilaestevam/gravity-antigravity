// @vitest-environment node
// Testes unitários do DATA_CATALOG e funções de catálogo do Dashboard

import { describe, it, expect } from 'vitest'
import {
  DATA_CATALOG,
  getCatalogForUser,
  getCatalogByProduct,
  resolveCatalogField,
} from '../../../servicos-global/tenant/dashboard/server/lib/catalog.js'

// ---------------------------------------------------------------------------
// Suite 1 — DATA_CATALOG: estrutura e tamanho
// ---------------------------------------------------------------------------

describe('DATA_CATALOG — estrutura', () => {
  it('deve ter pelo menos 48 campos', () => {
    expect(DATA_CATALOG.length).toBeGreaterThanOrEqual(48)
  })

  it('todo campo deve ter as propriedades obrigatórias', () => {
    for (const field of DATA_CATALOG) {
      expect(field).toHaveProperty('key')
      expect(field).toHaveProperty('label')
      expect(field).toHaveProperty('productId')
      expect(field).toHaveProperty('productPort')
      expect(field).toHaveProperty('type')
      expect(field).toHaveProperty('aggregations')
      expect(field).toHaveProperty('permission')
      expect(field).toHaveProperty('chartTypes')

      expect(typeof field.key).toBe('string')
      expect(field.key.length).toBeGreaterThan(0)
      expect(typeof field.label).toBe('string')
      expect(field.label.length).toBeGreaterThan(0)
      expect(typeof field.productId).toBe('string')
      expect(typeof field.productPort).toBe('number')
      expect(typeof field.permission).toBe('string')
      expect(Array.isArray(field.aggregations)).toBe(true)
      expect(field.aggregations.length).toBeGreaterThan(0)
      expect(Array.isArray(field.chartTypes)).toBe(true)
      expect(field.chartTypes.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — getCatalogForUser
// ---------------------------------------------------------------------------

describe('getCatalogForUser', () => {
  it('deve retornar apenas os campos que correspondem às permissões do usuário', () => {
    const result = getCatalogForUser(['bid-cambio:read'])
    expect(result.length).toBeGreaterThan(0)
    for (const field of result) {
      expect(field.permission).toBe('bid-cambio:read')
    }
  })

  it('deve retornar array vazio para usuário sem permissões', () => {
    const result = getCatalogForUser([])
    expect(result).toEqual([])
  })

  it('deve retornar array vazio para permissão inexistente', () => {
    const result = getCatalogForUser(['produto-inexistente:read'])
    expect(result).toEqual([])
  })

  it('deve retornar todos os campos quando o usuário tem todas as permissões', () => {
    const allPermissions = [...new Set(DATA_CATALOG.map(f => f.permission))]
    const result = getCatalogForUser(allPermissions)
    expect(result.length).toBe(DATA_CATALOG.length)
  })

  it('deve retornar campos de múltiplos produtos quando o usuário tem permissão em ambos', () => {
    const result = getCatalogForUser(['bid-cambio:read', 'bid-frete:read'])
    const products = new Set(result.map(f => f.productId))
    expect(products.has('bid-cambio')).toBe(true)
    expect(products.has('bid-frete')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// Suite 3 — getCatalogByProduct
// ---------------------------------------------------------------------------

describe('getCatalogByProduct', () => {
  it('deve filtrar corretamente por productId "bid-cambio"', () => {
    const result = getCatalogByProduct('bid-cambio')
    expect(result.length).toBeGreaterThan(0)
    for (const field of result) {
      expect(field.productId).toBe('bid-cambio')
    }
  })

  it('deve filtrar corretamente por productId "bid-frete"', () => {
    const result = getCatalogByProduct('bid-frete')
    expect(result.length).toBeGreaterThan(0)
    for (const field of result) {
      expect(field.productId).toBe('bid-frete')
    }
  })

  it('deve retornar array vazio para produto desconhecido', () => {
    const result = getCatalogByProduct('produto-que-nao-existe')
    expect(result).toEqual([])
  })

  it('resultado de bid-cambio e bid-frete não deve se sobrepor', () => {
    const cambio = getCatalogByProduct('bid-cambio')
    const frete = getCatalogByProduct('bid-frete')
    const cambioKeys = new Set(cambio.map(f => f.key))
    for (const field of frete) {
      expect(cambioKeys.has(field.key)).toBe(false)
    }
  })
})

// ---------------------------------------------------------------------------
// Suite 4 — resolveCatalogField
// ---------------------------------------------------------------------------

describe('resolveCatalogField', () => {
  it('deve encontrar um campo por chave existente', () => {
    const field = resolveCatalogField('bid-cambio.saving_total')
    expect(field).toBeDefined()
    expect(field?.key).toBe('bid-cambio.saving_total')
    expect(field?.productId).toBe('bid-cambio')
  })

  it('deve retornar undefined para chave desconhecida', () => {
    const field = resolveCatalogField('produto.metrica-inexistente')
    expect(field).toBeUndefined()
  })

  it('deve retornar undefined para string vazia', () => {
    const field = resolveCatalogField('')
    expect(field).toBeUndefined()
  })

  it('deve lidar corretamente com chaves usando notação de ponto', () => {
    // Chaves têm o formato "productId.metricName"
    const field = resolveCatalogField('bid-frete.saving_total')
    expect(field).toBeDefined()
    expect(field?.key).toBe('bid-frete.saving_total')
    expect(field?.productId).toBe('bid-frete')
  })

  it('deve encontrar campo de lpco por chave com ponto', () => {
    const field = resolveCatalogField('lpco.taxa_deferimento')
    expect(field).toBeDefined()
    expect(field?.type).toBe('percentage')
    expect(field?.productPort).toBe(8027)
  })

  it('deve encontrar campo de nf-importacao por chave', () => {
    const field = resolveCatalogField('nf-imp.total_fob')
    expect(field).toBeDefined()
    expect(field?.productId).toBe('nf-importacao')
  })
})
