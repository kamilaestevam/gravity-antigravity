/**
 * gabiInsightsService.test.ts — Testes unitários
 *
 * Cobre:
 *   - generateInsights: ranking por role, mínimo 2 insights, fallback
 *   - behaviorScores: multiplicadores aplicados corretamente
 *   - normalizeRole: mapeamento de strings para UserRole
 *   - buildCandidates: cada tipo de insight gerado no contexto correto
 */

import { describe, it, expect } from 'vitest'
import { generateInsights, normalizeRole } from './gabiInsightsService.js'
import type { KpiSnapshot } from './gabiInsightsService.js'

// ── Fixtures ──────────────────────────────────────────────────────────────────

function kpiBase(overrides: Partial<KpiSnapshot> = {}): KpiSnapshot {
  return {
    total_pedidos:          10,
    pedidos_abertos:         4,
    pedidos_em_andamento:    2,
    pedidos_atrasados:       0,
    pedidos_sem_exportador:  0,
    pedidos_cancelados:      0,
    pedidos_consolidados:    2,
    pedidos_importacao:      6,
    pedidos_exportacao:      4,
    qtd_saldo_total:      5000,
    qtd_pronta_total:        0,
    qtd_transferida_total: 1000,
    qtd_inicial_total:     6000,
    valor_total:        500_000,
    valor_itens_total:  450_000,
    ticket_medio:        50_000,
    taxa_atraso:              0,
    taxa_transferencia:      10,
    ...overrides,
  }
}

// ── normalizeRole ─────────────────────────────────────────────────────────────

describe('normalizeRole', () => {
  it('retorna operador para strings contendo "operador"', () => {
    expect(normalizeRole('operador')).toBe('operador')
    expect(normalizeRole('OPERADOR')).toBe('operador')
    expect(normalizeRole('operator')).toBe('operador')
  })

  it('retorna gerente para strings contendo "gerente" ou "manager"', () => {
    expect(normalizeRole('gerente')).toBe('gerente')
    expect(normalizeRole('GERENTE')).toBe('gerente')
    expect(normalizeRole('manager')).toBe('gerente')
  })

  it('retorna diretor para strings contendo "diretor" ou "director"', () => {
    expect(normalizeRole('diretor')).toBe('diretor')
    expect(normalizeRole('director')).toBe('diretor')
  })

  it('retorna admin para strings contendo "admin"', () => {
    expect(normalizeRole('admin')).toBe('admin')
    expect(normalizeRole('SUPER_ADMIN')).toBe('admin')
  })

  it('retorna default para string vazia ou undefined', () => {
    expect(normalizeRole(undefined)).toBe('default')
    expect(normalizeRole('')).toBe('default')
    expect(normalizeRole('desconhecido')).toBe('default')
  })
})

// ── generateInsights — mínimo 2 ───────────────────────────────────────────────

