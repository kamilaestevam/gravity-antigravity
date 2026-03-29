/**
 * Testes unitarios — BID Frete / config.ts
 * Testa PRODUCT_CONFIG: id, port, services, navigation, features
 */

import { describe, it, expect } from 'vitest'

import { PRODUCT_CONFIG } from '../../../produto/bid-frete/client/src/shared/config'

describe('PRODUCT_CONFIG', () => {
  describe('identidade do produto', () => {
    it('deve ter id "bid-frete"', () => {
      expect(PRODUCT_CONFIG.id).toBe('bid-frete')
    })

    it('deve ter productId "bid-frete"', () => {
      expect(PRODUCT_CONFIG.productId).toBe('bid-frete')
    })

    it('deve ter name "BID Frete"', () => {
      expect(PRODUCT_CONFIG.name).toBe('BID Frete')
    })

    it('deve ter port 8023', () => {
      expect(PRODUCT_CONFIG.port).toBe(8023)
    })
  })

  describe('tenantServices', () => {
    it('deve ser um array nao vazio', () => {
      expect(Array.isArray(PRODUCT_CONFIG.tenantServices)).toBe(true)
      expect(PRODUCT_CONFIG.tenantServices.length).toBeGreaterThan(0)
    })

    it('deve conter os servicos core do tenant', () => {
      const expected = [
        'atividades',
        'dashboard',
        'relatorios',
        'historico',
        'notificacoes',
        'gabi',
        'email',
        'whatsapp',
        'agendamento',
      ]
      for (const svc of expected) {
        expect(PRODUCT_CONFIG.tenantServices).toContain(svc)
      }
    })

    it('deve ter exatamente 9 tenant services', () => {
      expect(PRODUCT_CONFIG.tenantServices).toHaveLength(9)
    })
  })

  describe('productServices', () => {
    it('deve ser um array nao vazio', () => {
      expect(Array.isArray(PRODUCT_CONFIG.productServices)).toBe(true)
      expect(PRODUCT_CONFIG.productServices.length).toBeGreaterThan(0)
    })

    it('deve conter os engines esperados', () => {
      const expected = [
        'bid-engine',
        'comparativo-engine',
        'rating-engine',
        'savings-engine',
        'connectors',
      ]
      for (const svc of expected) {
        expect(PRODUCT_CONFIG.productServices).toContain(svc)
      }
    })

    it('deve ter exatamente 5 product services', () => {
      expect(PRODUCT_CONFIG.productServices).toHaveLength(5)
    })
  })

  describe('navigation', () => {
    it('deve ser um array nao vazio', () => {
      expect(Array.isArray(PRODUCT_CONFIG.navigation)).toBe(true)
      expect(PRODUCT_CONFIG.navigation.length).toBeGreaterThan(0)
    })

    it('deve ter 6 itens de navegacao', () => {
      expect(PRODUCT_CONFIG.navigation).toHaveLength(6)
    })

    it('cada item deve ter id, label, icon e source', () => {
      for (const item of PRODUCT_CONFIG.navigation) {
        expect(typeof item.id).toBe('string')
        expect(item.id.length).toBeGreaterThan(0)
        expect(typeof item.label).toBe('string')
        expect(item.label.length).toBeGreaterThan(0)
        expect(typeof item.icon).toBe('string')
        expect(item.icon.length).toBeGreaterThan(0)
        expect(['product', 'tenant']).toContain(item.source)
      }
    })

    it('deve conter os itens de produto esperados', () => {
      const productItems = PRODUCT_CONFIG.navigation.filter(n => n.source === 'product')
      const productIds = productItems.map(n => n.id)
      expect(productIds).toContain('visao-geral')
      expect(productIds).toContain('cotacoes')
      expect(productIds).toContain('fornecedores')
      expect(productIds).toContain('configuracoes')
    })

    it('deve conter os itens de tenant esperados', () => {
      const tenantItems = PRODUCT_CONFIG.navigation.filter(n => n.source === 'tenant')
      const tenantIds = tenantItems.map(n => n.id)
      expect(tenantIds).toContain('atividades')
      expect(tenantIds).toContain('historico')
    })

    it('itens de produto devem vir antes dos itens de tenant', () => {
      const sources = PRODUCT_CONFIG.navigation.map(n => n.source)
      const lastProduct = sources.lastIndexOf('product')
      const firstTenant = sources.indexOf('tenant')
      expect(lastProduct).toBeLessThan(firstTenant)
    })
  })

  describe('features', () => {
    it('deve ter feature flags definidos', () => {
      expect(PRODUCT_CONFIG.features).toBeDefined()
      expect(typeof PRODUCT_CONFIG.features).toBe('object')
    })

    it('deve ter todas as feature flags esperadas', () => {
      const expectedFlags = [
        'cotacao_aberta',
        'rating_global',
        'monetizacao',
        'portal_publico',
        'importacao_bloco',
        'mapa_rotas',
        'conectores_erp',
      ]
      for (const flag of expectedFlags) {
        expect(flag in PRODUCT_CONFIG.features).toBe(true)
      }
    })

    it('cada feature flag deve ser booleano', () => {
      for (const [, value] of Object.entries(PRODUCT_CONFIG.features)) {
        expect(typeof value).toBe('boolean')
      }
    })

    it('features ativas devem ser true', () => {
      expect(PRODUCT_CONFIG.features.cotacao_aberta).toBe(true)
      expect(PRODUCT_CONFIG.features.rating_global).toBe(true)
      expect(PRODUCT_CONFIG.features.portal_publico).toBe(true)
      expect(PRODUCT_CONFIG.features.importacao_bloco).toBe(true)
      expect(PRODUCT_CONFIG.features.mapa_rotas).toBe(true)
    })

    it('features desativadas devem ser false', () => {
      expect(PRODUCT_CONFIG.features.monetizacao).toBe(false)
      expect(PRODUCT_CONFIG.features.conectores_erp).toBe(false)
    })
  })
})
