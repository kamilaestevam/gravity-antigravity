import { describe, expect, it } from 'vitest'
import {
  calcularMetricasInsightsLeituraSmartRead,
  resolverRankingsParticipanteInsights,
} from '../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read.ts'
import { LEITURAS_FIXTURE_INSIGHTS } from './fixtures/leituras-fixture-insights-smart-read.ts'
import type { TransacaoLeitura } from '../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'

const transacoes: TransacaoLeitura[] = [
  {
    id_leitura: 'mock-leitura-bl-importacao',
    nome_leitura: 'Embarque BL',
    status_leitura: 'COMPLETED',
    total_arquivos: 2,
    media_acertos: 0.94,
    data_envio: '2026-06-10T14:32:00.000Z',
    origem_leitura: 'INTERFACE',
    nome_arquivo: 'pacote.pdf',
    mensagem_erro: null,
  },
  {
    id_leitura: 'mock-leitura-invoice-api',
    nome_leitura: 'Invoice API',
    status_leitura: 'COMPLETED',
    total_arquivos: 1,
    media_acertos: 0.88,
    data_envio: '2026-06-12T09:15:00.000Z',
    origem_leitura: 'API',
    nome_arquivo: 'invoices.zip',
    mensagem_erro: null,
  },
]

describe('Smart Read — métricas Insights (dashboard)', () => {
  it('calcula documentos, campos, savings e BL/AWB a partir das leituras detalhadas', () => {
    const leituras = [
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao'],
      LEITURAS_FIXTURE_INSIGHTS['mock-leitura-invoice-api'],
    ]

    const metricas = calcularMetricasInsightsLeituraSmartRead(leituras, transacoes)

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

  it('resolverRankingsParticipanteInsights usa fallback legado sem rankingsPorParticipante', () => {
    const leituras = [LEITURAS_FIXTURE_INSIGHTS['mock-leitura-bl-importacao']]
    const metricas = calcularMetricasInsightsLeituraSmartRead(leituras, transacoes)
    const legado = { ...metricas, rankingsPorParticipante: undefined } as typeof metricas

    const { acertos, erros } = resolverRankingsParticipanteInsights(legado, 'exportador')

    expect(acertos).toEqual(metricas.rankingsExportadorAcerto)
    expect(erros).toEqual(metricas.rankingsExportador)
  })
})
