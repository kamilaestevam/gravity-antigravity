import { describe, expect, it } from 'vitest'
import {
  ERROS_EVITADOS_POR_10_000_CAMPOS_ESTUDO_SMART_READ,
  estimarCamposErradosEvitadosSmartRead,
  resolverContagemAcertoErroEstudoSmartRead,
} from '../../../../servicos-global/produto/smart-read/shared/dados-base-produto-tempo-smart-read.ts'

describe('Smart Read — taxa de erro do estudo (SSOT)', () => {
  it('3 erros evitados a cada 10.000 campos', () => {
    expect(ERROS_EVITADOS_POR_10_000_CAMPOS_ESTUDO_SMART_READ).toBe(3)
    expect(estimarCamposErradosEvitadosSmartRead(10_000)).toBe(3)
    expect(estimarCamposErradosEvitadosSmartRead(3_437)).toBe(1)
    expect(estimarCamposErradosEvitadosSmartRead(0)).toBe(0)
  })

  it('resolverContagemAcertoErroEstudoSmartRead distribui corretos e errados', () => {
    const contagem = resolverContagemAcertoErroEstudoSmartRead(10_000)
    expect(contagem.total).toBe(10_000)
    expect(contagem.errados).toBe(3)
    expect(contagem.corretos).toBe(9_997)
    expect(contagem.taxa_acerto).toBeCloseTo(9_997 / 10_000)
  })
})
