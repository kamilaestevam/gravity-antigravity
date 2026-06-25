import { describe, expect, it } from 'vitest'
import {
  calcularMetricasTransacaoLeituraSmartRead,
  calcularRecursosReduzidosPorTempoLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/metricas-transacao-leitura-smart-read.ts'
import { LEITURAS_FIXTURE_INSIGHTS } from './fixtures/leituras-fixture-insights-smart-read.ts'

describe('calcularMetricasTransacaoLeituraSmartRead', () => {
  it('agrega documentos, campos, tipos, saving e tempos por leitura', () => {
    const leitura = LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao']
    const metricas = calcularMetricasTransacaoLeituraSmartRead(leitura, {
      created_at: '2026-06-21T10:00:00.000Z',
      completed_at: '2026-06-21T10:12:00.000Z',
    })

    expect(metricas.total_documentos).toBe(4)
    expect(metricas.total_campos_extraidos).toBeGreaterThan(0)
    expect(metricas.total_campos_corretos).toBeGreaterThan(0)
    expect(metricas.tipos_documento).toContain('Bill of Lading')
    expect(metricas.numeros_documento).toContain('GWW-375555')
    expect(metricas.numeros_documento).toContain('ISA-002036')
    expect(metricas.tipos_documento).toContain('Invoice')
    expect(metricas.tempo_processo_total_ms).toBe(12 * 60 * 1000)
    expect(metricas.saving_total_minutos).toBeGreaterThan(0)
    expect(metricas.saving_total_brl).toBeGreaterThan(0)
  })
})

describe('calcularRecursosReduzidosPorTempoLeituraSmartRead', () => {
  it('usa base manual fixa por documento menos o tempo de leitura medido', () => {
    const saving = calcularRecursosReduzidosPorTempoLeituraSmartRead(
      [{ tipo_documento: 'Bill of Lading' }],
      9,
    )

    expect(saving).not.toBeNull()
    expect(saving!.saving_total_minutos).toBeCloseTo(12.1 - 9 / 60, 5)
    expect(saving!.saving_total_brl).toBeGreaterThan(0)
  })
})
