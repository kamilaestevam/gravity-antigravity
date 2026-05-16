// TST-UNIT-NUCLEO-LOGO-001 — getProdutoMeta + PRODUTO_META registry
// Valida que todos os 10 produtos/zonas retornam a cor correta do Design System
// e que o fallback para produtos não mapeados retorna Indigo padrão.

/// <reference types="vitest/globals" />
import { getProdutoMeta, PRODUTO_META } from '../../../../nucleo-global/Logo/produtos/src/LogoProdutoGlobal'

describe('getProdutoMeta', () => {
  describe('Tier 1 — Plataforma', () => {
    it('admin retorna Emerald #10b981', () => {
      expect(getProdutoMeta('admin').color).toBe('#10b981')
    })

    it('configurador retorna Sky #7dd3fc', () => {
      expect(getProdutoMeta('configurador').color).toBe('#7dd3fc')
    })
  })

  describe('Tier 2 — Produtos COMEX', () => {
    const expectedColors: Record<string, string> = {
      'simula-custo':    '#34d399',
      'pedido':          '#f59e0b',
      'bid-cambio':      '#06b6d4',
      'bid-frete':       '#60a5fa',
      'lpco':            '#f43f5e',
      'nf-importacao':   '#c084fc',
      'processo':        '#facc15',
      'financeiro-comex': '#f472b6',
    }

    for (const [productId, expectedColor] of Object.entries(expectedColors)) {
      it(`${productId} retorna ${expectedColor}`, () => {
        expect(getProdutoMeta(productId).color).toBe(expectedColor)
      })
    }
  })

  describe('fallback', () => {
    it('produto não mapeado retorna Indigo #818cf8', () => {
      const meta = getProdutoMeta('produto-inexistente')
      expect(meta.color).toBe('#818cf8')
      expect(meta.sublabel).toBe('produto')
    })
  })

  describe('PRODUTO_META completude', () => {
    it('registry contém exatamente 10 entradas', () => {
      expect(Object.keys(PRODUTO_META)).toHaveLength(10)
    })

    it('todas as entradas têm icon, color e sublabel', () => {
      for (const [id, meta] of Object.entries(PRODUTO_META)) {
        expect(meta.icon, `${id} deve ter icon`).toBeDefined()
        expect(meta.color, `${id} deve ter color`).toMatch(/^#[0-9a-f]{6}$/i)
        expect(meta.sublabel, `${id} deve ter sublabel`).toBeTruthy()
      }
    })
  })
})
