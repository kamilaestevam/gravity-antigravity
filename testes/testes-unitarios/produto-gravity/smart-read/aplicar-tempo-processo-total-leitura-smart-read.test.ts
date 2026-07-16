import { describe, expect, it } from 'vitest'
import {
  aplicarTempoProcessoTotalMsLeituraSmartRead,
  resolverTempoProcessoTotalMsLeituraSmartRead,
  resolverTempoProcessoTotalSegundosLeituraSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/aplicar-tempo-processo-total-leitura-smart-read.ts'

describe('Smart Read — tempo_processo_total_ms', () => {
  it('resolve tempo persistido na leitura', () => {
    expect(
      resolverTempoProcessoTotalMsLeituraSmartRead({ tempo_processo_total_ms: 125_000 }),
    ).toBe(125_000)
  })

  it('usa fallback quando leitura não tem tempo', () => {
    expect(resolverTempoProcessoTotalMsLeituraSmartRead(null, 42_000)).toBe(42_000)
  })

  it('aplica tempo no objeto leitura', () => {
    const leitura = aplicarTempoProcessoTotalMsLeituraSmartRead(
      { id_leitura: 'x', tempo_processo_total_ms: null },
      90_000,
    )
    expect(leitura.tempo_processo_total_ms).toBe(90_000)
  })

  it('converte ms para segundos', () => {
    expect(
      resolverTempoProcessoTotalSegundosLeituraSmartRead({ tempo_processo_total_ms: 61_500 }),
    ).toBe(61)
  })
})