describe('generateInsights — mínimo de 2 insights', () => {
  it('retorna 2 fallbacks quando todos os KPIs são zero', () => {
    const kpis = kpiBase({
      total_pedidos: 0, pedidos_abertos: 0, pedidos_atrasados: 0,
      pedidos_sem_exportador: 0, pedidos_cancelados: 0, valor_total: 0,
      qtd_pronta_total: 0, pedidos_importacao: 0, pedidos_exportacao: 0,
    })
    const result = generateInsights(kpis)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('retorna ao menos 2 quando apenas 1 candidato gerado', () => {
    const kpis = kpiBase({
      pedidos_atrasados: 3,
      pedidos_abertos: 0, pedidos_sem_exportador: 0, pedidos_cancelados: 0,
      valor_total: 0, qtd_pronta_total: 0,
      pedidos_importacao: 0, pedidos_exportacao: 0,
    })
    const result = generateInsights(kpis)
    expect(result.length).toBeGreaterThanOrEqual(2)
  })
})

// ── generateInsights — ranking por role ──────────────────────────────────────

describe('generateInsights — ranking por role', () => {
  it('operador: insight de atrasados é o primeiro quando há atrasados', () => {
    const kpis = kpiBase({ pedidos_atrasados: 5, pedidos_abertos: 3, valor_total: 200_000 })
    const result = generateInsights(kpis, 'operador')
    expect(result[0]!.id).toBe('atrasados')
  })

  it('gerente: insight financeiro é o primeiro quando há valor', () => {
    const kpis = kpiBase({ pedidos_atrasados: 2, valor_total: 500_000 })
    const result = generateInsights(kpis, 'gerente')
    expect(result[0]!.id).toBe('financeiro')
  })

  it('diretor: insight financeiro é o primeiro', () => {
    const kpis = kpiBase({
      pedidos_atrasados: 2,
      valor_total: 500_000,
      pedidos_importacao: 6,
      pedidos_exportacao: 4,
    })
    const result = generateInsights(kpis, 'diretor')
    expect(result[0]!.id).toBe('financeiro')
  })

  it('default: retorna insights válidos em alguma ordem', () => {
    const kpis = kpiBase({ pedidos_atrasados: 1, valor_total: 100_000 })
    const result = generateInsights(kpis, 'default')
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result.every(r => typeof r.id === 'string')).toBe(true)
  })
})

// ── generateInsights — behavior scores (Fase 2) ───────────────────────────────

describe('generateInsights — behavior scores multiplicam score base', () => {
  it('insight com score 2.5× sobe no ranking mesmo com peso base menor', () => {
    const kpis = kpiBase({ pedidos_atrasados: 3, valor_total: 500_000 })
    // Para gerente, financeiro tem peso 100 e atrasados tem peso 80
    // Com multiplicador 3.0 em atrasados → 80 * 3 = 240 > 100 → atrasados sobe
    const behaviorScores = { atrasados: 3.0 }
    const result = generateInsights(kpis, 'gerente', behaviorScores)
    expect(result[0]!.id).toBe('atrasados')
  })

  it('sem behavior scores, ranking segue pesos base', () => {
    const kpis = kpiBase({ pedidos_atrasados: 3, valor_total: 500_000 })
    const result = generateInsights(kpis, 'gerente', {})
    expect(result[0]!.id).toBe('financeiro')
  })

  it('insights sem score correspondente mantêm multiplicador 1.0', () => {
    const kpis = kpiBase({ pedidos_atrasados: 5 })
    const behaviorScores = { financeiro: 2.5 }  // só financeiro tem boost
    const result = generateInsights(kpis, 'operador', behaviorScores)
    // Para operador, atrasados tem peso 100 base → 100 * 1.0 = 100
    // financeiro tem peso 20 → 20 * 2.5 = 50 — ainda menor
    expect(result[0]!.id).toBe('atrasados')
  })
})

// ── generateInsights — conteúdo dos insights ─────────────────────────────────

describe('generateInsights — conteúdo dos insights', () => {
  it('insight atrasados contém número de pedidos no texto', () => {
    const kpis = kpiBase({ pedidos_atrasados: 7 })
    const result = generateInsights(kpis, 'operador')
    const atrasado = result.find(r => r.id === 'atrasados')
    expect(atrasado).toBeDefined()
    expect(atrasado!.texto).toContain('7')
    expect(atrasado!.variante).toBe('warn')
  })

  it('insight financeiro contém valor formatado em BRL', () => {
    const kpis = kpiBase({ valor_total: 1_500_000 })
    const result = generateInsights(kpis, 'gerente')
    const fin = result.find(r => r.id === 'financeiro')
    expect(fin).toBeDefined()
    expect(fin!.texto).toContain('R$')
  })

  it('insight distribuição mostra porcentagem de importação', () => {
    const kpis = kpiBase({ pedidos_importacao: 7, pedidos_exportacao: 3 })
    const result = generateInsights(kpis, 'diretor')
    const dist = result.find(r => r.id === 'distribuicao')
    expect(dist).toBeDefined()
    expect(dist!.texto).toContain('70%')
  })

  it('todos os insights têm id, variante, tag e texto', () => {
    const kpis = kpiBase({
      pedidos_atrasados: 2,
      pedidos_sem_exportador: 1,
      valor_total: 300_000,
    })
    const result = generateInsights(kpis, 'admin')
    for (const ins of result) {
      expect(ins.id).toBeTruthy()
      expect(['default', 'warn']).toContain(ins.variante)
      expect(ins.tag).toBeTruthy()
      expect(ins.texto).toBeTruthy()
      expect(typeof ins.score).toBe('number')
    }
  })
})
