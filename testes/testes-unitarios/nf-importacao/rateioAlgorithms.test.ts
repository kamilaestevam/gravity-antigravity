import { describe, it, expect } from 'vitest'
import {
  calcularRateio,
  type ItemRateio,
  type MetodoRateio,
} from '../../../produto/nf-importacao/server/src/lib/rateioAlgorithms'

// --- Helpers ---

function makeItem(overrides: Partial<ItemRateio> & { id: string }): ItemRateio {
  return {
    peso_liquido: 0,
    peso_bruto: 0,
    valor_cif: 0,
    valor_fob: 0,
    quantidade: 0,
    valor_ii: 0,
    ...overrides,
  }
}

function somaRateada(result: ReturnType<typeof calcularRateio>): number {
  return result.itens.reduce((s, i) => s + i.valor_rateado, 0)
}

function roundTo2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

// ============================================
// PESO_LIQUIDO
// ============================================
describe('PESO_LIQUIDO', () => {
  it('distribui proporcionalmente ao peso liquido', () => {
    const itens = [
      makeItem({ id: 'A', peso_liquido: 30 }),
      makeItem({ id: 'B', peso_liquido: 70 }),
    ]
    const result = calcularRateio('PESO_LIQUIDO', 1000, itens)
    expect(result.itens[0].valor_rateado).toBe(300)
    expect(result.itens[1].valor_rateado).toBe(700)
    expect(result.warnings).toHaveLength(0)
  })

  it('fallback para igualitario quando peso_liquido total e zero', () => {
    const itens = [
      makeItem({ id: 'A', peso_liquido: 0 }),
      makeItem({ id: 'B', peso_liquido: 0 }),
    ]
    const result = calcularRateio('PESO_LIQUIDO', 100, itens)
    expect(result.itens[0].valor_rateado).toBe(50)
    expect(result.itens[1].valor_rateado).toBe(50)
    expect(result.warnings.length).toBeGreaterThan(0)
    expect(result.warnings[0]).toContain('fallback')
  })

  it('item unico recebe 100%', () => {
    const itens = [makeItem({ id: 'A', peso_liquido: 15 })]
    const result = calcularRateio('PESO_LIQUIDO', 500, itens)
    expect(result.itens[0].valor_rateado).toBe(500)
    expect(result.itens[0].percentual).toBe(100)
  })
})

// ============================================
// PESO_BRUTO
// ============================================
describe('PESO_BRUTO', () => {
  it('distribui proporcionalmente ao peso bruto', () => {
    const itens = [
      makeItem({ id: 'A', peso_bruto: 40 }),
      makeItem({ id: 'B', peso_bruto: 60 }),
    ]
    const result = calcularRateio('PESO_BRUTO', 200, itens)
    expect(result.itens[0].valor_rateado).toBe(80)
    expect(result.itens[1].valor_rateado).toBe(120)
  })

  it('fallback para igualitario quando peso_bruto total e zero', () => {
    const itens = [
      makeItem({ id: 'A', peso_bruto: 0 }),
      makeItem({ id: 'B', peso_bruto: 0 }),
    ]
    const result = calcularRateio('PESO_BRUTO', 100, itens)
    expect(result.warnings[0]).toContain('fallback')
  })
})

// ============================================
// VALOR_CIF
// ============================================
describe('VALOR_CIF', () => {
  it('distribui proporcionalmente ao valor CIF', () => {
    const itens = [
      makeItem({ id: 'A', valor_cif: 1000 }),
      makeItem({ id: 'B', valor_cif: 3000 }),
    ]
    const result = calcularRateio('VALOR_CIF', 400, itens)
    expect(result.itens[0].valor_rateado).toBe(100)
    expect(result.itens[1].valor_rateado).toBe(300)
  })

  it('distribui entre 3+ itens com soma correta', () => {
    const itens = [
      makeItem({ id: 'A', valor_cif: 100 }),
      makeItem({ id: 'B', valor_cif: 200 }),
      makeItem({ id: 'C', valor_cif: 300 }),
    ]
    const result = calcularRateio('VALOR_CIF', 600, itens)
    expect(roundTo2(somaRateada(result))).toBe(600)
  })

  it('fallback quando CIF total e zero', () => {
    const itens = [
      makeItem({ id: 'A', valor_cif: 0 }),
      makeItem({ id: 'B', valor_cif: 0 }),
    ]
    const result = calcularRateio('VALOR_CIF', 100, itens)
    expect(result.warnings[0]).toContain('fallback')
  })
})

