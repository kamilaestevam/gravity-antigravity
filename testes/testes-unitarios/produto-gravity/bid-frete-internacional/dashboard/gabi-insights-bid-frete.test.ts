import { describe, expect, it } from 'vitest'
import {
  generateInsightsBidFreteInternacional,
  normalizeRoleBidFrete,
  type KpiSnapshotBidFrete,
} from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/services/gabi-insights-bid-frete-internacional'

function kpisBase(overrides: Partial<KpiSnapshotBidFrete> = {}): KpiSnapshotBidFrete {
  return {
    period: '30d',
    cotacoes_andamento: 0,
    cotacoes_passadas: 0,
    rascunhos: 0,
    aguardando_aprovacao: 0,
    saving_total: 0,
    saving_pct: 0,
    valor_andamento_usd: 0,
    valor_aprovado_usd: 0,
    valor_medio_ganho: 0,
    tempo_medio_resposta_dias: null,
    cotacoes_aprovadas: 0,
    pct_aprovacao_em_tempo: 100,
    ...overrides,
  }
}

describe('normalizeRoleBidFrete', () => {
  it('normaliza roles conhecidos', () => {
    expect(normalizeRoleBidFrete('operador')).toBe('operador')
    expect(normalizeRoleBidFrete('GERENTE_COMEX')).toBe('gerente')
    expect(normalizeRoleBidFrete('director')).toBe('diretor')
    expect(normalizeRoleBidFrete(undefined)).toBe('default')
  })
})

describe('generateInsightsBidFreteInternacional — mínimo de 2 insights', () => {
  it('retorna fallback quando não há sinais operacionais', () => {
    const result = generateInsightsBidFreteInternacional(kpisBase())
    expect(result.length).toBeGreaterThanOrEqual(2)
    expect(result[0]?.id).toBe('status_ok')
  })

  it('inclui insight de rascunhos quando há pendências', () => {
    const result = generateInsightsBidFreteInternacional(
      kpisBase({ rascunhos: 3 }),
      'operador',
    )
    expect(result.some(i => i.id === 'rascunhos_ativos')).toBe(true)
  })
})

describe('generateInsightsBidFreteInternacional — ranking por role', () => {
  const kpis = kpisBase({
    rascunhos: 2,
    saving_total: 50_000,
    cotacoes_andamento: 5,
    valor_andamento_usd: 120_000,
  })

  it('operador prioriza rascunhos sobre saving', () => {
    const result = generateInsightsBidFreteInternacional(kpis, 'operador')
    expect(result[0]?.id).toBe('rascunhos_ativos')
  })

  it('gerente prioriza saving sobre rascunhos', () => {
    const result = generateInsightsBidFreteInternacional(kpis, 'gerente')
    expect(result[0]?.id).toBe('saving_total')
  })

  it('não expõe score interno na resposta', () => {
    const result = generateInsightsBidFreteInternacional(kpis, 'gerente')
    for (const item of result) {
      expect('score' in item).toBe(false)
    }
  })
})

describe('generateInsightsBidFreteInternacional — tendência', () => {
  it('gera insight de tendência quando volume muda', () => {
    const atual = kpisBase({ cotacoes_passadas: 12 })
    const prev = kpisBase({ cotacoes_passadas: 8 })
    const result = generateInsightsBidFreteInternacional(atual, 'gerente', prev)
    expect(result.some(i => i.id === 'tendencia_volume')).toBe(true)
  })
})
