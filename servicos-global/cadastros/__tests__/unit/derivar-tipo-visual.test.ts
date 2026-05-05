import { describe, it, expect } from 'vitest'
import { derivarTipoVisual } from '../../server/src/utils/derivar-tipo-visual.js'

const flagsZeradas = {
  pode_ser_importador_empresa: false,
  pode_ser_exportador_empresa: false,
  pode_ser_fabricante_empresa: false,
  pode_ser_agente_empresa: false,
  pode_ser_despachante_empresa: false,
  pode_ser_armador_empresa: false,
  pode_ser_cia_aerea_empresa: false,
  pode_ser_transportadora_rodoviaria_nacional_empresa: false,
  pode_ser_transportadora_rodoviaria_internacional_empresa: false,
  pode_ser_armazem_alfandegado_empresa: false,
  pode_ser_armazem_nacional_empresa: false,
  pode_ser_banco_empresa: false,
  pode_ser_seguradora_internacional_empresa: false,
  pode_ser_seguradora_corretora_cambio_empresa: false,
}

describe('derivarTipoVisual', () => {
  it('retorna apenas Importador quando só essa flag está ligada', () => {
    expect(derivarTipoVisual({ ...flagsZeradas, pode_ser_importador_empresa: true })).toBe('Importador')
  })

  it('combina Importador + Exportador na ordem fixa', () => {
    expect(
      derivarTipoVisual({ ...flagsZeradas, pode_ser_importador_empresa: true, pode_ser_exportador_empresa: true }),
    ).toBe('Importador + Exportador')
  })

  it('mantém ordem fixa mesmo quando flags são ligadas em outra sequência', () => {
    expect(
      derivarTipoVisual({
        ...flagsZeradas,
        pode_ser_armador_empresa: true,
        pode_ser_importador_empresa: true,
        pode_ser_agente_empresa: true,
      }),
    ).toBe('Importador + Agente + Armador')
  })

  it('lista todos os papéis em ordem quando tudo está ligado', () => {
    const tudo = {
      pode_ser_importador_empresa: true,
      pode_ser_exportador_empresa: true,
      pode_ser_fabricante_empresa: true,
      pode_ser_agente_empresa: true,
      pode_ser_despachante_empresa: true,
      pode_ser_armador_empresa: true,
      pode_ser_cia_aerea_empresa: true,
      pode_ser_transportadora_rodoviaria_nacional_empresa: true,
      pode_ser_transportadora_rodoviaria_internacional_empresa: true,
      pode_ser_armazem_alfandegado_empresa: true,
      pode_ser_armazem_nacional_empresa: true,
      pode_ser_banco_empresa: true,
      pode_ser_seguradora_internacional_empresa: true,
      pode_ser_seguradora_corretora_cambio_empresa: true,
    }
    expect(derivarTipoVisual(tudo)).toBe(
      'Importador + Exportador + Agente + Armador + Armazém Alfandegado + Armazém Nacional + Banco + Cia Aérea + Despachante + Fabricante + Seguradora / Corretora de Câmbio + Seguradora Internacional + Transp. Rod. Internacional + Transp. Rod. Nacional',
    )
  })

  it('falha alto quando nenhuma flag está ativa (Mandamento 08)', () => {
    expect(() => derivarTipoVisual(flagsZeradas)).toThrow(/sem nenhuma flag/i)
  })
})
