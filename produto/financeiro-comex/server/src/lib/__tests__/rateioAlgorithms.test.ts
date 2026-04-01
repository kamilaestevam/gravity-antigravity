/**
 * rateioAlgorithms.test.ts — Testa reutilização das funções de rateio do NF Importação
 * Estes testes validam que o Financeiro Comex usa o mesmo engine sem fork
 */

import { describe, it, expect } from 'vitest'
import { calcularRateio } from '../../../../../../produto/nf-importacao/server/src/lib/rateioAlgorithms.js'
import type { ItemRateio } from '../../../../../../produto/nf-importacao/server/src/lib/rateioAlgorithms.js'

const ITENS_EXEMPLO: ItemRateio[] = [
  { id: 'item-1', peso_liquido: 100, peso_bruto: 110, valor_cif: 5000, valor_fob: 4500, quantidade: 10, valor_ii: 500 },
  { id: 'item-2', peso_liquido: 200, peso_bruto: 220, valor_cif: 3000, valor_fob: 2800, quantidade: 5, valor_ii: 300 },
  { id: 'item-3', peso_liquido: 50, peso_bruto: 55, valor_cif: 2000, valor_fob: 1800, quantidade: 20, valor_ii: 200 },
]

describe('calcularRateio — VALOR_CIF (metodo padrao Financeiro Comex)', () => {
  it('distribui proporcional ao CIF', () => {
    const result = calcularRateio('VALOR_CIF', 1000, ITENS_EXEMPLO)
    expect(result.warnings).toHaveLength(0)
    const total = result.itens.reduce((s, i) => s + i.valor_rateado, 0)
    expect(total).toBeCloseTo(1000, 1)
  })

  it('ultimo item absorve centavo restante', () => {
    const result = calcularRateio('VALOR_CIF', 1000, ITENS_EXEMPLO)
    const total = result.itens.reduce((s, i) => s + i.valor_rateado, 0)
    expect(total).toBe(1000)
  })

  it('retorna percentual para cada item', () => {
    const result = calcularRateio('VALOR_CIF', 1000, ITENS_EXEMPLO)
    result.itens.forEach(i => {
      expect(i.percentual).toBeGreaterThan(0)
      expect(i.percentual).toBeLessThanOrEqual(100)
    })
  })
})

describe('calcularRateio — IGUALITARIO', () => {
  it('divide igualmente entre 3 itens', () => {
    const result = calcularRateio('IGUALITARIO', 900, ITENS_EXEMPLO)
    expect(result.itens[0].valor_rateado).toBe(300)
    expect(result.itens[1].valor_rateado).toBe(300)
    expect(result.itens[2].valor_rateado).toBe(300)
  })

  it('centavo restante vai ao ultimo item', () => {
    const result = calcularRateio('IGUALITARIO', 100, ITENS_EXEMPLO)
    const total = result.itens.reduce((s, i) => s + i.valor_rateado, 0)
    expect(total).toBe(100)
  })
})

describe('calcularRateio — fallback divisor zero', () => {
  it('fallback para igualitario quando soma do campo e zero', () => {
    const itensZero: ItemRateio[] = [
      { id: 'x1', peso_liquido: 0, peso_bruto: 0, valor_cif: 0, valor_fob: 0, quantidade: 0, valor_ii: 0 },
      { id: 'x2', peso_liquido: 0, peso_bruto: 0, valor_cif: 0, valor_fob: 0, quantidade: 0, valor_ii: 0 },
    ]
    const result = calcularRateio('VALOR_CIF', 100, itensZero)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain('fallback')
  })
})

describe('calcularRateio — validacoes', () => {
  it('retorna vazio para valor negativo', () => {
    const result = calcularRateio('VALOR_CIF', -100, ITENS_EXEMPLO)
    expect(result.itens).toHaveLength(0)
    expect(result.warnings.length).toBeGreaterThan(0)
  })

  it('retorna vazio para lista vazia', () => {
    const result = calcularRateio('VALOR_CIF', 1000, [])
    expect(result.itens).toHaveLength(0)
  })

  it('PESO_LIQUIDO distribui por peso', () => {
    const result = calcularRateio('PESO_LIQUIDO', 350, ITENS_EXEMPLO)
    const total = result.itens.reduce((s, i) => s + i.valor_rateado, 0)
    expect(total).toBe(350)
    // item-2 tem mais peso, deve ter maior valor
    expect(result.itens[1].valor_rateado).toBeGreaterThan(result.itens[0].valor_rateado)
  })
})