// ============================================
// VALOR_FOB
// ============================================
describe('VALOR_FOB', () => {
  it('distribui proporcionalmente ao valor FOB', () => {
    const itens = [
      makeItem({ id: 'A', valor_fob: 500 }),
      makeItem({ id: 'B', valor_fob: 500 }),
    ]
    const result = calcularRateio('VALOR_FOB', 100, itens)
    expect(result.itens[0].valor_rateado).toBe(50)
    expect(result.itens[1].valor_rateado).toBe(50)
  })
})

// ============================================
// QUANTIDADE
// ============================================
describe('QUANTIDADE', () => {
  it('distribui proporcionalmente a quantidade', () => {
    const itens = [
      makeItem({ id: 'A', quantidade: 10 }),
      makeItem({ id: 'B', quantidade: 20 }),
      makeItem({ id: 'C', quantidade: 70 }),
    ]
    const result = calcularRateio('QUANTIDADE', 1000, itens)
    expect(result.itens[0].valor_rateado).toBe(100)
    expect(result.itens[2].valor_rateado).toBeCloseTo(700, 1)
  })

  it('fallback quando quantidade total e zero', () => {
    const itens = [
      makeItem({ id: 'A', quantidade: 0 }),
      makeItem({ id: 'B', quantidade: 0 }),
    ]
    const result = calcularRateio('QUANTIDADE', 100, itens)
    expect(result.warnings[0]).toContain('fallback')
  })
})

// ============================================
// VALOR_II
// ============================================
describe('VALOR_II', () => {
  it('distribui proporcionalmente ao valor II', () => {
    const itens = [
      makeItem({ id: 'A', valor_ii: 200 }),
      makeItem({ id: 'B', valor_ii: 800 }),
    ]
    const result = calcularRateio('VALOR_II', 500, itens)
    expect(result.itens[0].valor_rateado).toBe(100)
    expect(result.itens[1].valor_rateado).toBe(400)
  })

  it('fallback quando valor_ii total e zero', () => {
    const itens = [
      makeItem({ id: 'A', valor_ii: 0 }),
      makeItem({ id: 'B', valor_ii: 0 }),
    ]
    const result = calcularRateio('VALOR_II', 100, itens)
    expect(result.warnings[0]).toContain('fallback')
  })
})

// ============================================
// IGUALITARIO
// ============================================
describe('IGUALITARIO', () => {
  it('divide igualmente entre 2 itens', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' })]
    const result = calcularRateio('IGUALITARIO', 100, itens)
    expect(result.itens[0].valor_rateado).toBe(50)
    expect(result.itens[1].valor_rateado).toBe(50)
  })

  it('lida com resto de centavo em 3 itens', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' }), makeItem({ id: 'C' })]
    const result = calcularRateio('IGUALITARIO', 100, itens)
    // 100 / 3 = 33.33 cada, ultimo absorve resto
    const total = roundTo2(somaRateada(result))
    expect(total).toBe(100)
  })

  it('lida com valor impar entre 2 itens', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' })]
    const result = calcularRateio('IGUALITARIO', 99.99, itens)
    const total = roundTo2(somaRateada(result))
    expect(total).toBe(99.99)
  })

  it('1 item recebe tudo', () => {
    const itens = [makeItem({ id: 'A' })]
    const result = calcularRateio('IGUALITARIO', 250, itens)
    expect(result.itens[0].valor_rateado).toBe(250)
  })
})

