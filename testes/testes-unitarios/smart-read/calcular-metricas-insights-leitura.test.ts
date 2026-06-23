import { describe, expect, it } from 'vitest'
import {
  calcularMetricasInsightsLeituraSmartRead,
  resolverRankingsParticipanteInsights,
} from '../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read.ts'
import { LEITURAS_FIXTURE_INSIGHTS } from './fixtures/leituras-fixture-insights-smart-read.ts'
import {
  TRANSACOES_FIXTURE_INSIGHTS,
  TRANSACOES_FIXTURE_INSIGHTS_COM_METRICAS,
} from './fixtures/transacoes-fixture-insights-smart-read.ts'

describe('Smart Read — métricas Insights (dashboard)', () => {
  it('calcula documentos, campos, savings e BL/AWB a partir das leituras detalhadas', () => {
    const leituras = [
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao'],
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-invoice-api'],
    ]

    const metricas = calcularMetricasInsightsLeituraSmartRead(leituras, TRANSACOES_FIXTURE_INSIGHTS)

    expect(metricas.totalDocumentos).toBeGreaterThan(0)
    expect(metricas.totalCampos).toBeGreaterThan(0)
    expect(metricas.camposCorretos).toBeGreaterThan(0)
    expect(metricas.savingDigitaçãoMinutos).toBeGreaterThan(0)
    expect(metricas.savingErrosMinutos).toBeGreaterThan(0)
    expect(metricas.camposErrados).toBeGreaterThan(0)
    expect(metricas.porTipoDocumento.length).toBeGreaterThan(0)
    expect(metricas.blAwb.bl.documentos).toBeGreaterThanOrEqual(1)
    expect(metricas.blAwb.awb.documentos).toBeGreaterThanOrEqual(1)
    expect(metricas.rankingsExportador.length).toBeGreaterThan(0)
    expect(metricas.rankingsPorParticipante.exportador.acertos.length).toBeGreaterThan(0)
  })

  it('fallback de métricas a partir de TransacaoLeitura quando leituras detalhe vazias', () => {
    const metricas = calcularMetricasInsightsLeituraSmartRead([], TRANSACOES_FIXTURE_INSIGHTS_COM_METRICAS)

    expect(metricas.totalDocumentos).toBe(5)
    expect(metricas.totalCampos).toBe(112)
    expect(metricas.camposCorretos).toBe(92)
    expect(metricas.camposErrados).toBe(20)
    expect(metricas.taxaAcertoCampos).toBeCloseTo(92 / 112)
    expect(metricas.savingDigitaçãoMinutos).toBe(40)
    expect(metricas.savingDigitaçãoCustoBrl).toBe(120)
    expect(metricas.porTipoDocumento.length).toBeGreaterThan(0)
    expect(metricas.rankingsExportador).toHaveLength(0)
    expect(metricas.documentos).toHaveLength(0)
    expect(metricas.amostraLeituras).toBe(2)
  })

  it('resolverRankingsParticipanteInsights usa fallback legado sem rankingsPorParticipante', () => {
    const leituras = [LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao']]
    const metricas = calcularMetricasInsightsLeituraSmartRead(leituras, TRANSACOES_FIXTURE_INSIGHTS)
    const legado = { ...metricas, rankingsPorParticipante: undefined } as typeof metricas

    const { acertos, erros } = resolverRankingsParticipanteInsights(legado, 'exportador')

    expect(acertos).toEqual(metricas.rankingsExportadorAcerto)
    expect(erros).toEqual(metricas.rankingsExportador)
  })
})
