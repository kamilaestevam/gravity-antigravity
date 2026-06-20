import { describe, expect, it } from 'vitest'
import { calcularMetricasInsightsLeituraSmartRead } from '../../../servicos-global/produto/smart-read/client/src/pages/insights-smart-read/calcular-metricas-insights-leitura-smart-read.ts'
import type { TransacaoLeitura } from '../../../servicos-global/produto/smart-read/client/src/shared/schemas.ts'

const base: TransacaoLeitura = {
  id_leitura: 'id-1',
  nome_leitura: 'Teste',
  status_leitura: 'COMPLETED',
  total_arquivos: 2,
  media_acertos: 0.9,
  data_envio: '2026-06-18T10:00:00.000Z',
  origem_leitura: 'API',
  nome_arquivo: 'doc.pdf',
  mensagem_erro: null,
}

describe('Smart Read — métricas Insights', () => {
  it('agrupa status, origem e ordena recentes', () => {
    const transacoes: TransacaoLeitura[] = [
      base,
      {
        ...base,
        id_leitura: 'id-2',
        status_leitura: 'PROCESSING',
        origem_leitura: 'INTERFACE',
        data_envio: '2026-06-19T10:00:00.000Z',
        media_acertos: null,
      },
      {
        ...base,
        id_leitura: 'id-3',
        status_leitura: 'FAILED',
        origem_leitura: 'INTERFACE',
        data_envio: '2026-06-17T10:00:00.000Z',
        media_acertos: 0.8,
      },
    ]

    const metricas = calcularMetricasInsightsLeituraSmartRead(transacoes)

    expect(metricas.porStatus.COMPLETED).toBe(1)
    expect(metricas.porStatus.PROCESSING).toBe(1)
    expect(metricas.porStatus.FAILED).toBe(1)
    expect(metricas.porOrigem.api).toBe(1)
    expect(metricas.porOrigem.interface).toBe(2)
    expect(metricas.totalArquivos).toBe(6)
    expect(metricas.taxaConclusao).toBeCloseTo(1 / 3)
    expect(metricas.recentes[0]?.id_leitura).toBe('id-2')
  })
})
