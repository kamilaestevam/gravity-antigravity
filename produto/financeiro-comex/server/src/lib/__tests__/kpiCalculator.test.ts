import { describe, it, expect } from 'vitest'
import { calcularKPIs } from '../kpiCalculator.js'

describe('calcularKPIs', () => {
  it('calcula saldo = custos - numerario', () => {
    const lancamentos = [
      { valor_brl: 50000, moeda: 'BRL', valor: 50000, status_pagamento: 'PENDENTE' as const },
    ]
    const numerarios = [{ valor_total: 15492.24 }]
    const kpis = calcularKPIs(lancamentos, numerarios)
    expect(kpis.saldo).toBeCloseTo(-34507.76, 1)
  })

  it('saldo negativo = empresa ainda deve (estado normal, custos > numerario)', () => {
    // Custos 15000 > Numerario 10000 → saldo = 10000 - 15000 = -5000
    const lancamentos = [
      { valor_brl: 15000, moeda: 'BRL', valor: 15000, status_pagamento: 'PENDENTE' as const },
    ]
    const numerarios = [{ valor_total: 10000 }]
    const kpis = calcularKPIs(lancamentos, numerarios)
    expect(kpis.saldo).toBeLessThan(0)
  })

  it('soma total_brl corretamente', () => {
    const lancamentos = [
      { valor_brl: 1000, moeda: 'BRL', valor: 1000, status_pagamento: 'PAGO' as const },
      { valor_brl: 2000, moeda: 'USD', valor: 352.11, status_pagamento: 'PENDENTE' as const },
    ]
    const kpis = calcularKPIs(lancamentos, [])
    expect(kpis.total_brl).toBe(3000)
  })

  it('separa USD do total_usd', () => {
    const lancamentos = [
      { valor_brl: 569.23, moeda: 'USD', valor: 100, status_pagamento: 'PENDENTE' as const },
    ]
    const kpis = calcularKPIs(lancamentos, [])
    expect(kpis.total_usd).toBe(100)
  })

  it('separa EUR do total_eur', () => {
    const lancamentos = [
      { valor_brl: 6186.4, moeda: 'EUR', valor: 1000, status_pagamento: 'PENDENTE' as const },
    ]
    const kpis = calcularKPIs(lancamentos, [])
    expect(kpis.total_eur).toBe(1000)
  })

  it('soma pagos corretamente', () => {
    const lancamentos = [
      { valor_brl: 500, moeda: 'BRL', valor: 500, status_pagamento: 'PAGO' as const },
      { valor_brl: 300, moeda: 'BRL', valor: 300, status_pagamento: 'PAGO' as const },
      { valor_brl: 200, moeda: 'BRL', valor: 200, status_pagamento: 'PENDENTE' as const },
    ]
    const kpis = calcularKPIs(lancamentos, [])
    expect(kpis.pagos).toBe(800)
    expect(kpis.pendente).toBe(200)
  })

  it('soma agendados corretamente', () => {
    const lancamentos = [
      { valor_brl: 1000, moeda: 'BRL', valor: 1000, status_pagamento: 'AGENDADO' as const },
    ]
    const kpis = calcularKPIs(lancamentos, [])
    expect(kpis.agendados).toBe(1000)
  })

  it('adiantado = soma de todos os numerarios', () => {
    const numerarios = [
      { valor_total: 5000 },
      { valor_total: 10492.24 },
    ]
    const kpis = calcularKPIs([], numerarios)
    expect(kpis.adiantado).toBeCloseTo(15492.24, 2)
  })

  it('retorna zeros para listas vazias', () => {
    const kpis = calcularKPIs([], [])
    expect(kpis.total_brl).toBe(0)
    expect(kpis.saldo).toBe(0)
    expect(kpis.adiantado).toBe(0)
  })

  it('CA-006: Saldo = R$ 50000 custos - R$ 15492.24 numerario = -34507.76', () => {
    const lancamentos = [
      { valor_brl: 50000, moeda: 'BRL', valor: 50000, status_pagamento: 'PENDENTE' as const },
    ]
    const numerarios = [{ valor_total: 15492.24 }]
    const kpis = calcularKPIs(lancamentos, numerarios)
    expect(kpis.saldo).toBeCloseTo(-34507.76, 1)
  })
})
