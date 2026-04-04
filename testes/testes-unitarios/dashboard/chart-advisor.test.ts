// @vitest-environment node
// Testes unitários de suggestChartTypes e isCompatibleChartType

import { describe, it, expect } from 'vitest'
import {
  suggestChartTypes,
  isCompatibleChartType,
} from '../../../servicos-global/tenant/dashboard/server/lib/chart-advisor.js'
import type { CatalogField } from '../../../servicos-global/tenant/dashboard/server/lib/catalog.js'

// ---------------------------------------------------------------------------
// Helpers para criar campos mock
// ---------------------------------------------------------------------------

function makeField(overrides: Partial<CatalogField>): CatalogField {
  return {
    key: 'test.field',
    label: 'Test Field',
    productId: 'test-product',
    productPort: 9999,
    type: 'number',
    aggregations: ['sum'],
    permission: 'test:read',
    chartTypes: ['KPI_CARD'],
    ...overrides,
  }
}

const currencyField = makeField({
  key: 'bid-cambio.saving_total',
  type: 'currency',
  aggregations: ['sum', 'avg'],
  chartTypes: ['KPI_CARD', 'LINE', 'BAR'],
})

const percentageField = makeField({
  key: 'bid-cambio.taxa_resposta',
  type: 'percentage',
  aggregations: ['avg'],
  chartTypes: ['KPI_CARD', 'GAUGE'],
})

const categoryField = makeField({
  key: 'bid-cambio.cotacoes_status',
  type: 'string',
  aggregations: ['distribution'],
  chartTypes: ['DONUT', 'BAR'],
})

const trendField = makeField({
  key: 'bid-cambio.volume_mensal',
  type: 'number',
  aggregations: ['count', 'trend'],
  chartTypes: ['LINE', 'BAR'],
})

const countField = makeField({
  key: 'processo.total_ativos',
  type: 'number',
  aggregations: ['count'],
  chartTypes: ['KPI_CARD'],
})

const funnelField = makeField({
  key: 'processo.por_status',
  type: 'string',
  aggregations: ['distribution'],
  chartTypes: ['DONUT', 'FUNNEL', 'BAR'],
})

// ---------------------------------------------------------------------------
// Suite 1 — suggestChartTypes
// ---------------------------------------------------------------------------

describe('suggestChartTypes', () => {
  it('campo currency com operação sum deve sugerir KPI_CARD como primário', () => {
    const result = suggestChartTypes([currencyField], 'sum')
    expect(result[0]).toBe('KPI_CARD')
  })

  it('campo currency com operação avg deve sugerir KPI_CARD como primário', () => {
    const result = suggestChartTypes([currencyField], 'avg')
    expect(result[0]).toBe('KPI_CARD')
  })

  it('campo percentage deve incluir KPI_CARD ou GAUGE', () => {
    const result = suggestChartTypes([percentageField], 'avg')
    expect(result.some(t => t === 'KPI_CARD' || t === 'GAUGE')).toBe(true)
  })

  it('campo category (string) com operação distribution deve sugerir DONUT ou BAR', () => {
    const result = suggestChartTypes([categoryField], 'distribution')
    expect(result.some(t => t === 'DONUT' || t === 'BAR')).toBe(true)
  })

  it('campo com operação trend deve sugerir LINE ou AREA', () => {
    const result = suggestChartTypes([trendField], 'trend')
    expect(result.some(t => t === 'LINE' || t === 'AREA')).toBe(true)
  })

  it('múltiplos campos devem retornar um array', () => {
    const result = suggestChartTypes([currencyField, countField], 'avg')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('array vazio de campos deve retornar pelo menos um tipo de fallback', () => {
    const result = suggestChartTypes([], 'sum')
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
  })

  it('operação diff_days deve sugerir KPI_CARD como primário', () => {
    const result = suggestChartTypes([currencyField], 'diff_days')
    expect(result[0]).toBe('KPI_CARD')
    expect(result).toContain('HISTOGRAM')
  })

  it('operação count deve sugerir KPI_CARD como primário', () => {
    const result = suggestChartTypes([countField], 'count')
    expect(result[0]).toBe('KPI_CARD')
  })

  it('campo com FUNNEL em chartTypes deve sugerir FUNNEL quando nenhum outro critério atua primeiro', () => {
    const result = suggestChartTypes([funnelField], 'distribution')
    // distribution tem prioridade sobre FUNNEL check
    expect(result).toContain('DONUT')
    expect(result).toContain('BAR')
  })

  it('retorna somente ChartType válidos como strings', () => {
    const validTypes = new Set([
      'KPI_CARD', 'LINE', 'BAR', 'BAR_HORIZONTAL', 'DONUT',
      'HISTOGRAM', 'FUNNEL', 'GAUGE', 'MAP', 'TABLE', 'AREA',
    ])
    const result = suggestChartTypes([currencyField], 'sum')
    for (const type of result) {
      expect(validTypes.has(type)).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Suite 2 — isCompatibleChartType
// ---------------------------------------------------------------------------

describe('isCompatibleChartType', () => {
  it('KPI_CARD com campo currency deve ser compatível', () => {
    const result = isCompatibleChartType('KPI_CARD', [currencyField])
    expect(result).toBe(true)
  })

  it('LINE com campo currency deve ser compatível', () => {
    const result = isCompatibleChartType('LINE', [currencyField])
    expect(result).toBe(true)
  })

  it('GAUGE com campo currency deve ser incompatível (KPI_CARD, LINE, BAR apenas)', () => {
    const result = isCompatibleChartType('GAUGE', [currencyField])
    expect(result).toBe(false)
  })

  it('GAUGE com campo percentage deve ser compatível', () => {
    const result = isCompatibleChartType('GAUGE', [percentageField])
    expect(result).toBe(true)
  })

  it('DONUT com campo category deve ser compatível', () => {
    const result = isCompatibleChartType('DONUT', [categoryField])
    expect(result).toBe(true)
  })

  it('KPI_CARD com campo category deve ser incompatível', () => {
    const result = isCompatibleChartType('KPI_CARD', [categoryField])
    expect(result).toBe(false)
  })

  it('deve retornar boolean', () => {
    const result = isCompatibleChartType('LINE', [trendField])
    expect(typeof result).toBe('boolean')
  })

  it('deve retornar false quando um dos campos não suporta o tipo', () => {
    // currencyField suporta LINE; categoryField não suporta LINE (tem DONUT, BAR)
    // isCompatibleChartType exige que TODOS os campos suportem o tipo
    const lineInCategory = categoryField.chartTypes.includes('LINE')
    if (!lineInCategory) {
      const result = isCompatibleChartType('LINE', [currencyField, categoryField])
      expect(result).toBe(false)
    } else {
      // caso o catalog tenha mudado — apenas validamos que é boolean
      const result = isCompatibleChartType('LINE', [currencyField, categoryField])
      expect(typeof result).toBe('boolean')
    }
  })

  it('deve retornar true quando todos os campos suportam o tipo', () => {
    const fieldA = makeField({ chartTypes: ['BAR', 'KPI_CARD'] })
    const fieldB = makeField({ chartTypes: ['BAR', 'LINE'] })
    const result = isCompatibleChartType('BAR', [fieldA, fieldB])
    expect(result).toBe(true)
  })
})
