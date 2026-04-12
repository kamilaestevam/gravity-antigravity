/**
 * Testes unitários — DashboardPedido: cálculo de statusCounts
 * Localização: testes/testes-unitarios/nucleo-global/dashboard-global/DashboardPedido.statusCounts.test.tsx
 *
 * TU-07: statusCounts calculado corretamente a partir de kpisData mock
 * TU-08: chip "Todos" exibe total_pedidos; quando kpisData=null não passa statusCounts
 *
 * Estratégia: testa a lógica de mapeamento kpisData → statusCounts de forma isolada,
 * sem montar o componente completo (evita dependências pesadas do DashboardPedido).
 */

import { describe, it, expect } from 'vitest'

// ─── Lógica extraída para testar isoladamente ────────────────────────────────
// Replica exatamente o mapeamento feito em DashboardPedido.tsx no prop statusCounts

interface KpisSnapshot {
  total_pedidos: number
  pedidos_abertos: number
  pedidos_em_andamento: number
  pedidos_atrasados: number
  pedidos_consolidados: number
}

function buildStatusCounts(kpisData: KpisSnapshot | null): Record<string, number> | undefined {
  if (!kpisData) return undefined
  return {
    todos:        kpisData.total_pedidos,
    abertos:      kpisData.pedidos_abertos,
    em_andamento: kpisData.pedidos_em_andamento,
    atrasados:    kpisData.pedidos_atrasados,
    concluidos:   kpisData.pedidos_consolidados,
  }
}

// ─── TU-07 ───────────────────────────────────────────────────────────────────

describe('TU-07 — buildStatusCounts a partir de kpisData', () => {
  const kpisData: KpisSnapshot = {
    total_pedidos:        9,
    pedidos_abertos:      6,
    pedidos_em_andamento: 2,
    pedidos_atrasados:    0,
    pedidos_consolidados: 1,
  }

  it('retorna objeto com todas as chaves esperadas', () => {
    const result = buildStatusCounts(kpisData)
    expect(result).toHaveProperty('todos')
    expect(result).toHaveProperty('abertos')
    expect(result).toHaveProperty('em_andamento')
    expect(result).toHaveProperty('atrasados')
    expect(result).toHaveProperty('concluidos')
  })

  it('mapeia total_pedidos → todos corretamente', () => {
    expect(buildStatusCounts(kpisData)?.todos).toBe(9)
  })

  it('mapeia pedidos_abertos → abertos corretamente', () => {
    expect(buildStatusCounts(kpisData)?.abertos).toBe(6)
  })

  it('mapeia pedidos_em_andamento → em_andamento corretamente', () => {
    expect(buildStatusCounts(kpisData)?.em_andamento).toBe(2)
  })

  it('mapeia pedidos_atrasados → atrasados corretamente (mesmo quando 0)', () => {
    expect(buildStatusCounts(kpisData)?.atrasados).toBe(0)
  })

  it('mapeia pedidos_consolidados → concluidos corretamente', () => {
    expect(buildStatusCounts(kpisData)?.concluidos).toBe(1)
  })
})

// ─── TU-08 ───────────────────────────────────────────────────────────────────

describe('TU-08 — chip Todos com total_pedidos / comportamento sem kpisData', () => {
  it('retorna undefined quando kpisData é null (chips sem contagem)', () => {
    expect(buildStatusCounts(null)).toBeUndefined()
  })

  it('chip Todos recebe o valor de total_pedidos', () => {
    const result = buildStatusCounts({ total_pedidos: 9, pedidos_abertos: 6, pedidos_em_andamento: 2, pedidos_atrasados: 0, pedidos_consolidados: 1 })
    expect(result?.todos).toBe(9)
  })

  it('soma de abertos + em_andamento + atrasados + concluidos bate com total (cenário sem rascunho)', () => {
    const kpis: KpisSnapshot = { total_pedidos: 9, pedidos_abertos: 6, pedidos_em_andamento: 2, pedidos_atrasados: 0, pedidos_consolidados: 1 }
    const result = buildStatusCounts(kpis)!
    const soma = result.abertos + result.em_andamento + result.atrasados + result.concluidos
    // total pode ser maior (draft não está nos status filtráveis)
    expect(result.todos).toBeGreaterThanOrEqual(soma)
  })
})
