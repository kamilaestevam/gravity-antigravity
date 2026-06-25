import { describe, expect, it } from 'vitest'
import { agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead } from '../../../../servicos-global/produto/smart-read/shared/metricas-transacao-leitura-smart-read.ts'
import { calcularMediasTabelaBaseCalculoSmartRead } from '../../../../servicos-global/produto/smart-read/shared/dados-base-produto-tempo-smart-read.ts'

describe('agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead', () => {
  it('agrega tempo real em segundos por tipo a partir das leituras visíveis', () => {
    const agregado = agregarTempoExtracaoIaMedioPorTipoLeituraSmartRead([
      {
        total_documentos: 1,
        tempo_extracao_ia_ms: 45_000,
        tipos_documento: 'Bill of Lading',
      },
      {
        total_documentos: 1,
        tempo_extracao_ia_ms: 90_000,
        tipos_documento: 'AWB',
      },
    ])

    expect(agregado.por_tipo.bl?.tempo_medio_segundos).toBe(45)
    expect(agregado.por_tipo.awb?.tempo_medio_segundos).toBe(90)
    expect(agregado.media_ponderada_segundos).toBe(67.5)
    expect(agregado.documentos_amostra).toBe(2)
  })
})

describe('calcularMediasTabelaBaseCalculoSmartRead', () => {
  it('retorna médias aritméticas das linhas da tabela', () => {
    const medias = calcularMediasTabelaBaseCalculoSmartRead()
    expect(medias.tempo_digitação_manual_minutos).toBeGreaterThan(0)
    expect(medias.tempo_correcao_erro_manual_minutos_por_campo).toBeGreaterThan(0)
  })
})
