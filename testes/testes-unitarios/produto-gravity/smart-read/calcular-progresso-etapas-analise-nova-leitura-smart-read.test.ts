import { describe, expect, it } from 'vitest'
import {
  calcularProgressoEtapasAnaliseNovaLeituraSmartRead,
  PROGRESSO_MAXIMO_ESTIMATIVA_ANALISE,
  TEMPO_ANALISE_PADRAO_ARQUIVO_MS,
  type ArquivoProgressoEtapasEntrada,
} from '../../../../servicos-global/produto/smart-read/client/src/shared/calcular-progresso-etapas-analise-nova-leitura-smart-read'

const AGORA = 1_700_000_000_000

function arquivo(parcial: Partial<ArquivoProgressoEtapasEntrada>): ArquivoProgressoEtapasEntrada {
  return { status_arquivo_local: 'analisando', progresso_envio: null, inicio_analise_ms: null, ...parcial }
}

describe('calcularProgressoEtapasAnaliseNovaLeituraSmartRead (progresso honesto)', () => {
  it('barra de envio reflete o progresso real de upload por arquivo', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [
        arquivo({ status_arquivo_local: 'enviando', progresso_envio: 40 }),
        arquivo({ status_arquivo_local: 'analisando', inicio_analise_ms: AGORA }),
      ],
      AGORA,
      null,
      false,
      false,
    )
    // (40 + 100) / 2 = 70 — média real, não cronômetro simulado
    expect(etapas[0].progresso).toBe(70)
    expect(etapas[0].rotulo).toBe('Envio dos arquivos')
    expect(etapas[0].status).toBe('andamento')
  })

  it('barra de análise é estimativa calibrada pela mediana e rotulada como tal', () => {
    const mediana = 60_000
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [arquivo({ inicio_analise_ms: AGORA - 30_000 })],
      AGORA,
      mediana,
      false,
      false,
    )
    expect(etapas[1].progresso).toBe(50)
    expect(etapas[1].estimativa).toBe(true)
    expect(etapas[1].status).toBe('andamento')
  })

  it('estimativa usa fallback de 30s por arquivo quando não há mediana histórica', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [arquivo({ inicio_analise_ms: AGORA - TEMPO_ANALISE_PADRAO_ARQUIVO_MS / 2 })],
      AGORA,
      null,
      false,
      false,
    )
    expect(etapas[1].progresso).toBe(50)
  })

  it('estimativa nunca passa do teto enquanto o DATI não confirma', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [arquivo({ inicio_analise_ms: AGORA - 10 * 60_000 })],
      AGORA,
      30_000,
      false,
      false,
    )
    expect(etapas[1].progresso).toBe(PROGRESSO_MAXIMO_ESTIMATIVA_ANALISE)
  })

  it('consolidação é fração real de arquivos completos e não fecha antes da análise completa', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [
        arquivo({ status_arquivo_local: 'completo' }),
        arquivo({ status_arquivo_local: 'analisando', inicio_analise_ms: AGORA }),
      ],
      AGORA,
      null,
      false,
      false,
    )
    expect(etapas[2].progresso).toBe(50)
    expect(etapas[2].rotulo).toBe('Consolidação dos resultados')
  })

  it('arquivo com erro sai das médias (não trava as barras abaixo de 100%)', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [
        arquivo({ status_arquivo_local: 'completo' }),
        arquivo({ status_arquivo_local: 'erro' }),
      ],
      AGORA,
      null,
      false,
      false,
    )
    expect(etapas[0].progresso).toBe(100)
    expect(etapas[1].progresso).toBe(100)
    expect(etapas[2].progresso).toBe(100)
  })

  it('análise completa fecha as três barras em 100% completo', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead([], AGORA, null, true, false)
    expect(etapas).toHaveLength(3)
    for (const etapa of etapas) {
      expect(etapa.progresso).toBe(100)
      expect(etapa.status).toBe('completo')
    }
  })

  it('processamento com erro total zera as barras', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [arquivo({ status_arquivo_local: 'erro' })],
      AGORA,
      null,
      false,
      true,
    )
    for (const etapa of etapas) {
      expect(etapa.progresso).toBe(0)
      expect(etapa.status).toBe('pendente')
    }
  })

  it('arquivo analisando sem carimbo de início não inventa progresso', () => {
    const etapas = calcularProgressoEtapasAnaliseNovaLeituraSmartRead(
      [arquivo({ inicio_analise_ms: null })],
      AGORA,
      30_000,
      false,
      false,
    )
    expect(etapas[1].progresso).toBe(0)
  })
})