// ============================================
// MANUAL
// ============================================
describe('MANUAL', () => {
  it('aceita valores manuais corretos', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' })]
    const manual = new Map([['A', 60], ['B', 40]])
    const result = calcularRateio('MANUAL', 100, itens, manual)
    expect(result.itens[0].valor_rateado).toBe(60)
    expect(result.itens[1].valor_rateado).toBe(40)
    expect(result.warnings).toHaveLength(0)
  })

  it('gera warning quando soma manual difere do total', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' })]
    const manual = new Map([['A', 60], ['B', 60]])
    const result = calcularRateio('MANUAL', 100, itens, manual)
    expect(result.warnings.some(w => w.includes('difere'))).toBe(true)
  })

  it('ignora valor negativo com warning', () => {
    const itens = [makeItem({ id: 'A' })]
    const manual = new Map([['A', -50]])
    const result = calcularRateio('MANUAL', 100, itens, manual)
    expect(result.itens[0].valor_rateado).toBe(0)
    expect(result.warnings.some(w => w.includes('negativo'))).toBe(true)
  })

  it('item sem valor manual recebe zero', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' })]
    const manual = new Map([['A', 100]])
    const result = calcularRateio('MANUAL', 100, itens, manual)
    expect(result.itens[1].valor_rateado).toBe(0)
  })
})

// ============================================
// CUSTOMIZADO
// ============================================
describe('CUSTOMIZADO', () => {
  it('calcula com pesos customizados ponderados', () => {
    const itens = [
      makeItem({
        id: 'A',
        peso_liquido: 100,
        valor_cif: 200,
        pesos_customizados: { peso_liquido: 0.5, valor_cif: 0.5 },
      }),
      makeItem({
        id: 'B',
        peso_liquido: 100,
        valor_cif: 400,
        pesos_customizados: { peso_liquido: 0.5, valor_cif: 0.5 },
      }),
    ]
    // A: 100*0.5 + 200*0.5 = 150
    // B: 100*0.5 + 400*0.5 = 250
    // total = 400
    const result = calcularRateio('CUSTOMIZADO', 400, itens)
    expect(result.itens[0].valor_rateado).toBe(150)
    expect(result.itens[1].valor_rateado).toBe(250)
  })

  it('ignora campo nao permitido com warning', () => {
    const itens = [
      makeItem({
        id: 'A',
        peso_liquido: 100,
        pesos_customizados: { peso_liquido: 1, campo_invalido: 1 },
      }),
    ]
    const result = calcularRateio('CUSTOMIZADO', 100, itens)
    expect(result.warnings.some(w => w.includes('nao permitido'))).toBe(true)
    expect(result.itens[0].valor_rateado).toBe(100)
  })

  it('fallback para igualitario quando ponderacao e zero', () => {
    const itens = [
      makeItem({ id: 'A', pesos_customizados: {} }),
      makeItem({ id: 'B', pesos_customizados: {} }),
    ]
    const result = calcularRateio('CUSTOMIZADO', 100, itens)
    expect(result.warnings.some(w => w.includes('fallback'))).toBe(true)
    expect(result.itens[0].valor_rateado).toBe(50)
  })

  it('pesos negativos sao tratados como zero', () => {
    const itens = [
      makeItem({
        id: 'A',
        peso_liquido: 100,
        pesos_customizados: { peso_liquido: -1 },
      }),
      makeItem({
        id: 'B',
        peso_liquido: 100,
        pesos_customizados: { peso_liquido: 1 },
      }),
    ]
    const result = calcularRateio('CUSTOMIZADO', 100, itens)
    // A peso negativo -> 0, B = 100*1 = 100, A absorve restante
    expect(result.itens[1].valor_rateado).toBeGreaterThan(0)
  })
})

