import { describe, expect, it } from 'vitest'
import {
  FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA,
  gerarChavesDiasPeriodoCamposInsights,
  montarSerieCamposPorDiaInsights,
} from '../../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/agrupar-campos-por-dia-insights-smart-read.ts'
import { extrairDocumentosInsightsDeLeituras } from '../../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/extrair-dados-documento-leitura-smart-read.ts'
import { LEITURAS_FIXTURE_INSIGHTS } from './fixtures/leituras-fixture-insights-smart-read.ts'
import {
  REFERENCIA_INSIGHTS_TESTE,
  TRANSACOES_FIXTURE_INSIGHTS,
  TRANSACOES_FIXTURE_INSIGHTS_COM_METRICAS,
} from './fixtures/transacoes-fixture-insights-smart-read.ts'

describe('Smart Read — série temporal de campos Insights', () => {
  it('padrão são últimos 7 dias', () => {
    expect(FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA).toEqual({ modo: 'preset', dias: 7 })
    const chaves = gerarChavesDiasPeriodoCamposInsights(FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA, REFERENCIA_INSIGHTS_TESTE)
    expect(chaves).toHaveLength(7)
    expect(chaves[6]).toBe('2026-06-20')
  })

  it('agrega campos por data_envio da leitura', () => {
    const leituras = [
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao'],
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-invoice-api'],
    ]
    const documentos = extrairDocumentosInsightsDeLeituras(leituras)
    const serie = montarSerieCamposPorDiaInsights(
      documentos,
      TRANSACOES_FIXTURE_INSIGHTS,
      {
        modo: 'intervalo',
        data_inicio: '2026-06-10',
        data_fim: '2026-06-20',
      },
      'dia',
    )

    const dia15 = serie.find((p) => p.chave_periodo === '2026-06-15')
    const dia18 = serie.find((p) => p.chave_periodo === '2026-06-18')

    expect(dia15?.documentos).toBeGreaterThan(0)
    expect(dia15?.total_campos).toBeGreaterThan(0)
    expect(dia15?.documentos_sem_erro + dia15?.documentos_com_erro).toBe(dia15?.documentos)
    expect(dia18?.documentos).toBeGreaterThan(0)
  })

  it('fallback de série por TransacaoLeitura quando documentos vazios', () => {
    const serie = montarSerieCamposPorDiaInsights(
      [],
      TRANSACOES_FIXTURE_INSIGHTS_COM_METRICAS,
      {
        modo: 'intervalo',
        data_inicio: '2026-06-10',
        data_fim: '2026-06-20',
      },
      'dia',
    )

    const dia15 = serie.find((p) => p.chave_periodo === '2026-06-15')
    const dia18 = serie.find((p) => p.chave_periodo === '2026-06-18')

    expect(dia15?.total_campos).toBe(88)
    expect(dia15?.documentos).toBe(4)
    expect(dia18?.total_campos).toBe(24)
    expect(dia18?.documentos).toBe(1)
  })

  it('classifica documentos com e sem edição de campo', () => {
    const leituras = [LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao']]
    const documentos = extrairDocumentosInsightsDeLeituras(leituras)
    const serie = montarSerieCamposPorDiaInsights(documentos, TRANSACOES_FIXTURE_INSIGHTS, {
      modo: 'intervalo',
      data_inicio: '2026-06-10',
      data_fim: '2026-06-20',
    })

    const diaComDados = serie.find((p) => p.documentos > 0)
    expect(diaComDados).toBeDefined()
    expect(diaComDados!.documentos_sem_erro + diaComDados!.documentos_com_erro).toBe(diaComDados!.documentos)
  })

  it('intervalo personalizado gera um ponto por dia', () => {
    const leituras = [LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao']]
    const documentos = extrairDocumentosInsightsDeLeituras(leituras)
    const serie = montarSerieCamposPorDiaInsights(documentos, TRANSACOES_FIXTURE_INSIGHTS, {
      modo: 'intervalo',
      data_inicio: '2026-06-13',
      data_fim: '2026-06-17',
    })

    expect(serie).toHaveLength(5)
    expect(serie[2]?.chave_periodo).toBe('2026-06-15')
  })

  it('granularidade semana agrega pontos diários', () => {
    const leituras = [
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao'],
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-invoice-api'],
    ]
    const documentos = extrairDocumentosInsightsDeLeituras(leituras)
    const serie = montarSerieCamposPorDiaInsights(
      documentos,
      TRANSACOES_FIXTURE_INSIGHTS,
      { modo: 'preset', dias: 30 },
      'semana',
    )

    expect(serie.length).toBeLessThan(30)
    expect(serie.some((p) => p.total_campos > 0)).toBe(true)
  })

  it('granularidade mês agrega pontos diários', () => {
    const leituras = [
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao'],
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-invoice-api'],
    ]
    const documentos = extrairDocumentosInsightsDeLeituras(leituras)
    const serie = montarSerieCamposPorDiaInsights(
      documentos,
      TRANSACOES_FIXTURE_INSIGHTS,
      { modo: 'preset', dias: 90 },
      'mes',
    )

    expect(serie.length).toBeLessThanOrEqual(4)
    expect(serie.some((p) => p.total_campos > 0)).toBe(true)
  })
})
