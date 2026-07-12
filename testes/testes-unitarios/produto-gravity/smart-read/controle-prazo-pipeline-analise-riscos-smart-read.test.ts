import { describe, expect, it, vi, afterEach } from 'vitest'
import {
  criarControlePrazoPipelineAnaliseRiscos,
  PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS,
} from '../../../../servicos-global/produto/smart-read/server/src/lib/controle-prazo-pipeline-analise-riscos-smart-read.ts'

describe('controle-prazo-pipeline-analise-riscos-smart-read', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('expõe prazo padrão de 70s alinhado ao SLA do wizard', () => {
    expect(PRAZO_MAXIMO_PIPELINE_ANALISE_RISCOS_MS).toBe(70_000)
  })

  it('marca esgotado após ultrapassar o prazo', () => {
    vi.useFakeTimers()
    const prazo = criarControlePrazoPipelineAnaliseRiscos(1_000)

    expect(prazo.esgotado()).toBe(false)
    vi.advanceTimersByTime(1_001)
    expect(prazo.esgotado()).toBe(true)
    expect(prazo.restanteMs()).toBe(0)
  })

  it('preserva aviso existente ao marcar esgotado', () => {
    const prazo = criarControlePrazoPipelineAnaliseRiscos(0)
    expect(prazo.marcarAvisoEsgotado('Aviso anterior')).toBe('Aviso anterior')
    expect(prazo.marcarAvisoEsgotado(null)).toContain('prazo máximo de análise (70s)')
  })
})