// ============================================
// Centavo restante / Rounding
// ============================================
describe('Centavo restante e arredondamento', () => {
  it('soma de rateios equals total com tolerancia +-0.01', () => {
    const itens = [
      makeItem({ id: 'A', valor_cif: 33.33 }),
      makeItem({ id: 'B', valor_cif: 33.33 }),
      makeItem({ id: 'C', valor_cif: 33.34 }),
    ]
    const result = calcularRateio('VALOR_CIF', 100, itens)
    const total = somaRateada(result)
    expect(Math.abs(total - 100)).toBeLessThanOrEqual(0.01)
  })

  it('ultimo item absorve diferenca de arredondamento', () => {
    const itens = [
      makeItem({ id: 'A', peso_liquido: 1 }),
      makeItem({ id: 'B', peso_liquido: 1 }),
      makeItem({ id: 'C', peso_liquido: 1 }),
    ]
    // 100 / 3 = 33.33 por item; 33.33 * 2 = 66.66; ultimo = 100 - 66.66 = 33.34
    const result = calcularRateio('PESO_LIQUIDO', 100, itens)
    const total = roundTo2(somaRateada(result))
    expect(total).toBe(100)
  })

  it('nenhum valor negativo nos resultados', () => {
    const itens = [
      makeItem({ id: 'A', valor_cif: 0.01 }),
      makeItem({ id: 'B', valor_cif: 99999.99 }),
    ]
    const result = calcularRateio('VALOR_CIF', 100, itens)
    for (const item of result.itens) {
      expect(item.valor_rateado).toBeGreaterThanOrEqual(0)
    }
  })

  it('valor total zero distribui zeros', () => {
    const itens = [
      makeItem({ id: 'A', valor_cif: 50 }),
      makeItem({ id: 'B', valor_cif: 50 }),
    ]
    const result = calcularRateio('VALOR_CIF', 0, itens)
    expect(result.itens[0].valor_rateado).toBe(0)
    expect(result.itens[1].valor_rateado).toBe(0)
  })
})

// ============================================
// Large dataset
// ============================================
describe('Large dataset', () => {
  it('100 itens com rateio CIF soma corretamente', () => {
    const itens = Array.from({ length: 100 }, (_, i) =>
      makeItem({ id: `ITEM_${i}`, valor_cif: (i + 1) * 10 })
    )
    const result = calcularRateio('VALOR_CIF', 10000, itens)
    expect(result.itens).toHaveLength(100)
    const total = roundTo2(somaRateada(result))
    expect(Math.abs(total - 10000)).toBeLessThanOrEqual(0.01)
  })

  it('100 itens igualitario soma corretamente', () => {
    const itens = Array.from({ length: 100 }, (_, i) =>
      makeItem({ id: `ITEM_${i}` })
    )
    const result = calcularRateio('IGUALITARIO', 333.33, itens)
    const total = roundTo2(somaRateada(result))
    expect(Math.abs(total - 333.33)).toBeLessThanOrEqual(0.01)
  })
})

// ============================================
// Edge cases
// ============================================
describe('Edge cases', () => {
  it('retorna vazio para lista de itens vazia', () => {
    const result = calcularRateio('VALOR_CIF', 100, [])
    expect(result.itens).toHaveLength(0)
    expect(result.warnings[0]).toContain('Nenhum item')
  })

  it('valor total negativo retorna warning', () => {
    const itens = [makeItem({ id: 'A', valor_cif: 100 })]
    const result = calcularRateio('VALOR_CIF', -50, itens)
    expect(result.itens).toHaveLength(0)
    expect(result.warnings[0]).toContain('negativo')
  })

  it('valor muito pequeno (0.01) distribui corretamente', () => {
    const itens = [
      makeItem({ id: 'A', valor_cif: 50 }),
      makeItem({ id: 'B', valor_cif: 50 }),
    ]
    const result = calcularRateio('VALOR_CIF', 0.01, itens)
    const total = roundTo2(somaRateada(result))
    expect(total).toBe(0.01)
  })

  it('metodo desconhecido faz fallback para igualitario', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' })]
    const result = calcularRateio('INEXISTENTE' as MetodoRateio, 100, itens)
    expect(result.warnings.some(w => w.includes('desconhecido'))).toBe(true)
    expect(result.itens[0].valor_rateado).toBe(50)
  })

  it('MANUAL sem mapa usa Map vazio', () => {
    const itens = [makeItem({ id: 'A' })]
    const result = calcularRateio('MANUAL', 100, itens)
    expect(result.itens[0].valor_rateado).toBe(0)
  })

  it('valor 0 expense distribui zeros em igualitario', () => {
    const itens = [makeItem({ id: 'A' }), makeItem({ id: 'B' })]
    const result = calcularRateio('IGUALITARIO', 0, itens)
    expect(result.itens[0].valor_rateado).toBe(0)
    expect(result.itens[1].valor_rateado).toBe(0)
  })
})
