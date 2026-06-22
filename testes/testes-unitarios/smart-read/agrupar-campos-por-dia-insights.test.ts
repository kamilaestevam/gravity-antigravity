import { describe, expect, it } from 'vitest'
import {
  FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA,
  gerarChavesDiasPeriodoCamposInsights,
  montarSerieCamposPorDiaInsights,
} from '../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/agrupar-campos-por-dia-insights-smart-read.ts'
import { extrairDocumentosInsightsDeLeituras } from '../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/extrair-dados-documento-leitura-smart-read.ts'
import { LEITURAS_FIXTURE_INSIGHTS } from './fixtures/leituras-fixture-insights-smart-read.ts'
import type { TransacaoLeitura } from '../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'

const REFERENCIA = new Date('2026-06-20T12:00:00.000Z')

function dataEnvioDiasAtras(dias: number): string {
  const data = new Date(REFERENCIA)
  data.setUTCDate(data.getUTCDate() - dias)
  return `${data.toISOString().slice(0, 10)}T14:00:00.000Z`
}

const transacoes: TransacaoLeitura[] = [
  {
    id_leitura: 'mock-leitura-bl-importacao',
    nome_leitura: 'Embarque BL',
    status_leitura: 'COMPLETED',
    total_arquivos: 2,
    media_acertos: null,
    data_envio: dataEnvioDiasAtras(5),
    origem_leitura: 'INTERFACE',
    nome_arquivo: 'pacote.pdf',
    mensagem_erro: null,
  },
  {
    id_leitura: 'mock-leitura-invoice-api',
    nome_leitura: 'Invoice API',
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    media_acertos: null,
    data_envio: dataEnvioDiasAtras(2),
    origem_leitura: 'API',
    nome_arquivo: 'invoices.zip',
    mensagem_erro: null,
  },
]

describe('Smart Read — série temporal de campos Insights', () => {
  it('padrão são últimos 7 dias', () => {
    expect(FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA).toEqual({ modo: 'preset', dias: 7 })
    const chaves = gerarChavesDiasPeriodoCamposInsights(FILTRO_PERIODO_PADRAO_CAMPOS_POR_DIA, REFERENCIA)
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
      transacoes,
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

  it('classifica documentos com e sem edição de campo', () => {
    const leituras = [LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao']]
    const documentos = extrairDocumentosInsightsDeLeituras(leituras)
    const serie = montarSerieCamposPorDiaInsights(documentos, transacoes, {
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
    const serie = montarSerieCamposPorDiaInsights(documentos, transacoes, {
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
      transacoes,
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
      transacoes,
      { modo: 'preset', dias: 90 },
      'mes',
    )

    expect(serie.length).toBeLessThanOrEqual(4)
    expect(serie.some((p) => p.total_campos > 0)).toBe(true)
  })
})
