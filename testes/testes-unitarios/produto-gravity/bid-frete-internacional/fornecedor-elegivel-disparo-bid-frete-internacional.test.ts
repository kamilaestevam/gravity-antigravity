import { describe, expect, it } from 'vitest'
import {
  fornecedorElegivelDisparoBidFreteInternacional,
  fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado,
  resolverElegibilidadeDisparoFornecedorBidFreteInternacional,
  type FlagsParceiroFreteCadastrosDisparo,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/fornecedor-elegivel-disparo-bid-frete-internacional'

function flags(overrides: Partial<FlagsParceiroFreteCadastrosDisparo> = {}): FlagsParceiroFreteCadastrosDisparo {
  return {
    pode_ser_agente_fornecedor: false,
    pode_ser_armador_fornecedor: false,
    pode_ser_cia_aerea_fornecedor: false,
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
    ...overrides,
  }
}

describe('fornecedor-elegivel-disparo-bid-frete-internacional', () => {
  it('agente, armador e cia aérea aparecem em qualquer modal', () => {
    for (const modal of ['MARITIMO', 'AEREO', 'RODOVIARIO'] as const) {
      expect(fornecedorElegivelDisparoBidFreteInternacional(modal, flags({ pode_ser_agente_fornecedor: true }))).toBe(true)
      expect(fornecedorElegivelDisparoBidFreteInternacional(modal, flags({ pode_ser_armador_fornecedor: true }))).toBe(true)
      expect(fornecedorElegivelDisparoBidFreteInternacional(modal, flags({ pode_ser_cia_aerea_fornecedor: true }))).toBe(true)
    }
  })

  it('transportadora internacional só no modal rodoviário', () => {
    const f = flags({ pode_ser_transportadora_rodoviaria_internacional_fornecedor: true })
    expect(fornecedorElegivelDisparoBidFreteInternacional('MARITIMO', f)).toBe(false)
    expect(fornecedorElegivelDisparoBidFreteInternacional('AEREO', f)).toBe(false)
    expect(fornecedorElegivelDisparoBidFreteInternacional('RODOVIARIO', f)).toBe(true)
  })

  it('transportadora nacional nunca elegível', () => {
    const f = flags({ pode_ser_transportadora_rodoviaria_nacional_fornecedor: true })
    for (const modal of ['MARITIMO', 'AEREO', 'RODOVIARIO'] as const) {
      expect(fornecedorElegivelDisparoBidFreteInternacional(modal, f)).toBe(false)
    }
  })

  it('nacional + internacional: internacional prevalece (rodoviário só no modal rodoviário)', () => {
    const f = flags({
      pode_ser_transportadora_rodoviaria_nacional_fornecedor: true,
      pode_ser_transportadora_rodoviaria_internacional_fornecedor: true,
    })
    expect(fornecedorElegivelDisparoBidFreteInternacional('MARITIMO', f)).toBe(false)
    expect(fornecedorElegivelDisparoBidFreteInternacional('RODOVIARIO', f)).toBe(true)
  })

  it('fallback por tipo colapsado: TRANSPORTADORA só rodoviário', () => {
    expect(fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado('MARITIMO', 'TRANSPORTADORA')).toBe(false)
    expect(fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado('RODOVIARIO', 'TRANSPORTADORA')).toBe(true)
    expect(fornecedorElegivelDisparoBidFreteInternacionalPorTipoColapsado('MARITIMO', 'ARMADOR')).toBe(true)
  })

  it('resolverElegibilidade usa flags quando presentes', () => {
    expect(
      resolverElegibilidadeDisparoFornecedorBidFreteInternacional('MARITIMO', {
        ...flags({ pode_ser_transportadora_rodoviaria_internacional_fornecedor: true }),
        tipo_fornecedor_bid_frete_internacional: 'AGENTE_CARGA',
      }),
    ).toBe(false)
  })
})
