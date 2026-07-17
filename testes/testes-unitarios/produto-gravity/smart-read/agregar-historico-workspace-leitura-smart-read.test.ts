import { describe, expect, it } from 'vitest'
import {
  calcularMedianaTempoAnaliseMsSmartRead,
  resolverDataInicioHistoricoSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/agregar-historico-workspace-leitura-smart-read'

describe('calcularMedianaTempoAnaliseMsSmartRead', () => {
  it('retorna null sem amostras válidas', () => {
    expect(calcularMedianaTempoAnaliseMsSmartRead([])).toBeNull()
    expect(calcularMedianaTempoAnaliseMsSmartRead([null, undefined, 0, -5])).toBeNull()
  })

  it('mediana de quantidade ímpar é o valor central', () => {
    expect(calcularMedianaTempoAnaliseMsSmartRead([10_000, 90_000, 30_000])).toBe(30_000)
  })

  it('mediana de quantidade par é a média dos dois centrais', () => {
    expect(calcularMedianaTempoAnaliseMsSmartRead([10_000, 20_000, 40_000, 90_000])).toBe(30_000)
  })

  it('ignora nulos e zeros misturados às amostras válidas', () => {
    expect(calcularMedianaTempoAnaliseMsSmartRead([null, 0, 25_000, undefined, 35_000])).toBe(30_000)
  })
})

describe('resolverDataInicioHistoricoSmartRead', () => {
  it('retorna null sem datas válidas', () => {
    expect(resolverDataInicioHistoricoSmartRead([])).toBeNull()
    expect(resolverDataInicioHistoricoSmartRead([null, undefined, 'nao-e-data'])).toBeNull()
  })

  it('retorna a menor data ISO', () => {
    expect(
      resolverDataInicioHistoricoSmartRead([
        '2026-07-10T12:00:00.000Z',
        '2026-05-02T08:00:00.000Z',
        null,
        '2026-06-01T00:00:00.000Z',
      ]),
    ).toBe('2026-05-02T08:00:00.000Z')
  })
})
